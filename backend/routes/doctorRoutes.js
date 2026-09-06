const express = require("express");
const r = express.Router();
const c = require("../controllers/doctorController");
const { protect, authorize } = require("../middleware/authMiddleware");

r.get("/", c.getAllDoctors);
r.get("/specialties", c.getSpecialties);
r.get("/:id", c.getDoctorById);
r.get("/:id/slots", c.getAvailableSlots);
r.post("/:id/reviews", protect, c.addReview);
r.post("/", protect, authorize("admin"), c.createDoctor);
r.put("/:id", protect, authorize("admin"), c.updateDoctor);
r.delete("/:id", protect, authorize("admin"), c.deleteDoctor);
module.exports = r;
