import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient, CourseCategory, CourseLevel, UserRole } from '@prisma/client';
import { emailService } from '../services/email.service';

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
          where: { role: UserRole.STUDENT },
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
          videos: { select: { id: true } },
          _count: {
            select: { enrollments: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json(courses.map(course => ({
        ...course,
        videoCount: course.videos.length,
        studentCount: course._count.enrollments,
      })));
    } catch (error) {
      console.error('Get all courses error:', error);
      res.status(500).json({ error: 'Failed to fetch courses' });
    }
  };

  /**
   * GET /api/admin/courses/:id
   * Get course details with videos only (no modules, assignments, or projects)
   */
  getCourseDetails = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const course = await prisma.course.findUnique({
        where: { id },
        include: {
          videos: {
            include: {
              assignments: {
                select: {
                  id: true,
                  title: true,
                  description: true,
                  instructions: true,
                },
              },
            },
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
          },
        },
      });

      if (!course) {
        res.status(404).json({ error: 'Course not found' });
        return;
      }

      res.json(course);
    } catch (error) {
      console.error('Get course details error:', error);
      res.status(500).json({ error: 'Failed to fetch course details' });
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

  /**
   * POST /api/admin/courses/:courseId/videos
   * Create a video directly on a course (no module).
   * New videos get the next sortOrder so first-uploaded appears first to students.
   */
  createVideoUnderCourse = async (req: Request, res: Response): Promise<void> => {
    try {
      const { courseId } = req.params;
      const { title, description, videoUrl, durationMinutes, sortOrder } = req.body;

      const nextSortOrder =
        typeof sortOrder === 'number'
          ? sortOrder
          : await prisma.video
              .aggregate({
                where: { courseId },
                _max: { sortOrder: true },
              })
              .then((r) => (r._max.sortOrder ?? -1) + 1);

      const video = await prisma.video.create({
        data: {
          courseId,
          title,
          description,
          videoUrl,
          durationMinutes: durationMinutes || 0,
          sortOrder: nextSortOrder,
        },
      });

      res.status(201).json(video);
    } catch (error) {
      console.error('Create video under course error:', error);
      res.status(500).json({ error: 'Failed to create video' });
    }
  };

  createVideo = async (req: Request, res: Response): Promise<void> => {
    try {
      const { moduleId } = req.params;
      const { title, description, videoUrl, durationMinutes, sortOrder } = req.body;

      const video = await prisma.video.create({
        data: {
          moduleId,
          courseId: (await prisma.module.findUnique({ where: { id: moduleId }, select: { courseId: true } }))!.courseId,
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

  /**
   * GET /api/admin/videos/:id
   * Get video details for upload page
   */
  getVideoDetails = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const video = await prisma.video.findUnique({
        where: { id },
        include: {
          course: { select: { id: true, title: true } },
          module: {
            include: {
              course: { select: { title: true } },
            },
          },
        },
      });

      if (!video) {
        res.status(404).json({ error: 'Video not found' });
        return;
      }

      res.json(video);
    } catch (error) {
      console.error('Get video details error:', error);
      res.status(500).json({ error: 'Failed to fetch video details' });
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

  /**
   * POST /api/admin/videos/:id/upload-url
   * Get a presigned URL for uploading video to S3
   */
  getVideoUploadUrl = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { filename, contentType } = req.body;

      if (!filename || !contentType) {
        res.status(400).json({ error: 'Filename and contentType are required' });
        return;
      }

      // Verify video exists
      const video = await prisma.video.findUnique({ where: { id } });
      if (!video) {
        res.status(404).json({ error: 'Video not found' });
        return;
      }

      // Generate S3 key
      const { S3Service, s3Service } = await import('../services/s3.service');
      const key = S3Service.generateKey('video', id, filename);

      // Get presigned upload URL
      const uploadUrl = await s3Service.getUploadUrl(key, contentType, 3600);

      res.json({
        uploadUrl,
        key,
        expiresIn: 3600,
      });
    } catch (error) {
      console.error('Get upload URL error:', error);
      res.status(500).json({ error: 'Failed to get upload URL' });
    }
  };

  /**
   * PUT /api/admin/videos/:id/confirm-upload
   * Confirm video upload and save S3 key to database
   */
  confirmVideoUpload = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { key } = req.body;

      if (!key) {
        res.status(400).json({ error: 'S3 key is required' });
        return;
      }

      // Update video with S3 key
      const video = await prisma.video.update({
        where: { id },
        data: { videoUrl: key },
      });

      res.json({
        message: 'Video upload confirmed',
        video,
      });
    } catch (error) {
      console.error('Confirm upload error:', error);
      res.status(500).json({ error: 'Failed to confirm upload' });
    }
  };

  // ============================================
  // STUDENT MANAGEMENT
  // ============================================

  getAllStudents = async (_req: Request, res: Response): Promise<void> => {
    try {
      const students = await prisma.user.findMany({
        where: { role: UserRole.STUDENT },
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
          },
          certificates: {
            include: {
              course: true,
            },
          },
          videoProgress: {
            where: { isCompleted: true },
            select: { videoId: true },
          },
        },
      });

      if (!student) {
        res.status(404).json({ error: 'Student not found' });
        return;
      }

      // Get screen time for this student (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const screenTimeRecords = await prisma.screenTime.findMany({
        where: {
          userId: id,
          date: { gte: weekAgo },
        },
        orderBy: { date: 'desc' },
      });

      const totalScreenTime = screenTimeRecords.reduce((sum, st) => sum + st.totalSeconds, 0);

      // Calculate progress for each enrolled course
      const completedVideoIds = new Set(student.videoProgress.map(vp => vp.videoId));
      
      const enrollmentsWithProgress = student.enrollments.map(enrollment => {
        const totalVideos = enrollment.course.modules.reduce(
          (sum, m) => sum + m.videos.length, 0
        );
        
        const completedVideos = enrollment.course.modules.reduce((sum, m) => {
          return sum + m.videos.filter(v => completedVideoIds.has(v.id)).length;
        }, 0);

        const progressPercent = totalVideos > 0 
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
          },
          progress: {
            completedVideos,
            totalVideos,
            percent: progressPercent,
          },
        };
      });

      res.json({
        id: student.id,
        email: student.email,
        createdAt: student.createdAt,
        profile: student.profile,
        enrollments: enrollmentsWithProgress,
        certificates: student.certificates,
        screenTime: {
          weeklySeconds: totalScreenTime,
          lastActive: screenTimeRecords[0]?.lastPing || null,
        },
      });
    } catch (error: unknown) {
      console.error('Get student details error:', error);
      res.status(500).json({ error: 'Failed to fetch student details', details: error instanceof Error ? error.message : String(error) });
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
        enrollmentsByMonthRaw,
        revenueByMonthRaw,
        coursePopularity,
      ] = await Promise.all([
        prisma.$queryRaw<Array<{ month: string; count: bigint }>>`
          SELECT 
            DATE_FORMAT(enrolled_at, '%Y-%m') as month,
            COUNT(*) as count
          FROM enrollments
          GROUP BY month
          ORDER BY month DESC
          LIMIT 12
        `,
        prisma.$queryRaw<Array<{ month: string; revenue: number | null }>>`
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

      // Convert BigInt to Number for JSON serialization
      const enrollmentsByMonth = enrollmentsByMonthRaw.map(item => ({
        month: item.month,
        count: Number(item.count),
      }));

      const revenueByMonth = revenueByMonthRaw.map(item => ({
        month: item.month,
        revenue: Number(item.revenue || 0),
      }));

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

  // ============================================
  // SCREEN TIME
  // ============================================

  /**
   * GET /api/admin/screentime
   * Get all students' screen time summary
   */
  getAllScreenTime = async (_req: Request, res: Response): Promise<void> => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);

      // Get today's date string for comparison
      const todayStr = today.toISOString().split('T')[0];

      // First, get all students
      const students = await prisma.user.findMany({
        where: { role: UserRole.STUDENT },
        include: {
          profile: true,
        },
      });

      // Then get screen time data separately to avoid relation issues
      const screenTimeRecords = await prisma.screenTime.findMany({
        where: { 
          date: { gte: weekAgo },
          userId: { in: students.map(s => s.id) }
        },
        orderBy: { date: 'desc' },
      });

      // Group screen time by user
      const screenTimeByUser = new Map<string, typeof screenTimeRecords>();
      for (const record of screenTimeRecords) {
        const existing = screenTimeByUser.get(record.userId) || [];
        existing.push(record);
        screenTimeByUser.set(record.userId, existing);
      }

      const screenTimeData = students.map((student) => {
        const userScreenTime = screenTimeByUser.get(student.id) || [];
        
        // Find today's entry by comparing date strings
        const todayTime = userScreenTime.find((st) => {
          const stDateStr = new Date(st.date).toISOString().split('T')[0];
          return stDateStr === todayStr;
        });
        
        const weeklyTotal = userScreenTime.reduce(
          (sum, st) => sum + st.totalSeconds,
          0
        );

        return {
          userId: student.id,
          email: student.email,
          fullName: student.profile?.fullName || 'Unknown',
          todaySeconds: todayTime?.totalSeconds || 0,
          weeklySeconds: weeklyTotal,
          lastActive: userScreenTime[0]?.lastPing || null,
        };
      });

      // Sort by weekly time descending
      screenTimeData.sort((a, b) => b.weeklySeconds - a.weeklySeconds);

      res.json(screenTimeData);
    } catch (error: unknown) {
      console.error('Get all screen time error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch screen time data',
        details: error instanceof Error ? error.message : String(error),
      });
    }
  };

  /**
   * GET /api/admin/screentime/:userId
   * Get detailed screen time for a specific student
   */
  getStudentScreenTime = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [student, screenTime] = await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          include: { profile: true },
        }),
        prisma.screenTime.findMany({
          where: {
            userId,
            date: { gte: thirtyDaysAgo },
          },
          orderBy: { date: 'desc' },
        }),
      ]);

      if (!student) {
        res.status(404).json({ error: 'Student not found' });
        return;
      }

      const totalSeconds = screenTime.reduce((sum, st) => sum + st.totalSeconds, 0);

      res.json({
        student: {
          id: student.id,
          email: student.email,
          fullName: student.profile?.fullName || 'Unknown',
        },
        totalSeconds,
        averageDaily: Math.round(totalSeconds / Math.max(screenTime.length, 1)),
        dailyBreakdown: screenTime.map((st) => ({
          date: st.date,
          seconds: st.totalSeconds,
        })),
      });
    } catch (error: unknown) {
      console.error('Get student screen time error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch student screen time',
        details: error instanceof Error ? error.message : String(error),
      });
    }
  };

  /**
   * Get all instructors
   * GET /api/admin/instructors
   */
  getAllInstructors = async (_req: Request, res: Response): Promise<void> => {
    try {
      const instructors = await prisma.user.findMany({
        where: { role: UserRole.INSTRUCTOR },
        include: {
          profile: true,
          assignedStudents: {
            select: {
              student: {
                select: {
                  id: true,
                  email: true,
                  profile: { select: { fullName: true } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json(instructors.map(i => ({
        id: i.id,
        email: i.email,
        fullName: i.profile?.fullName || 'Unknown',
        studentsCount: i.assignedStudents.length,
        students: i.assignedStudents.map(sa => sa.student),
        createdAt: i.createdAt,
      })));
    } catch (error: unknown) {
      console.error('Get all instructors error:', error);
      res.status(500).json({ error: 'Failed to fetch instructors' });
    }
  };

  /**
   * Create instructor
   * POST /api/admin/instructors
   */
  createInstructor = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, fullName } = req.body;

      if (!email || !password || !fullName) {
        res.status(400).json({ error: 'Email, password, and full name are required' });
        return;
      }

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existingUser) {
        // If user exists, update role to instructor
        const updated = await prisma.user.update({
          where: { id: existingUser.id },
          data: { role: UserRole.INSTRUCTOR },
          include: { profile: true },
        });

        res.json({
          message: 'User promoted to instructor',
          instructor: {
            id: updated.id,
            email: updated.email,
            fullName: updated.profile?.fullName,
          },
        });
        return;
      }

      // Create new instructor
      const passwordHash = await bcrypt.hash(password, 12);

      const instructor = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          passwordHash,
          role: UserRole.INSTRUCTOR,
          profile: {
            create: { fullName },
          },
        },
        include: { profile: true },
      });

      res.status(201).json({
        message: 'Instructor created successfully',
        instructor: {
          id: instructor.id,
          email: instructor.email,
          fullName: instructor.profile?.fullName,
        },
      });
    } catch (error: unknown) {
      console.error('Create instructor error:', error);
      res.status(500).json({ error: 'Failed to create instructor', details: error instanceof Error ? error.message : String(error) });
    }
  };

  /**
   * Create student (admin register new student)
   * POST /api/admin/students
   */
  createStudent = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, fullName } = req.body;

      if (!email || !password || !fullName) {
        res.status(400).json({ error: 'Email, password, and full name are required' });
        return;
      }

      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existingUser) {
        res.status(400).json({ error: 'A user with this email already exists' });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 12);

      const student = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          passwordHash,
          role: UserRole.STUDENT,
          profile: {
            create: { fullName: (fullName as string).trim() },
          },
        },
        include: { profile: true },
      });

      // Send welcome email to the student (same as public registration)
      emailService.sendWelcomeEmail(student.email, student.profile?.fullName ?? undefined)
        .catch(err => console.error('Failed to send welcome email to student:', err));

      res.status(201).json({
        message: 'Student registered successfully',
        student: {
          id: student.id,
          email: student.email,
          fullName: student.profile?.fullName,
        },
      });
    } catch (error: unknown) {
      console.error('Create student error:', error);
      res.status(500).json({ error: 'Failed to create student', details: error instanceof Error ? error.message : String(error) });
    }
  };

}
