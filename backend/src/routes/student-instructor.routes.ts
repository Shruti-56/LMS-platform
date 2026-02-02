import { Router } from 'express';
import { studentInstructorController } from '../controllers/student-instructor.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/students/:studentId/instructors', studentInstructorController.getStudentInstructors);
router.get('/instructors/:instructorId/students', studentInstructorController.getInstructorStudents);

export default router;
