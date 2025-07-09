import express from 'express';
import {
  initiateOrder,
  verifyAndSavePayment,
  getPaymentStatus
} from '../controllers/paymentController.js';
import  authUser  from '../middleware/auth.js'; 
const router = express.Router();

router.post('/initiate', authUser, initiateOrder);

router.post('/verify', authUser, verifyAndSavePayment);

router.get('/status/:orderId', authUser, getPaymentStatus);

export default router;
