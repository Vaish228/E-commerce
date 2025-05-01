import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";

const placeOrder = async (req, res) => {
    try {
  //    console.log("Hi");
        const {userId, items, amount, address} = req.body;
        const orderData = {
            userId, items, address, amount, paymentMethod: "COD", payment: false, date: Date.now()
        }
        const newOrder = new orderModel(orderData)
        await newOrder.save()

        await userModel.findByIdAndUpdate(userId, {cartData:{}})
   //   console.log("order");
        res.json({success:true, message:"Order Placed"})

    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }

}



const placeOrderRazorpay = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body;
        
        // Validate required fields
        if (!userId || !items || !amount || !address) {
          return res.status(400).json({
            success: false,
            message: "Missing required fields"
          });
        }
        
        // Create new order with razorpay payment method and payment=false
        const orderData = {
          userId,
          items,
          address,
          amount,
          paymentMethod: "razorpay", 
          payment: false, // Payment not completed yet
          date: Date.now()
        };
        
        // Save the order to the database
        const newOrder = new orderModel(orderData);
        await newOrder.save();
        
        // Clear user's cart
        await userModel.findByIdAndUpdate(userId, { cartData: {} });
        
        // Return success response with the orderId
        res.json({
          success: true,
          message: "Order created successfully",
          orderId: newOrder._id // Send the order ID to frontend
        });
        
      } catch (error) {
        console.error("Place order error:", error);
        res.status(500).json({
          success: false,
          message: error.message || "Failed to place order"
        });
      }
    
}

const allOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({})
        res.json({success:true,orders})
    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

const userOrders= async (req, res) => {
    try {
        const { userId } = req.body
        const orders = await orderModel.find({userId})
        res.json({success:true, orders})

    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
    
}
export const getOrderStatus = async (req, res) => {
    const { orderId } = req.params;  // Extract orderId from the request parameters
  
    try {
      // Find the order by orderId
      const order = await orderModel.findById(orderId);
      
      // If the order doesn't exist, send a 404 error
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      // Send the order status in the response
      return res.status(200).json({ status: order.status });
    } catch (error) {
      // Handle errors (e.g., database errors)
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
const updateStatus = async (req, res) => {

    
}

export {placeOrder, placeOrderRazorpay, allOrders, userOrders, updateStatus}
