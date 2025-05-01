import Order from '../models/orderModel.js';

/**
 * Update order status
 * @param {Object} req - Request object with orderId and status in body
 * @param {Object} res - Response object
 * @returns {Object} Updated order information
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    
    // Validate required fields
    if (!orderId || !status) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and status are required'
      });
    }
    
    // Validate status value
    const validStatuses = ['Order Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Refund Initiated', 'Refunded'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value',
        validStatuses
      });
    }
    
    // Find and update the order
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true } // Return the updated document
    );
    
    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    
    await updatedOrder.save();
    
    return res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order: {
        orderId: updatedOrder._id,
        status: updatedOrder.status,
        statusHistory: updatedOrder.statusHistory,
        updatedAt: new Date()
      }
    });
    
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};

