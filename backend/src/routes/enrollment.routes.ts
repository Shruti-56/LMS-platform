import { Router } from 'express';
import { EnrollmentController } from '../controllers/enrollment.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const enrollmentController = new EnrollmentController();

// All routes require authentication
router.use(authenticate);

router.get('/', enrollmentController.getMyEnrollments);
router.post('/', enrollmentController.enrollInCourse);
router.get('/:courseId', enrollmentController.getEnrollmentDetails);
router.delete('/:courseId', enrollmentController.unenroll);

export default router;
