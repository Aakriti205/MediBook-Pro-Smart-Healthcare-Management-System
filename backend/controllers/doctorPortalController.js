const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const Notification = require("../models/Notification");
const User = require("../models/User");

// GET /api/doctor-portal/profile
exports.getMyProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor profile not found" });
    res.json({ success: true, doctor });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// PUT /api/doctor-portal/profile
exports.updateMyProfile = async (req, res) => {
  try {
    const fields = ["about","phone","location","consultationFee","followUpFee","availableSlots","languages","awards","consultationType","isAvailable"];
    const updates = {};
    fields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const doctor = await Doctor.findOneAndUpdate({ user: req.user._id }, updates, { new: true, runValidators: true });
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor profile not found" });
    res.json({ success: true, doctor });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

// GET /api/doctor-portal/appointments
exports.getMyAppointments = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor profile not found" });
    const { status, date, page = 1, limit = 20 } = req.query;
    const query = { doctor: doctor._id };
    if (status) query.status = status;
    if (date) {
      const [yr, mo, dy] = date.split("-").map(Number);
      query.date = { $gte: new Date(yr, mo-1, dy, 0, 0, 0), $lte: new Date(yr, mo-1, dy, 23, 59, 59) };
    }
    const total = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .populate("patient", "name email phone age gender bloodGroup address")
      .sort({ date: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, total, appointments });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// GET /api/doctor-portal/appointments/today
exports.getTodayAppointments = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor profile not found" });
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const end   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    const appointments = await Appointment.find({
      doctor: doctor._id,
      date: { $gte: start, $lte: end },
      status: { $in: ["pending","confirmed"] }
    }).populate("patient", "name phone age gender bloodGroup").sort({ timeSlot: 1 });
    res.json({ success: true, count: appointments.length, appointments });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// PUT /api/doctor-portal/appointments/:id/complete
exports.completeAppointment = async (req, res) => {
  try {
    const { notes, prescription, vitals } = req.body;
    const doctor = await Doctor.findOne({ user: req.user._id });
    const apt = await Appointment.findOne({ _id: req.params.id, doctor: doctor._id });
    if (!apt) return res.status(404).json({ success: false, message: "Appointment not found" });
    apt.status = "completed";
    if (notes) apt.notes = notes;
    if (prescription) apt.prescription = prescription;
    if (vitals) apt.vitals = vitals;
    await apt.save();
    await Notification.create({
      user: apt.patient,
      title: "Appointment Completed",
      message: `Your appointment has been completed. ${prescription ? "Your prescription is ready." : ""}`,
      type: "appointment",
      data: { appointmentId: apt._id }
    });
    res.json({ success: true, message: "Appointment completed", appointment: apt });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// PUT /api/doctor-portal/appointments/:id/confirm
exports.confirmAppointment = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    const apt = await Appointment.findOneAndUpdate(
      { _id: req.params.id, doctor: doctor._id },
      { status: "confirmed" },
      { new: true }
    ).populate("patient", "name");
    if (!apt) return res.status(404).json({ success: false, message: "Appointment not found" });
    await Notification.create({
      user: apt.patient._id,
      title: "Appointment Confirmed ✅",
      message: `Dr. has confirmed your appointment on ${new Date(apt.date).toDateString()} at ${apt.timeSlot}.`,
      type: "appointment"
    });
    res.json({ success: true, appointment: apt });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// PUT /api/doctor-portal/appointments/:id/cancel
exports.cancelAppointment = async (req, res) => {
  try {
    const { reason } = req.body;
    const doctor = await Doctor.findOne({ user: req.user._id });
    const apt = await Appointment.findOneAndUpdate(
      { _id: req.params.id, doctor: doctor._id },
      { status: "cancelled", cancellationReason: reason, cancelledBy: "doctor" },
      { new: true }
    ).populate("patient", "name");
    if (!apt) return res.status(404).json({ success: false, message: "Appointment not found" });
    await Notification.create({
      user: apt.patient._id,
      title: "Appointment Cancelled",
      message: `Your appointment has been cancelled by the doctor. Reason: ${reason || "Not specified"}`,
      type: "appointment"
    });
    res.json({ success: true, appointment: apt });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// GET /api/doctor-portal/stats
exports.getStats = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor profile not found" });
    const [total, confirmed, completed, cancelled, pending] = await Promise.all([
      Appointment.countDocuments({ doctor: doctor._id }),
      Appointment.countDocuments({ doctor: doctor._id, status: "confirmed" }),
      Appointment.countDocuments({ doctor: doctor._id, status: "completed" }),
      Appointment.countDocuments({ doctor: doctor._id, status: "cancelled" }),
      Appointment.countDocuments({ doctor: doctor._id, status: "pending" }),
    ]);
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    const todayCount = await Appointment.countDocuments({ doctor: doctor._id, date: { $gte: todayStart, $lte: todayEnd }, status: { $in: ["confirmed","pending"] } });
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthly = await Appointment.aggregate([
      { $match: { doctor: doctor._id, createdAt: { $gte: monthStart }, status: { $ne: "cancelled" } } },
      { $group: { _id: { $dayOfMonth: "$createdAt" }, count: { $sum: 1 } } },
      { $sort: { "_id": 1 } }
    ]);
    const recentPatients = await Appointment.find({ doctor: doctor._id, status: "completed" })
      .populate("patient", "name age gender phone bloodGroup")
      .sort({ date: -1 }).limit(5);
    res.json({ success: true, stats: { total, confirmed, completed, cancelled, pending, todayCount, rating: doctor.rating, totalPatients: doctor.totalPatients, monthly, recentPatients } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// PUT /api/doctor-portal/availability
exports.updateAvailability = async (req, res) => {
  try {
    const { isAvailable, availableSlots } = req.body;
    const doctor = await Doctor.findOneAndUpdate(
      { user: req.user._id },
      { isAvailable, ...(availableSlots && { availableSlots }) },
      { new: true }
    );
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor profile not found" });
    res.json({ success: true, message: `You are now ${isAvailable ? "available" : "unavailable"}`, doctor });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// GET /api/doctor-portal/patients
exports.getMyPatients = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor profile not found" });
    const apts = await Appointment.find({ doctor: doctor._id, status: { $in: ["completed","confirmed"] } })
      .populate("patient", "name email phone age gender bloodGroup address")
      .sort({ date: -1 });
    // Unique patients
    const seen = new Set();
    const patients = [];
    for (const a of apts) {
      if (a.patient && !seen.has(a.patient._id.toString())) {
        seen.add(a.patient._id.toString());
        patients.push({ ...a.patient.toObject(), lastVisit: a.date, appointmentCount: apts.filter(x => x.patient?._id.toString() === a.patient._id.toString()).length });
      }
    }
    res.json({ success: true, total: patients.length, patients });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
