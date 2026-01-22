import { Router } from 'express';
import authRoutes from './auth.routes';
import courseRoutes from './course.routes';
import enrollmentRoutes from './enrollment.routes';
import progressRoutes from './progress.routes';
import userRoutes from './user.routes';
import adminRoutes from './admin.routes';

const router = Router();

// Mount route modules
router.use('/auth', authRoutes);
router.use('/courses', courseRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/progress', progressRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);

export default router;
