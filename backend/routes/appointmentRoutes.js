// appointmentRoutes.js
const express = require("express");
const r1 = express.Router();
const ac = require("../controllers/appointmentController");
const { protect, authorize } = require("../middleware/authMiddleware");

r1.post("/", protect, ac.book);
r1.get("/my", protect, ac.getMyAppointments);
r1.get("/", protect, authorize("admin"), ac.getAll);
r1.get("/:id", protect, ac.getById);
r1.put("/:id/cancel", protect, ac.cancel);
r1.put("/:id/reschedule", protect, ac.reschedule);
r1.put("/:id/status", protect, authorize("admin"), ac.updateStatus);
r1.post("/:id/rate", protect, ac.rateAppointment);
module.exports = r1;
