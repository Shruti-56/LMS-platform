import { Request, Response } from 'express';
import crypto from 'crypto';
import { PrismaClient, PurchaseStatus } from '@prisma/client';
import { emailService } from '../services/email.service';

const prisma = new PrismaClient();

// Razorpay is CommonJS-only; require is intentional
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Razorpay = require('razorpay');

class PaymentController {
  /**
   * Create a Razorpay order for course purchase
   * POST /api/payments/create-order
   */
  createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('=== CREATE ORDER START ===');
      
      const userId = req.user?.id;
      const { courseId } = req.body;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (!courseId) {
        res.status(400).json({ error: 'Course ID is required' });
        return;
      }

      const keyId = process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      
      console.log('Razorpay Key ID:', keyId ? 'Present' : 'Missing');
      console.log('Razorpay Secret:', keySecret ? 'Present' : 'Missing');

      if (!keyId || !keySecret) {
        res.status(500).json({ error: 'Payment gateway not configured' });
        return;
      }

      // Get course details
      const course = await prisma.course.findUnique({
        where: { id: courseId },
      });

      if (!course) {
        res.status(404).json({ error: 'Course not found' });
        return;
      }
      
      console.log('Course:', course.title, 'Price:', Number(course.price));

      // Check if already enrolled
      const existingEnrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: { userId, courseId },
        },
      });

      if (existingEnrollment) {
        res.status(400).json({ error: 'You are already enrolled in this course' });
        return;
      }

      // Convert price to paise (Razorpay uses smallest currency unit)
      // Minimum amount for Razorpay is 100 paise (₹1)
      const priceValue = Number(course.price);
      const amountInPaise = Math.max(Math.round(priceValue * 100), 100);
      
      console.log('Amount in paise:', amountInPaise);

      // Initialize Razorpay
      const razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });

      // Create Razorpay order with minimal options
      console.log('Creating Razorpay order...');
      const razorpayOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `rcpt_${Date.now()}`,
      });
      
      console.log('Razorpay order created:', razorpayOrder.id);

      // Create purchase record
      const purchase = await prisma.purchase.create({
        data: {
          userId,
          courseId,
          amount: course.price,
          status: PurchaseStatus.PENDING,
          paymentProvider: 'razorpay',
          paymentId: razorpayOrder.id,
        },
      });

      // Get user details for prefill
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true },
      });

      res.json({
        orderId: razorpayOrder.id,
        amount: amountInPaise,
        currency: 'INR',
        purchaseId: purchase.id,
        keyId: keyId,
        course: {
          id: course.id,
          title: course.title,
          price: course.price,
        },
        prefill: {
          name: user?.profile?.fullName || '',
          email: user?.email || '',
        },
      });
      
      console.log('=== CREATE ORDER SUCCESS ===');
    } catch (error: unknown) {
      console.error('=== CREATE ORDER ERROR ===');
      console.error('Error:', error);
      res.status(500).json({ 
        error: 'Failed to create order', 
        details: error instanceof Error ? error.message : String(error),
      });
    }
  };

  /**
   * Verify Razorpay payment and complete enrollment
   * POST /api/payments/verify
   */
  verifyPayment = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        purchaseId,
      } = req.body;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !purchaseId) {
        res.status(400).json({ error: 'Missing required payment details' });
        return;
      }

      // Verify signature
      const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(body)
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        res.status(400).json({ error: 'Payment verification failed - invalid signature' });
        return;
      }

      // Get purchase record
      const purchase = await prisma.purchase.findUnique({
        where: { id: purchaseId },
        include: { course: true },
      });

      if (!purchase) {
        res.status(404).json({ error: 'Purchase not found' });
        return;
      }

      if (purchase.userId !== userId) {
        res.status(403).json({ error: 'Unauthorized access to purchase' });
        return;
      }

      if (purchase.status === PurchaseStatus.COMPLETED) {
        res.status(400).json({ error: 'Payment already processed' });
        return;
      }

      // Get user details for email
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true },
      });

      // Update purchase status and create enrollment in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Update purchase
        const updatedPurchase = await tx.purchase.update({
          where: { id: purchaseId },
          data: {
            status: PurchaseStatus.COMPLETED,
            paymentId: razorpay_payment_id,
          },
        });

        // Create enrollment
        const enrollment = await tx.enrollment.create({
          data: {
            userId,
            courseId: purchase.courseId,
          },
        });

        return { purchase: updatedPurchase, enrollment };
      });

      // Send payment receipt email (non-blocking)
      if (user) {
        emailService.sendPaymentReceiptEmail(
          user.email,
          purchase.course.title,
          Number(purchase.amount),
          razorpay_payment_id,
          user.profile?.fullName || undefined
        ).catch(err => console.error('Failed to send payment receipt:', err));

        // Send enrollment confirmation email (non-blocking)
        emailService.sendEnrollmentEmail(
          user.email,
          purchase.course.title,
          user.profile?.fullName || undefined
        ).catch(err => console.error('Failed to send enrollment email:', err));
      }

      res.json({
        success: true,
        message: 'Payment successful! You are now enrolled.',
        enrollment: {
          id: result.enrollment.id,
          courseId: purchase.courseId,
          courseTitle: purchase.course.title,
        },
      });
    } catch (error: unknown) {
      console.error('Verify payment error:', error);
      res.status(500).json({ error: 'Payment verification failed', details: error instanceof Error ? error.message : String(error) });
    }
  };

  /**
   * Get payment history for current user
   * GET /api/payments/history
   */
  getPaymentHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const purchases = await prisma.purchase.findMany({
        where: { userId },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              thumbnailUrl: true,
            },
          },
        },
        orderBy: { purchasedAt: 'desc' },
      });

      res.json(purchases);
    } catch (error: unknown) {
      console.error('Get payment history error:', error);
      res.status(500).json({ error: 'Failed to fetch payment history' });
    }
  };

  /**
   * Get Razorpay key (public) for frontend
   * GET /api/payments/config
   */
  getConfig = async (_req: Request, res: Response): Promise<void> => {
    const keyId = process.env.RAZORPAY_KEY_ID;
    
    if (!keyId) {
      res.status(500).json({ error: 'Payment gateway not configured' });
      return;
    }

    res.json({ keyId });
  };
}

export const paymentController = new PaymentController();
