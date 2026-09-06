const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const Payment = require("../models/Payment");
const Notification = require("../models/Notification");
const { v4: uuidv4 } = require("uuid");

// POST /api/appointments
exports.book = async (req, res) => {
  try {
    const { doctorId, date, timeSlot, reason, symptoms, type, mode } = req.body;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });
    if (!doctor.isAvailable) return res.status(400).json({ success: false, message: "Doctor unavailable" });

    const [yr, mo, dy] = date.split("-").map(Number);
    const startOfDay = new Date(yr, mo - 1, dy, 0, 0, 0);
    const endOfDay   = new Date(yr, mo - 1, dy, 23, 59, 59);

    const conflict = await Appointment.findOne({
      doctor: doctorId,
      date: { $gte: startOfDay, $lte: endOfDay },
      timeSlot,
      status: { $in: ["pending", "confirmed"] }
    });
    if (conflict) return res.status(400).json({ success: false, message: "This slot is already booked" });

    // Queue number for the day
    const dayAppointments = await Appointment.countDocuments({
      doctor: doctorId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: "cancelled" }
    });

    const fee = type === "followup" ? doctor.followUpFee : doctor.consultationFee;

    const appointment = await Appointment.create({
      patient: req.user._id, doctor: doctorId, date: new Date(date),
      timeSlot, reason, symptoms, type: type || "new", mode: mode || "in-person",
      fee, queueNumber: dayAppointments + 1,
      meetingLink: mode === "online" ? `https://meet.medibook.pro/${uuidv4()}` : undefined
    });

    // Update doctor patient count
    await Doctor.findByIdAndUpdate(doctorId, { $inc: { totalPatients: 1 } });

    // Notifications
    await Notification.insertMany([
      {
        user: req.user._id,
        title: "Appointment Booked ✅",
        message: `Your appointment with Dr. ${doctor.name} on ${new Date(date).toDateString()} at ${timeSlot} is confirmed.`,
        type: "appointment", data: { appointmentId: appointment._id }
      }
    ]);

    const populated = await appointment.populate([
      { path: "patient", select: "name email phone" },
      { path: "doctor", select: "name specialty hospital fee" }
    ]);

    res.status(201).json({ success: true, appointment: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/appointments/my
exports.getMyAppointments = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { patient: req.user._id };
    if (status) query.status = status;

    const total = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .populate("doctor", "name specialty hospital profileImage consultationFee")
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, total, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/appointments/:id
exports.getById = async (req, res) => {
  try {
    const apt = await Appointment.findById(req.params.id)
      .populate("patient", "name email phone bloodGroup")
      .populate("doctor", "name specialty hospital phone profileImage");
    if (!apt) return res.status(404).json({ success: false, message: "Not found" });
    if (apt.patient._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    res.json({ success: true, appointment: apt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/appointments/:id/cancel
exports.cancel = async (req, res) => {
  try {
    const { reason } = req.body;
    const apt = await Appointment.findById(req.params.id);
    if (!apt) return res.status(404).json({ success: false, message: "Not found" });

    const isOwner = apt.patient.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    apt.status = "cancelled";
    apt.cancellationReason = reason;
    apt.cancelledBy = req.user.role === "admin" ? "admin" : "patient";
    await apt.save();

    await Notification.create({
      user: apt.patient,
      title: "Appointment Cancelled",
      message: `Your appointment has been cancelled. Reason: ${reason || "Not specified"}`,
      type: "appointment"
    });

    res.json({ success: true, message: "Appointment cancelled", appointment: apt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/appointments/:id/reschedule
exports.reschedule = async (req, res) => {
  try {
    const { date, timeSlot } = req.body;
    const apt = await Appointment.findById(req.params.id);
    if (!apt) return res.status(404).json({ success: false, message: "Not found" });

    const conflict = await Appointment.findOne({
      _id: { $ne: apt._id }, doctor: apt.doctor,
      date: new Date(date), timeSlot, status: { $in: ["pending","confirmed"] }
    });
    if (conflict) return res.status(400).json({ success: false, message: "New slot already booked" });

    apt.date = new Date(date);
    apt.timeSlot = timeSlot;
    apt.status = "pending";
    await apt.save();

    res.json({ success: true, message: "Appointment rescheduled", appointment: apt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/appointments/:id/status (admin/doctor)
exports.updateStatus = async (req, res) => {
  try {
    const { status, notes, prescription, vitals } = req.body;
    const apt = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status, ...(notes && { notes }), ...(prescription && { prescription }), ...(vitals && { vitals }) },
      { new: true }
    ).populate("patient doctor");
    if (!apt) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, appointment: apt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/appointments/:id/rate
exports.rateAppointment = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const apt = await Appointment.findById(req.params.id);
    if (!apt) return res.status(404).json({ success: false, message: "Not found" });
    if (apt.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not your appointment" });
    }
    apt.rating = rating;
    apt.review = review;
    await apt.save();
    res.json({ success: true, message: "Rating submitted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/appointments (admin)
exports.getAll = async (req, res) => {
  try {
    const { status, date, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (date) {
      const d = new Date(date);
      const next = new Date(d); next.setDate(next.getDate() + 1);
      query.date = { $gte: d, $lt: next };
    }
    const total = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .populate("patient", "name email phone")
      .populate("doctor", "name specialty hospital")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, total, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
