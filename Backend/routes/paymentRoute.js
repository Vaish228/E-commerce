import express from 'express';
import {
  initiateOrder,
  verifyAndSavePayment,
  getPaymentStatus
} from '../controllers/paymentController.js';
import  authUser  from '../middleware/auth.js'; // Import your auth middleware

const router = express.Router();

// 1. Create Razorpay Order - protected route
router.post('/initiate', authUser, initiateOrder);

// 2. Verify Razorpay Payment - protected route
router.post('/verify', authUser, verifyAndSavePayment);

// 3. Get Payment Status - protected route
router.get('/status/:orderId', authUser, getPaymentStatus);

export default router;
