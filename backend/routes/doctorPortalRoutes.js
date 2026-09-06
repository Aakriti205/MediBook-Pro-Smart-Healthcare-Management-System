const express = require("express");
const r = express.Router();
const c = require("../controllers/doctorPortalController");
const { protect, authorize } = require("../middleware/authMiddleware");
const doctor = [protect, authorize("doctor", "admin")];

r.get("/profile",                  ...doctor, c.getMyProfile);
r.put("/profile",                  ...doctor, c.updateMyProfile);
r.get("/appointments",             ...doctor, c.getMyAppointments);
r.get("/appointments/today",       ...doctor, c.getTodayAppointments);
r.put("/appointments/:id/confirm", ...doctor, c.confirmAppointment);
r.put("/appointments/:id/complete",...doctor, c.completeAppointment);
r.put("/appointments/:id/cancel",  ...doctor, c.cancelAppointment);
r.get("/stats",                    ...doctor, c.getStats);
r.get("/patients",                 ...doctor, c.getMyPatients);
r.put("/availability",             ...doctor, c.updateAvailability);

module.exports = r;
