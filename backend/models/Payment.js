const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },
  patient:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  doctor:      { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
  amount:      { type: Number, required: true },
  currency:    { type: String, default: "INR" },
  method:      { type: String, enum: ["cash","card","upi","netbanking","wallet"], required: true },
  status:      { type: String, enum: ["pending","success","failed","refunded"], default: "pending" },
  transactionId: String,
  gatewayOrderId: String,
  gatewayPaymentId: String,
  receipt:     String,
  refundAmount: { type: Number, default: 0 },
  refundReason: String,
  refundedAt:  Date,
  paidAt:      Date,
  invoice: {
    number:   String,
    url:      String,
    generatedAt: Date
  },
  tax:         { type: Number, default: 0 },
  discount:    { type: Number, default: 0 },
  couponCode:  String
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);
