import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "user", 
    required: true 
  },
  orderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "order", 
    required: true 
  },
  razorpayOrderId: { 
    type: String, 
    required: true 
  },
  razorpayPaymentId: { 
    type: String, 
    required: true 
  },
  razorpaySignature: { 
    type: String, 
    required: true 
  },
  amountPaid: { 
    type: Number, 
    required: true 
  },
  currency: { 
    type: String, 
    default: "INR" 
  },
  status: { 
    type: String, 
    enum: ["success", "failed"], 
    required: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

// Create a unique index on razorpayPaymentId to avoid duplicate payments
paymentSchema.index({ razorpayPaymentId: 1 }, { unique: true });

const paymentModel = mongoose.models.payment || mongoose.model("payment", paymentSchema);

export default paymentModel;