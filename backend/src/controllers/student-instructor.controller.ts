import { Request, Response } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

class StudentInstructorController {
  /**
   * Assign instructor to student (Admin)
   * POST /api/admin/students/:studentId/instructor
   */
  assignInstructor = async (req: Request, res: Response): Promise<void> => {
    try {
      const { studentId } = req.params;
      const { instructorId } = req.body;
      const adminId = req.user?.id;

      if (!instructorId) {
        res.status(400).json({ error: 'Instructor ID is required' });
        return;
      }

      // Verify student exists and is a student
      const student = await prisma.user.findUnique({
        where: { id: studentId },
      });

      if (!student || student.role !== UserRole.STUDENT) {
        res.status(404).json({ error: 'Student not found' });
        return;
      }

      // Verify instructor exists and is an instructor
      const instructor = await prisma.user.findUnique({
        where: { id: instructorId },
      });

      if (!instructor || instructor.role !== UserRole.INSTRUCTOR) {
        res.status(404).json({ error: 'Instructor not found' });
        return;
      }

      // Create or update assignment
      const assignment = await prisma.studentInstructor.upsert({
        where: {
          studentId_instructorId: {
            studentId,
            instructorId,
          },
        },
        update: {
          assignedBy: adminId || null,
        },
        create: {
          studentId,
          instructorId,
          assignedBy: adminId || null,
        },
        include: {
          student: {
            select: {
              id: true,
              email: true,
              profile: { select: { fullName: true } },
            },
          },
          instructor: {
            select: {
              id: true,
              email: true,
              profile: { select: { fullName: true } },
            },
          },
        },
      });

      res.json({
        message: 'Instructor assigned successfully',
        assignment,
      });
    } catch (error: unknown) {
      console.error('Assign instructor error:', error);
      res.status(500).json({ error: 'Failed to assign instructor' });
    }
  };

  /**
   * Remove instructor from student (Admin)
   * DELETE /api/admin/students/:studentId/instructor/:instructorId
   */
  removeInstructor = async (req: Request, res: Response): Promise<void> => {
    try {
      const { studentId, instructorId } = req.params;

      await prisma.studentInstructor.delete({
        where: {
          studentId_instructorId: {
            studentId,
            instructorId,
          },
        },
      });

      res.json({ message: 'Instructor removed successfully' });
    } catch (error: unknown) {
      console.error('Remove instructor error:', error);
      res.status(500).json({ error: 'Failed to remove instructor' });
    }
  };

  /**
   * Get student's assigned instructors
   * GET /api/students/:studentId/instructors
   */
  getStudentInstructors = async (req: Request, res: Response): Promise<void> => {
    try {
      const { studentId } = req.params;

      const assignments = await prisma.studentInstructor.findMany({
        where: { studentId },
        include: {
          instructor: {
            select: {
              id: true,
              email: true,
              profile: { select: { fullName: true, avatarUrl: true } },
            },
          },
        },
      });

      res.json(assignments.map(a => a.instructor));
    } catch (error: unknown) {
      console.error('Get student instructors error:', error);
      res.status(500).json({ error: 'Failed to fetch instructors' });
    }
  };

  /**
   * Get instructor's assigned students
   * GET /api/instructors/:instructorId/students
   */
  getInstructorStudents = async (req: Request, res: Response): Promise<void> => {
    try {
      const { instructorId } = req.params;

      const assignments = await prisma.studentInstructor.findMany({
        where: { instructorId },
        include: {
          student: {
            select: {
              id: true,
              email: true,
              profile: { select: { fullName: true, avatarUrl: true } },
            },
          },
        },
      });

      res.json(assignments.map(a => a.student));
    } catch (error: unknown) {
      console.error('Get instructor students error:', error);
      res.status(500).json({ error: 'Failed to fetch students' });
    }
  };
}

export const studentInstructorController = new StudentInstructorController();
