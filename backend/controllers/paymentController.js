const Payment = require("../models/Payment");
const Appointment = require("../models/Appointment");
const { v4: uuidv4 } = require("uuid");

// POST /api/payments
exports.createPayment = async (req, res) => {
  try {
    const { appointmentId, method, couponCode } = req.body;
    const apt = await Appointment.findById(appointmentId).populate("doctor");
    if (!apt) return res.status(404).json({ success: false, message: "Appointment not found" });

    let discount = 0;
    if (couponCode === "FIRST20") discount = Math.round(apt.fee * 0.2);
    if (couponCode === "SAVE50") discount = 50;

    const tax = Math.round((apt.fee - discount) * 0.18);
    const totalAmount = apt.fee - discount + tax;

    const payment = await Payment.create({
      appointment: appointmentId,
      patient: req.user._id,
      doctor: apt.doctor._id,
      amount: totalAmount,
      method,
      couponCode,
      discount,
      tax,
      receipt: `RCP-${uuidv4().substring(0,8).toUpperCase()}`,
      status: "success",
      transactionId: `TXN-${uuidv4().substring(0,12).toUpperCase()}`,
      paidAt: new Date(),
      invoice: {
        number: `INV-${Date.now()}`,
        generatedAt: new Date()
      }
    });

    apt.paymentStatus = "paid";
    apt.paymentId = payment._id;
    apt.status = "confirmed";
    await apt.save();

    res.status(201).json({ success: true, payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/payments/my
exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ patient: req.user._id })
      .populate("appointment", "date timeSlot type")
      .populate("doctor", "name specialty")
      .sort({ createdAt: -1 });
    res.json({ success: true, payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/payments/:id/refund (admin)
exports.refund = async (req, res) => {
  try {
    const { reason } = req.body;
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });

    payment.status = "refunded";
    payment.refundAmount = payment.amount;
    payment.refundReason = reason;
    payment.refundedAt = new Date();
    await payment.save();

    await Appointment.findByIdAndUpdate(payment.appointment, { paymentStatus: "refunded" });
    res.json({ success: true, message: "Refund processed", payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/payments/stats (admin)
exports.getStats = async (req, res) => {
  try {
    const result = await Payment.aggregate([
      { $match: { status: "success" } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 }, avgAmount: { $avg: "$amount" } } }
    ]);
    const byMethod = await Payment.aggregate([
      { $match: { status: "success" } },
      { $group: { _id: "$method", total: { $sum: "$amount" }, count: { $sum: 1 } } }
    ]);
    res.json({ success: true, stats: result[0] || {}, byMethod });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
