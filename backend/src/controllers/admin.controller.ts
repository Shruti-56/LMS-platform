import { Request, Response } from 'express';
import { PrismaClient, CourseCategory, CourseLevel, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

export class AdminController {
  // ============================================
  // DASHBOARD
  // ============================================

  /**
   * GET /api/admin/dashboard
   * Get admin dashboard statistics
   */
  getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
    try {
      const [
        totalStudents,
        totalCourses,
        totalEnrollments,
        totalRevenue,
        recentEnrollments,
      ] = await Promise.all([
        prisma.user.count({
          where: { roles: { has: UserRole.STUDENT } },
        }),
        prisma.course.count(),
        prisma.enrollment.count(),
        prisma.purchase.aggregate({
          _sum: { amount: true },
          where: { status: 'COMPLETED' },
        }),
        prisma.enrollment.findMany({
          take: 10,
          orderBy: { enrolledAt: 'desc' },
          include: {
            user: {
              include: { profile: true },
            },
            course: {
              select: { title: true },
            },
          },
        }),
      ]);

      // Calculate average completion rate
      const enrollmentsWithProgress = await prisma.enrollment.findMany({
        where: { completedAt: { not: null } },
      });
      const completionRate = totalEnrollments > 0
        ? Math.round((enrollmentsWithProgress.length / totalEnrollments) * 100)
        : 0;

      res.json({
        totalStudents,
        totalCourses,
        totalEnrollments,
        totalRevenue: totalRevenue._sum.amount || 0,
        completionRate,
        recentEnrollments: recentEnrollments.map(e => ({
          studentName: e.user.profile?.fullName || e.user.email,
          courseTitle: e.course.title,
          enrolledAt: e.enrolledAt,
        })),
      });
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
  };

  // ============================================
  // COURSE MANAGEMENT
  // ============================================

  /**
   * GET /api/admin/courses
   * Get all courses (including hidden)
   */
  getAllCourses = async (_req: Request, res: Response): Promise<void> => {
    try {
      const courses = await prisma.course.findMany({
        include: {
          modules: {
            include: {
              videos: { select: { id: true } },
            },
          },
          _count: {
            select: { enrollments: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json(courses.map(course => ({
        ...course,
        moduleCount: course.modules.length,
        videoCount: course.modules.reduce((acc, m) => acc + m.videos.length, 0),
        studentCount: course._count.enrollments,
      })));
    } catch (error) {
      console.error('Get all courses error:', error);
      res.status(500).json({ error: 'Failed to fetch courses' });
    }
  };

  /**
   * POST /api/admin/courses
   * Create a new course
   */
  createCourse = async (req: Request, res: Response): Promise<void> => {
    try {
      const { title, description, category, level, price, thumbnailUrl, durationHours } = req.body;

      if (!title || !category) {
        res.status(400).json({ error: 'Title and category are required' });
        return;
      }

      const course = await prisma.course.create({
        data: {
          title,
          description,
          category: category as CourseCategory,
          level: (level as CourseLevel) || CourseLevel.BEGINNER,
          price: price || 0,
          thumbnailUrl,
          durationHours: durationHours || 0,
          createdById: req.user!.id,
        },
      });

      res.status(201).json(course);
    } catch (error) {
      console.error('Create course error:', error);
      res.status(500).json({ error: 'Failed to create course' });
    }
  };

  /**
   * PUT /api/admin/courses/:id
   * Update a course
   */
  updateCourse = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { title, description, category, level, price, thumbnailUrl, durationHours } = req.body;

      const course = await prisma.course.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(description !== undefined && { description }),
          ...(category && { category: category as CourseCategory }),
          ...(level && { level: level as CourseLevel }),
          ...(price !== undefined && { price }),
          ...(thumbnailUrl !== undefined && { thumbnailUrl }),
          ...(durationHours !== undefined && { durationHours }),
        },
      });

      res.json(course);
    } catch (error) {
      console.error('Update course error:', error);
      res.status(500).json({ error: 'Failed to update course' });
    }
  };

  /**
   * DELETE /api/admin/courses/:id
   * Delete a course
   */
  deleteCourse = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      await prisma.course.delete({
        where: { id },
      });

      res.json({ message: 'Course deleted successfully' });
    } catch (error) {
      console.error('Delete course error:', error);
      res.status(500).json({ error: 'Failed to delete course' });
    }
  };

  /**
   * PATCH /api/admin/courses/:id/visibility
   * Toggle course visibility
   */
  toggleCourseVisibility = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { isVisible } = req.body;

      const course = await prisma.course.update({
        where: { id },
        data: { isVisible },
      });

      res.json(course);
    } catch (error) {
      console.error('Toggle visibility error:', error);
      res.status(500).json({ error: 'Failed to toggle visibility' });
    }
  };

  // ============================================
  // MODULE MANAGEMENT
  // ============================================

  createModule = async (req: Request, res: Response): Promise<void> => {
    try {
      const { courseId } = req.params;
      const { title, description, sortOrder } = req.body;

      const module = await prisma.module.create({
        data: {
          courseId,
          title,
          description,
          sortOrder: sortOrder || 0,
        },
      });

      res.status(201).json(module);
    } catch (error) {
      console.error('Create module error:', error);
      res.status(500).json({ error: 'Failed to create module' });
    }
  };

  updateModule = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { title, description, sortOrder } = req.body;

      const module = await prisma.module.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(description !== undefined && { description }),
          ...(sortOrder !== undefined && { sortOrder }),
        },
      });

      res.json(module);
    } catch (error) {
      console.error('Update module error:', error);
      res.status(500).json({ error: 'Failed to update module' });
    }
  };

  deleteModule = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await prisma.module.delete({ where: { id } });
      res.json({ message: 'Module deleted successfully' });
    } catch (error) {
      console.error('Delete module error:', error);
      res.status(500).json({ error: 'Failed to delete module' });
    }
  };

  // ============================================
  // VIDEO MANAGEMENT
  // ============================================

  createVideo = async (req: Request, res: Response): Promise<void> => {
    try {
      const { moduleId } = req.params;
      const { title, description, videoUrl, durationMinutes, sortOrder } = req.body;

      const video = await prisma.video.create({
        data: {
          moduleId,
          title,
          description,
          videoUrl,
          durationMinutes: durationMinutes || 0,
          sortOrder: sortOrder || 0,
        },
      });

      res.status(201).json(video);
    } catch (error) {
      console.error('Create video error:', error);
      res.status(500).json({ error: 'Failed to create video' });
    }
  };

  updateVideo = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { title, description, videoUrl, durationMinutes, sortOrder } = req.body;

      const video = await prisma.video.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(description !== undefined && { description }),
          ...(videoUrl !== undefined && { videoUrl }),
          ...(durationMinutes !== undefined && { durationMinutes }),
          ...(sortOrder !== undefined && { sortOrder }),
        },
      });

      res.json(video);
    } catch (error) {
      console.error('Update video error:', error);
      res.status(500).json({ error: 'Failed to update video' });
    }
  };

  deleteVideo = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await prisma.video.delete({ where: { id } });
      res.json({ message: 'Video deleted successfully' });
    } catch (error) {
      console.error('Delete video error:', error);
      res.status(500).json({ error: 'Failed to delete video' });
    }
  };

  // ============================================
  // STUDENT MANAGEMENT
  // ============================================

  getAllStudents = async (_req: Request, res: Response): Promise<void> => {
    try {
      const students = await prisma.user.findMany({
        where: { roles: { has: UserRole.STUDENT } },
        include: {
          profile: true,
          _count: {
            select: {
              enrollments: true,
              certificates: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json(students.map(s => ({
        id: s.id,
        email: s.email,
        fullName: s.profile?.fullName,
        avatarUrl: s.profile?.avatarUrl,
        isBlocked: s.profile?.isBlocked || false,
        enrolledCourses: s._count.enrollments,
        certificates: s._count.certificates,
        createdAt: s.createdAt,
      })));
    } catch (error) {
      console.error('Get students error:', error);
      res.status(500).json({ error: 'Failed to fetch students' });
    }
  };

  getStudentDetails = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const student = await prisma.user.findUnique({
        where: { id },
        include: {
          profile: true,
          enrollments: {
            include: {
              course: true,
            },
          },
          certificates: {
            include: {
              course: true,
            },
          },
        },
      });

      if (!student) {
        res.status(404).json({ error: 'Student not found' });
        return;
      }

      res.json(student);
    } catch (error) {
      console.error('Get student details error:', error);
      res.status(500).json({ error: 'Failed to fetch student details' });
    }
  };

  toggleStudentBlock = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { isBlocked } = req.body;

      const profile = await prisma.profile.update({
        where: { userId: id },
        data: { isBlocked },
      });

      res.json(profile);
    } catch (error) {
      console.error('Toggle student block error:', error);
      res.status(500).json({ error: 'Failed to toggle student block' });
    }
  };

  // ============================================
  // ANALYTICS
  // ============================================

  getAnalytics = async (_req: Request, res: Response): Promise<void> => {
    try {
      const [
        enrollmentsByMonth,
        revenueByMonth,
        coursePopularity,
      ] = await Promise.all([
        prisma.$queryRaw`
          SELECT 
            DATE_FORMAT(enrolled_at, '%Y-%m') as month,
            COUNT(*) as count
          FROM enrollments
          GROUP BY month
          ORDER BY month DESC
          LIMIT 12
        `,
        prisma.$queryRaw`
          SELECT 
            DATE_FORMAT(purchased_at, '%Y-%m') as month,
            SUM(amount) as revenue
          FROM purchases
          WHERE status = 'COMPLETED'
          GROUP BY month
          ORDER BY month DESC
          LIMIT 12
        `,
        prisma.course.findMany({
          select: {
            id: true,
            title: true,
            _count: {
              select: { enrollments: true },
            },
          },
          orderBy: {
            enrollments: { _count: 'desc' },
          },
          take: 10,
        }),
      ]);

      res.json({
        enrollmentsByMonth,
        revenueByMonth,
        coursePopularity: coursePopularity.map(c => ({
          id: c.id,
          title: c.title,
          enrollments: c._count.enrollments,
        })),
      });
    } catch (error) {
      console.error('Get analytics error:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  };

  getCourseAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
      const { courseId } = req.params;

      const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
          modules: {
            include: {
              videos: {
                include: {
                  _count: {
                    select: { progress: true },
                  },
                  progress: {
                    where: { isCompleted: true },
                  },
                },
              },
            },
          },
          _count: {
            select: { enrollments: true },
          },
        },
      });

      if (!course) {
        res.status(404).json({ error: 'Course not found' });
        return;
      }

      const moduleAnalytics = course.modules.map(module => ({
        id: module.id,
        title: module.title,
        videos: module.videos.map(video => ({
          id: video.id,
          title: video.title,
          viewCount: video._count.progress,
          completionCount: video.progress.length,
        })),
      }));

      res.json({
        courseId: course.id,
        title: course.title,
        totalEnrollments: course._count.enrollments,
        modules: moduleAnalytics,
      });
    } catch (error) {
      console.error('Get course analytics error:', error);
      res.status(500).json({ error: 'Failed to fetch course analytics' });
    }
  };
}
