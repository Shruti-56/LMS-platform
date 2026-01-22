import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class UserController {
  /**
   * GET /api/users/profile
   * Get current user's profile
   */
  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
          enrollments: {
            include: {
              course: {
                select: {
                  id: true,
                  title: true,
                  category: true,
                  thumbnailUrl: true,
                },
              },
            },
          },
          certificates: {
            include: {
              course: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({
        id: user.id,
        email: user.email,
        roles: user.roles,
        createdAt: user.createdAt,
        profile: user.profile,
        enrolledCourses: user.enrollments.map(e => e.course),
        certificates: user.certificates.map(c => ({
          id: c.id,
          course: c.course,
          issuedAt: c.issuedAt,
          certificateUrl: c.certificateUrl,
        })),
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  };

  /**
   * PUT /api/users/profile
   * Update current user's profile
   */
  updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { fullName, bio, avatarUrl } = req.body;

      const profile = await prisma.profile.upsert({
        where: { userId },
        update: {
          ...(fullName && { fullName }),
          ...(bio !== undefined && { bio }),
          ...(avatarUrl !== undefined && { avatarUrl }),
        },
        create: {
          userId,
          fullName: fullName || 'User',
          bio,
          avatarUrl,
        },
      });

      res.json(profile);
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  };

  /**
   * GET /api/users/certificates
   * Get current user's certificates
   */
  getCertificates = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;

      const certificates = await prisma.certificate.findMany({
        where: { userId },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              category: true,
              level: true,
              thumbnailUrl: true,
            },
          },
        },
        orderBy: { issuedAt: 'desc' },
      });

      res.json(certificates);
    } catch (error) {
      console.error('Get certificates error:', error);
      res.status(500).json({ error: 'Failed to fetch certificates' });
    }
  };

  /**
   * GET /api/users/dashboard
   * Get dashboard statistics for current user
   */
  getDashboardStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;

      // Get enrollments with course info
      const enrollments = await prisma.enrollment.findMany({
        where: { userId },
        include: {
          course: {
            include: {
              modules: {
                include: {
                  videos: { select: { id: true } },
                },
              },
            },
          },
        },
      });

      // Get all completed videos
      const completedVideos = await prisma.videoProgress.findMany({
        where: {
          userId,
          isCompleted: true,
        },
        include: {
          video: {
            include: {
              module: true,
            },
          },
        },
        orderBy: { completedAt: 'desc' },
        take: 5,
      });

      // Calculate stats
      const completedVideoIds = new Set(completedVideos.map(v => v.videoId));
      let totalVideos = 0;
      let totalCompleted = 0;

      enrollments.forEach(enrollment => {
        enrollment.course.modules.forEach(module => {
          totalVideos += module.videos.length;
          module.videos.forEach(video => {
            if (completedVideoIds.has(video.id)) {
              totalCompleted++;
            }
          });
        });
      });

      // Get recently watched
      const recentProgress = await prisma.videoProgress.findFirst({
        where: { userId },
        include: {
          video: {
            include: {
              module: {
                include: { course: true },
              },
            },
          },
        },
        orderBy: { lastWatchedAt: 'desc' },
      });

      res.json({
        enrolledCourses: enrollments.length,
        completedCourses: enrollments.filter(e => e.completedAt).length,
        totalVideos,
        completedVideos: totalCompleted,
        overallProgress: totalVideos > 0
          ? Math.round((totalCompleted / totalVideos) * 100)
          : 0,
        recentlyWatched: recentProgress ? {
          video: recentProgress.video,
          course: recentProgress.video.module.course,
          watchedAt: recentProgress.lastWatchedAt,
        } : null,
        recentCompletions: completedVideos.slice(0, 5).map(v => ({
          videoTitle: v.video.title,
          moduleTitle: v.video.module.title,
          completedAt: v.completedAt,
        })),
      });
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
  };
}
