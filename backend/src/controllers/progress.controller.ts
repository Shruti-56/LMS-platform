import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ProgressController {
  /**
   * GET /api/progress/course/:courseId
   * Get progress for a specific course
   */
  getCourseProgress = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { courseId } = req.params;

      // Verify enrollment
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: { userId, courseId },
        },
      });

      if (!enrollment) {
        res.status(403).json({ error: 'Not enrolled in this course' });
        return;
      }

      // Get all videos in course
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
          modules: {
            include: {
              videos: {
                select: { id: true, title: true, durationMinutes: true },
                orderBy: { sortOrder: 'asc' },
              },
            },
            orderBy: { sortOrder: 'asc' },
          },
        },
      });

      if (!course) {
        res.status(404).json({ error: 'Course not found' });
        return;
      }

      // Get progress for all videos
      const videoProgress = await prisma.videoProgress.findMany({
        where: {
          userId,
          video: {
            module: { courseId },
          },
        },
      });

      const progressMap = new Map(videoProgress.map(p => [p.videoId, p]));

      // Calculate module progress
      const modulesWithProgress = course.modules.map(module => {
        const videosWithProgress = module.videos.map(video => ({
          ...video,
          isCompleted: progressMap.get(video.id)?.isCompleted || false,
          watchTimeSeconds: progressMap.get(video.id)?.watchTimeSeconds || 0,
        }));

        const completedInModule = videosWithProgress.filter(v => v.isCompleted).length;
        const moduleProgress = module.videos.length > 0
          ? Math.round((completedInModule / module.videos.length) * 100)
          : 0;

        return {
          id: module.id,
          title: module.title,
          videos: videosWithProgress,
          progress: moduleProgress,
          completedCount: completedInModule,
          totalCount: module.videos.length,
        };
      });

      // Calculate overall progress
      const totalVideos = course.modules.reduce((acc, m) => acc + m.videos.length, 0);
      const completedVideos = videoProgress.filter(p => p.isCompleted).length;
      const overallProgress = totalVideos > 0
        ? Math.round((completedVideos / totalVideos) * 100)
        : 0;

      res.json({
        courseId,
        courseTitle: course.title,
        overallProgress,
        totalVideos,
        completedVideos,
        modules: modulesWithProgress,
      });
    } catch (error) {
      console.error('Get course progress error:', error);
      res.status(500).json({ error: 'Failed to fetch progress' });
    }
  };

  /**
   * POST /api/progress/video/:videoId/complete
   * Mark a video as completed
   */
  markVideoComplete = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { videoId } = req.params;

      // Get video and verify enrollment
      const video = await prisma.video.findUnique({
        where: { id: videoId },
        include: {
          module: {
            include: { course: true },
          },
        },
      });

      if (!video) {
        res.status(404).json({ error: 'Video not found' });
        return;
      }

      const enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId: video.module.courseId,
          },
        },
      });

      if (!enrollment) {
        res.status(403).json({ error: 'Not enrolled in this course' });
        return;
      }

      // Upsert progress
      const progress = await prisma.videoProgress.upsert({
        where: {
          userId_videoId: { userId, videoId },
        },
        update: {
          isCompleted: true,
          completedAt: new Date(),
          lastWatchedAt: new Date(),
        },
        create: {
          userId,
          videoId,
          isCompleted: true,
          completedAt: new Date(),
        },
      });

      // Check if course is now complete
      const courseId = video.module.courseId;
      const totalVideos = await prisma.video.count({
        where: {
          module: { courseId },
        },
      });

      const completedVideos = await prisma.videoProgress.count({
        where: {
          userId,
          isCompleted: true,
          video: {
            module: { courseId },
          },
        },
      });

      // If all videos complete, update enrollment and create certificate
      if (completedVideos === totalVideos) {
        await prisma.$transaction([
          prisma.enrollment.update({
            where: {
              userId_courseId: { userId, courseId },
            },
            data: { completedAt: new Date() },
          }),
          prisma.certificate.upsert({
            where: {
              userId_courseId: { userId, courseId },
            },
            update: {},
            create: {
              userId,
              courseId,
            },
          }),
        ]);
      }

      res.json({
        progress,
        courseCompleted: completedVideos === totalVideos,
        completedVideos,
        totalVideos,
      });
    } catch (error) {
      console.error('Mark video complete error:', error);
      res.status(500).json({ error: 'Failed to update progress' });
    }
  };

  /**
   * POST /api/progress/video/:videoId/progress
   * Update watch progress for a video
   */
  updateWatchProgress = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { videoId } = req.params;
      const { watchTimeSeconds } = req.body;

      if (typeof watchTimeSeconds !== 'number') {
        res.status(400).json({ error: 'watchTimeSeconds is required' });
        return;
      }

      const progress = await prisma.videoProgress.upsert({
        where: {
          userId_videoId: { userId, videoId },
        },
        update: {
          watchTimeSeconds,
          lastWatchedAt: new Date(),
        },
        create: {
          userId,
          videoId,
          watchTimeSeconds,
        },
      });

      res.json(progress);
    } catch (error) {
      console.error('Update watch progress error:', error);
      res.status(500).json({ error: 'Failed to update progress' });
    }
  };

  /**
   * GET /api/progress/overall
   * Get overall learning progress across all courses
   */
  getOverallProgress = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;

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

      const completedProgress = await prisma.videoProgress.findMany({
        where: {
          userId,
          isCompleted: true,
        },
      });

      const completedVideoIds = new Set(completedProgress.map(p => p.videoId));

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

      const completedCourses = enrollments.filter(e => e.completedAt !== null).length;

      res.json({
        enrolledCourses: enrollments.length,
        completedCourses,
        totalVideos,
        completedVideos: totalCompleted,
        overallProgress: totalVideos > 0
          ? Math.round((totalCompleted / totalVideos) * 100)
          : 0,
      });
    } catch (error) {
      console.error('Get overall progress error:', error);
      res.status(500).json({ error: 'Failed to fetch overall progress' });
    }
  };
}
