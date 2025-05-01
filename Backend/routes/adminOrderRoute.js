import express from 'express';
import { getOrderDetails, getOrderById } from '../controllers/adminOrderController.js';
import { updateOrderStatus } from '../controllers/OrderStatusController.js';
// import { authenticateUser, isAdmin } from '../middlewares/auth'; // You'll need to implement these middleware functions

const adminRouter = express.Router();

// Route to get all orders with details (admin only)
adminRouter.get('/orders', getOrderDetails);

// Route to get order details by ID (accessible by admin or the order owner)
adminRouter.get('/orders/:orderId', getOrderById);

adminRouter.post('/orders/update',updateOrderStatus);

export default adminRouter;