import { Request, Response } from 'express';
import { PrismaClient, PurchaseStatus } from '@prisma/client';

const prisma = new PrismaClient();

export class EnrollmentController {
  /**
   * GET /api/enrollments
   * Get current user's enrollments
   */
  getMyEnrollments = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;

      const enrollments = await prisma.enrollment.findMany({
        where: { userId },
        include: {
          course: {
            include: {
              modules: {
                include: {
                  videos: {
                    select: { id: true },
                  },
                },
              },
            },
          },
        },
        orderBy: { enrolledAt: 'desc' },
      });

      // Calculate progress for each enrollment
      const enrollmentsWithProgress = await Promise.all(
        enrollments.map(async enrollment => {
          const totalVideos = enrollment.course.modules.reduce(
            (acc, module) => acc + module.videos.length,
            0
          );

          const completedVideos = await prisma.videoProgress.count({
            where: {
              userId,
              isCompleted: true,
              video: {
                module: { courseId: enrollment.courseId },
              },
            },
          });

          const progress = totalVideos > 0 
            ? Math.round((completedVideos / totalVideos) * 100) 
            : 0;

          return {
            id: enrollment.id,
            enrolledAt: enrollment.enrolledAt,
            completedAt: enrollment.completedAt,
            course: {
              id: enrollment.course.id,
              title: enrollment.course.title,
              category: enrollment.course.category,
              level: enrollment.course.level,
              thumbnailUrl: enrollment.course.thumbnailUrl,
              durationHours: enrollment.course.durationHours,
            },
            progress,
            totalVideos,
            completedVideos,
          };
        })
      );

      res.json(enrollmentsWithProgress);
    } catch (error) {
      console.error('Get enrollments error:', error);
      res.status(500).json({ error: 'Failed to fetch enrollments' });
    }
  };

  /**
   * POST /api/enrollments
   * Enroll in a course (handles purchase)
   */
  enrollInCourse = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { courseId, paymentId, paymentProvider } = req.body;

      if (!courseId) {
        res.status(400).json({ error: 'Course ID is required' });
        return;
      }

      // Check if course exists and is visible
      const course = await prisma.course.findUnique({
        where: { id: courseId },
      });

      if (!course || !course.isVisible) {
        res.status(404).json({ error: 'Course not found' });
        return;
      }

      // Check if already enrolled
      const existingEnrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: { userId, courseId },
        },
      });

      if (existingEnrollment) {
        res.status(409).json({ error: 'Already enrolled in this course' });
        return;
      }

      // Create purchase record and enrollment in transaction
      const result = await prisma.$transaction(async tx => {
        // Create purchase
        const purchase = await tx.purchase.create({
          data: {
            userId,
            courseId,
            amount: course.price,
            status: PurchaseStatus.COMPLETED, // In real app, verify payment first
            paymentProvider: paymentProvider || 'demo',
            paymentId: paymentId || `demo_${Date.now()}`,
          },
        });

        // Create enrollment
        const enrollment = await tx.enrollment.create({
          data: {
            userId,
            courseId,
          },
          include: {
            course: {
              select: {
                id: true,
                title: true,
                category: true,
              },
            },
          },
        });

        return { purchase, enrollment };
      });

      res.status(201).json({
        message: 'Successfully enrolled',
        enrollment: result.enrollment,
        purchaseId: result.purchase.id,
      });
    } catch (error) {
      console.error('Enrollment error:', error);
      res.status(500).json({ error: 'Failed to enroll in course' });
    }
  };

  /**
   * GET /api/enrollments/:courseId
   * Get enrollment details for a specific course
   */
  getEnrollmentDetails = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { courseId } = req.params;

      const enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: { userId, courseId },
        },
        include: {
          course: {
            include: {
              modules: {
                include: {
                  videos: true,
                },
                orderBy: { sortOrder: 'asc' },
              },
            },
          },
        },
      });

      if (!enrollment) {
        res.status(404).json({ error: 'Enrollment not found' });
        return;
      }

      // Get progress
      const progress = await prisma.videoProgress.findMany({
        where: {
          userId,
          video: {
            module: { courseId },
          },
        },
      });

      res.json({
        enrollment,
        progress,
      });
    } catch (error) {
      console.error('Get enrollment details error:', error);
      res.status(500).json({ error: 'Failed to fetch enrollment details' });
    }
  };

  /**
   * DELETE /api/enrollments/:courseId
   * Unenroll from a course (admin or refund scenario)
   */
  unenroll = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { courseId } = req.params;

      const enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: { userId, courseId },
        },
      });

      if (!enrollment) {
        res.status(404).json({ error: 'Enrollment not found' });
        return;
      }

      // Delete enrollment and related progress
      await prisma.$transaction([
        prisma.videoProgress.deleteMany({
          where: {
            userId,
            video: {
              module: { courseId },
            },
          },
        }),
        prisma.enrollment.delete({
          where: { id: enrollment.id },
        }),
      ]);

      res.json({ message: 'Successfully unenrolled' });
    } catch (error) {
      console.error('Unenroll error:', error);
      res.status(500).json({ error: 'Failed to unenroll' });
    }
  };
}
