import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CourseController {
  /**
   * GET /api/courses
   * Get all visible courses (with optional filtering)
   */
  getAllCourses = async (req: Request, res: Response): Promise<void> => {
    try {
      const { category, level, search } = req.query;

      const where: any = { isVisible: true };

      if (category) {
        where.category = category;
      }

      if (level) {
        where.level = level;
      }

      if (search) {
        where.OR = [
          { title: { contains: search as string } },
          { description: { contains: search as string } },
        ];
      }

      const courses = await prisma.course.findMany({
        where,
        include: {
          modules: {
            select: { id: true },
          },
          _count: {
            select: { enrollments: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // If user is authenticated, include enrollment status
      const userId = req.user?.id;
      let enrolledCourseIds: string[] = [];

      if (userId) {
        const enrollments = await prisma.enrollment.findMany({
          where: { userId },
          select: { courseId: true },
        });
        enrolledCourseIds = enrollments.map(e => e.courseId);
      }

      const coursesWithStatus = courses.map(course => ({
        id: course.id,
        title: course.title,
        description: course.description,
        category: course.category,
        level: course.level,
        price: course.price,
        thumbnailUrl: course.thumbnailUrl,
        durationHours: course.durationHours,
        moduleCount: course.modules.length,
        studentCount: course._count.enrollments,
        isEnrolled: enrolledCourseIds.includes(course.id),
      }));

      res.json(coursesWithStatus);
    } catch (error) {
      console.error('Get courses error:', error);
      res.status(500).json({ error: 'Failed to fetch courses' });
    }
  };

  /**
   * GET /api/courses/:id
   * Get course details by ID
   */
  getCourseById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const course = await prisma.course.findUnique({
        where: { id },
        include: {
          modules: {
            include: {
              videos: {
                select: {
                  id: true,
                  title: true,
                  durationMinutes: true,
                  sortOrder: true,
                },
                orderBy: { sortOrder: 'asc' },
              },
            },
            orderBy: { sortOrder: 'asc' },
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

      if (!course.isVisible && !req.user?.roles.includes('ADMIN')) {
        res.status(404).json({ error: 'Course not found' });
        return;
      }

      // Check enrollment status
      let isEnrolled = false;
      if (req.user?.id) {
        const enrollment = await prisma.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId: req.user.id,
              courseId: id,
            },
          },
        });
        isEnrolled = !!enrollment;
      }

      res.json({
        ...course,
        studentCount: course._count.enrollments,
        isEnrolled,
      });
    } catch (error) {
      console.error('Get course by ID error:', error);
      res.status(500).json({ error: 'Failed to fetch course' });
    }
  };

  /**
   * GET /api/courses/:id/modules
   * Get course modules (preview - limited info)
   */
  getCourseModules = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const modules = await prisma.module.findMany({
        where: { courseId: id },
        include: {
          videos: {
            select: {
              id: true,
              title: true,
              durationMinutes: true,
              sortOrder: true,
            },
            orderBy: { sortOrder: 'asc' },
          },
        },
        orderBy: { sortOrder: 'asc' },
      });

      res.json(modules);
    } catch (error) {
      console.error('Get course modules error:', error);
      res.status(500).json({ error: 'Failed to fetch modules' });
    }
  };

  /**
   * GET /api/courses/:id/content
   * Get full course content (requires enrollment)
   */
  getCourseContent = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      // Verify enrollment
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: { userId, courseId: id },
        },
      });

      // Allow admins to access without enrollment
      if (!enrollment && !req.user?.roles.includes('ADMIN')) {
        res.status(403).json({ error: 'You must be enrolled in this course' });
        return;
      }

      const course = await prisma.course.findUnique({
        where: { id },
        include: {
          modules: {
            include: {
              videos: {
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

      // Get user's progress for this course
      const progress = await prisma.videoProgress.findMany({
        where: {
          userId,
          video: {
            module: { courseId: id },
          },
        },
      });

      const progressMap = new Map(progress.map(p => [p.videoId, p]));

      // Add progress to each video
      const modulesWithProgress = course.modules.map(module => ({
        ...module,
        videos: module.videos.map(video => ({
          ...video,
          isCompleted: progressMap.get(video.id)?.isCompleted || false,
          watchTimeSeconds: progressMap.get(video.id)?.watchTimeSeconds || 0,
        })),
      }));

      res.json({
        ...course,
        modules: modulesWithProgress,
      });
    } catch (error) {
      console.error('Get course content error:', error);
      res.status(500).json({ error: 'Failed to fetch course content' });
    }
  };
}
