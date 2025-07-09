import express from 'express';
import { getOrderDetails, getOrderById } from '../controllers/adminOrderController.js';
import { updateOrderStatus } from '../controllers/OrderStatusController.js';

const adminRouter = express.Router();

adminRouter.get('/orders', getOrderDetails);

adminRouter.get('/orders/:orderId', getOrderById);

adminRouter.post('/orders/update',updateOrderStatus);

export default adminRouter;