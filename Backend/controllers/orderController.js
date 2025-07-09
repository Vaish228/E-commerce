import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";

const placeOrder = async (req, res) => {
    try {
        const {userId, items, amount, address} = req.body;
        const orderData = {
            userId, items, address, amount, paymentMethod: "COD", payment: false, date: Date.now()
        }
        const newOrder = new orderModel(orderData)
        await newOrder.save()

        await userModel.findByIdAndUpdate(userId, {cartData:{}})
        res.json({success:true, message:"Order Placed"})

    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }

}



const placeOrderRazorpay = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body;
        
        if (!userId || !items || !amount || !address) {
          return res.status(400).json({
            success: false,
            message: "Missing required fields"
          });
        }
        
        const orderData = {
          userId,
          items,
          address,
          amount,
          paymentMethod: "razorpay", 
          payment: false, 
          date: Date.now()
        };
        
        const newOrder = new orderModel(orderData);
        await newOrder.save();
        
        await userModel.findByIdAndUpdate(userId, { cartData: {} });
        
        res.json({
          success: true,
          message: "Order created successfully",
          orderId: newOrder._id 
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
    const { orderId } = req.params;  
    try {
      const order = await orderModel.findById(orderId);
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      return res.status(200).json({ status: order.status });
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
const updateStatus = async (req, res) => {

    
}

export {placeOrder, placeOrderRazorpay, allOrders, userOrders, updateStatus}
