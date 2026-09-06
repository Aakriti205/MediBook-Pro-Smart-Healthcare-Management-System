const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const Payment = require("../models/Payment");
const Notification = require("../models/Notification");

// GET /api/admin/stats
exports.getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalDoctors, totalAppointments, totalPayments] = await Promise.all([
      User.countDocuments({ role: "patient" }),
      Doctor.countDocuments(),
      Appointment.countDocuments(),
      Payment.aggregate([{ $match: { status: "success" } }, { $group: { _id: null, total: { $sum: "$amount" } } }])
    ]);

    const appointmentsByStatus = await Appointment.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const monthlyRevenue = await Payment.aggregate([
      { $match: { status: "success", createdAt: { $gte: new Date(Date.now() - 30*24*60*60*1000) } } },
      { $group: { _id: { $dayOfMonth: "$createdAt" }, revenue: { $sum: "$amount" }, count: { $sum: 1 } } },
      { $sort: { "_id": 1 } }
    ]);

    const topDoctors = await Doctor.find().sort({ totalPatients: -1, rating: -1 }).limit(5).select("name specialty rating totalPatients");
    const recentAppointments = await Appointment.find()
      .populate("patient", "name")
      .populate("doctor", "name specialty")
      .sort({ createdAt: -1 }).limit(5);

    res.json({
      success: true,
      stats: {
        totalUsers, totalDoctors, totalAppointments,
        revenue: totalPayments[0]?.total || 0,
        appointmentsByStatus, monthlyRevenue, topDoctors, recentAppointments
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } }
    ];
    const total = await User.countDocuments(query);
    const users = await User.find(query).sort({ createdAt: -1 }).skip((page-1)*limit).limit(Number(limit));
    res.json({ success: true, total, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/users/:id/toggle
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, message: `User ${user.isActive ? "activated" : "deactivated"}`, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/admin/broadcast
exports.broadcast = async (req, res) => {
  try {
    const { title, message, role } = req.body;
    const query = role ? { role } : {};
    const users = await User.find(query).select("_id");
    const notifications = users.map(u => ({ user: u._id, title, message, type: "system" }));
    await Notification.insertMany(notifications);
    res.json({ success: true, message: `Broadcast sent to ${users.length} users` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
