import Razorpay from "razorpay";
import crypto from "crypto";
import paymentModel from "../models/paymentModel.js";
import orderModel from "../models/orderModel.js"; 

const razorpay = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET
});

export const initiateOrder = async (req, res) => {
  const { amount, currency = "INR", userId, orderId } = req.body;

  if (!amount || !userId || !orderId) {
    return res.status(400).json({ 
      success: false, 
      message: "Missing required fields" 
    });
  }

  try {
    const options = {
      amount: Math.round(amount * 100), 
      currency,
      receipt: `receipt_${orderId}`,
      payment_capture: 1
    };

    const order = await razorpay.orders.create(options);

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

export const verifyAndSavePayment = async (req, res) => {
  const {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    userId,
    orderId,
    amountPaid
  } = req.body;

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return res.status(400).json({ 
      success: false, 
      message: "Missing Razorpay details" 
    });
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    return res.status(400).json({ 
      success: false, 
      message: "Invalid payment signature" 
    });
  }

  try {
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

    await orderModel.findByIdAndUpdate(orderId, { 
      payment: true
    });

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
