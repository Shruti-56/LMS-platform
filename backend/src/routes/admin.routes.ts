import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/roleGuard';

const router = Router();
const adminController = new AdminController();

// All routes require admin authentication
router.use(authenticate, requireAdmin);

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// Course management
router.get('/courses', adminController.getAllCourses);
router.post('/courses', adminController.createCourse);
router.put('/courses/:id', adminController.updateCourse);
router.delete('/courses/:id', adminController.deleteCourse);
router.patch('/courses/:id/visibility', adminController.toggleCourseVisibility);

// Module management
router.post('/courses/:courseId/modules', adminController.createModule);
router.put('/modules/:id', adminController.updateModule);
router.delete('/modules/:id', adminController.deleteModule);

// Video management
router.post('/modules/:moduleId/videos', adminController.createVideo);
router.put('/videos/:id', adminController.updateVideo);
router.delete('/videos/:id', adminController.deleteVideo);

// Student management
router.get('/students', adminController.getAllStudents);
router.get('/students/:id', adminController.getStudentDetails);
router.patch('/students/:id/block', adminController.toggleStudentBlock);

// Analytics
router.get('/analytics', adminController.getAnalytics);
router.get('/analytics/courses/:courseId', adminController.getCourseAnalytics);

export default router;
