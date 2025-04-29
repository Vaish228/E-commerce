import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';

// Controller function to get detailed order information
export const getOrderDetails = async (req, res) => {
  try {
    // Get all orders with pagination option
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Get filters if any
    const userId = req.query.userId;
    const status = req.query.status;
    const fromDate = req.query.fromDate ? parseInt(req.query.fromDate) : null;
    const toDate = req.query.toDate ? parseInt(req.query.toDate) : null;
    
    // Build query based on filters
    const query = {};
    if (userId) query.userId = userId;
    if (status) query.status = status;
    if (fromDate || toDate) {
      query.date = {};
      if (fromDate) query.date.$gte = fromDate;
      if (toDate) query.date.$lte = toDate;
    }
    
    // Get total count for pagination
    const totalOrders = await Order.countDocuments(query);
    
    // Get orders
    const orders = await Order.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);
    
    // For each order, get the user information and product details
    const enrichedOrders = await Promise.all(orders.map(async (order) => {
      // Get user information
      const user = await User.findOne({ _id: order.userId }, { password: 0 }); // Exclude password
      
      // Get product details for each item in the order
      const enrichedItems = await Promise.all(order.items.map(async (item) => {
        const product = await Product.findOne({ _id: item.productId });
        return {
          ...item,
          productDetails: product ? {
            name: product.name,
            description: product.description,
            category: product.category,
            subCategory: product.subCategory,
            image: product.image,
          } : { message: 'Product not found' }
        };
      }));

      
      
      // Return the enriched order with user and product information
      return {
        orderId: order._id,
        orderDate: new Date(order.date),
        status: order.status,
        amount: order.amount,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.payment ? 'Paid' : 'Not Paid',
        shippingAddress: order.address,
        items: enrichedItems,
        customer: user ? {
          name: user.name,
          email: user.email,
          userId: user._id
        } : { message: 'User not found' }
      };
    }));
    
    // Return the response
    return res.status(200).json({
      success: true,
      pagination: {
        total: totalOrders,
        page,
        limit,
        pages: Math.ceil(totalOrders / limit)
      },
      orders: enrichedOrders
    });
    
  } catch (error) {
    console.error('Error fetching order details:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch order details',
      error: error.message
    });
  }
};

// Additional controller to get order details by ID
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Validate order ID
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }
    
    // Get order
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Get user information
    const user = await User.findOne({ _id: order.userId }, { password: 0 }); // Exclude password
    
    // Get product details for each item in the order
    const enrichedItems = await Promise.all(order.items.map(async (item) => {
      const product = await Product.findOne({ _id: item.productId });
      return {
        ...item,
        productDetails: product ? {
          name: product.name,
          description: product.description,
          category: product.category,
          subCategory: product.subCategory,
          image: product.image,
          price: product.price,
          sizes: product.sizes
        } : { message: 'Product not found' }
      };
    }));
    
    // Return the enriched order with user and product information
    const enrichedOrder = {
      orderId: order._id,
      orderDate: new Date(order.date),
      status: order.status,
      amount: order.amount,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.payment ? 'Paid' : 'Not Paid',
      shippingAddress: order.address,
      items: enrichedItems,
      customer: user ? {
        name: user.name,
        email: user.email,
        userId: user._id
      } : { message: 'User not found' }
    };
    
    return res.status(200).json({
      success: true,
      order: enrichedOrder
    });
    
  } catch (error) {
    console.error('Error fetching order details:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch order details',
      error: error.message
    });
  }
};