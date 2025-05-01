import Razorpay from "razorpay";
import crypto from "crypto";
import paymentModel from "../models/paymentModel.js";
import orderModel from "../models/orderModel.js"; // Import your order model

// Initialize Razorpay with your credentials
const razorpay = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET
});

// 1. Initiate Razorpay Order
export const initiateOrder = async (req, res) => {
  const { amount, currency = "INR", userId, orderId } = req.body;

  if (!amount || !userId || !orderId) {
    return res.status(400).json({ 
      success: false, 
      message: "Missing required fields" 
    });
  }

  try {
    // Create options object for Razorpay
    const options = {
      amount: Math.round(amount * 100), // Convert to paise and ensure it's an integer
      currency,
      receipt: `receipt_${orderId}`,
      payment_capture: 1
    };

    // Create order in Razorpay
    const order = await razorpay.orders.create(options);

    // Send response back to client
    res.status(200).json({
      success: true,
      message: "Order created",
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt
    });
  } catch (error) {
    console.error("Razorpay order creation failed:", error);
    res.status(500).json({ 
      success: false,
      message: "Razorpay order creation failed", 
      error: error.message 
    });
  }
};

// 2. Verify Signature and Save Payment
export const verifyAndSavePayment = async (req, res) => {
  const {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    userId,
    orderId,
    amountPaid
  } = req.body;

  // Validate required fields
  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return res.status(400).json({ 
      success: false, 
      message: "Missing Razorpay details" 
    });
  }

  // Verify the payment signature
  const expectedSignature = crypto
    .createHmac("sha256", process.env.KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  // Check if signature matches
  if (expectedSignature !== razorpaySignature) {
    return res.status(400).json({ 
      success: false, 
      message: "Invalid payment signature" 
    });
  }

  try {
    // Create and save payment record
    const payment = new paymentModel({
      userId,
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      amountPaid,
      status: "success"
    });

    await payment.save();

    // Update order status to "paid" (assuming you have a status field in your order model)
    await orderModel.findByIdAndUpdate(orderId, { 
      payment: true
    });

    // Send successful response
    res.status(200).json({ 
      success: true,
      message: "Payment verified & saved", 
      payment 
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({ 
      success: false,
      message: "Payment verification failed", 
      error: error.message 
    });
  }
};

// 3. Get Payment Status by Order ID
export const getPaymentStatus = async (req, res) => {
  const { orderId } = req.params;

  try {
    const payment = await paymentModel.findOne({ orderId });

    if (!payment) {
      return res.status(404).json({ 
        success: false, 
        message: "Payment not found" 
      });
    }

    res.status(200).json({ 
      success: true,
      status: payment.status, 
      amount: payment.amountPaid,
      paymentId: payment.razorpayPaymentId
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Error fetching payment status", 
      error: error.message 
    });
  }
};
