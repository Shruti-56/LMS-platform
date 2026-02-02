import { Router } from 'express';
import { submissionController } from '../controllers/submission.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All submission routes require authentication
router.use(authenticate);

// Student submissions
router.post('/assignment/:assignmentId', submissionController.submitAssignment);
router.post('/project/:projectId', submissionController.submitProject);
router.post('/upload-url', submissionController.getUploadUrl);
router.get('/my', submissionController.getMySubmissions);

// Instructor review
router.get('/review', submissionController.getSubmissionsForReview);
router.get('/:id/download-url', submissionController.getSubmissionDownloadUrl);
router.put('/:id/review', submissionController.reviewSubmission);

export default router;
