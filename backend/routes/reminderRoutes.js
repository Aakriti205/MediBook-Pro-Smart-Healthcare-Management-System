const express = require("express");
const r = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const { sendReminders } = require("../utils/reminderScheduler");
const Notification = require("../models/Notification");
const Appointment  = require("../models/Appointment");

// POST /api/reminders/trigger  (admin only — manually fires the reminder check)
r.post("/trigger", protect, authorize("admin"), async (req, res) => {
  try {
    await sendReminders();
    res.json({ success: true, message: "Reminder check completed. Check notifications." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/reminders/test  (admin — creates a test reminder for a specific user)
r.post("/test", protect, authorize("admin"), async (req, res) => {
  try {
    const { userId } = req.body;
    const targetUser = userId || req.user._id;
    await Notification.create({
      user:    targetUser,
      title:   "⏰ Test Reminder — 1 Hour Before Appointment",
      message: "This is a test reminder. Your appointment is in 1 hour. Please be ready on time.",
      type:    "reminder",
      data:    { test: true },
      isRead:  false,
    });
    res.json({ success: true, message: "Test reminder notification sent." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/reminders/upcoming  (admin — shows appointments due for reminders)
r.get("/upcoming", protect, authorize("admin"), async (req, res) => {
  try {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24.5 * 60 * 60 * 1000);
    const upcoming = await Appointment.find({
      status: { $in: ["confirmed", "pending"] },
      date:   { $gte: now, $lte: in24h },
    })
      .populate("patient", "name email")
      .populate("doctor",  "name specialty")
      .sort({ date: 1 });

    res.json({
      success: true,
      count: upcoming.length,
      appointments: upcoming.map(a => ({
        id:            a._id,
        patient:       a.patient?.name,
        doctor:        a.doctor?.name,
        date:          a.date,
        timeSlot:      a.timeSlot,
        status:        a.status,
        reminderSent:  a.reminderSent,
        hoursUntil:    ((a.date - now) / (1000 * 60 * 60)).toFixed(1),
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = r;
