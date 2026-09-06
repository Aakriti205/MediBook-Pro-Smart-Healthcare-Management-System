const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");

// GET /api/doctors
exports.getAllDoctors = async (req, res) => {
  try {
    const { specialty, location, locality, name, minFee, maxFee, minRating, available, page = 1, limit = 12, sort = "-rating" } = req.query;
    const query = {};

    if (specialty) query.specialty = { $regex: specialty, $options: "i" };
    if (location)  query.location  = { $regex: location, $options: "i" };
    if (locality)  query.locality  = { $regex: locality, $options: "i" };
    if (name)      query.name      = { $regex: name, $options: "i" };
    if (available === "true") query.isAvailable = true;
    if (minFee || maxFee) {
      query.consultationFee = {};
      if (minFee) query.consultationFee.$gte = Number(minFee);
      if (maxFee) query.consultationFee.$lte = Number(maxFee);
    }
    if (minRating) query.rating = { $gte: Number(minRating) };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Doctor.countDocuments(query);
    const doctors = await Doctor.find(query).sort(sort).skip(skip).limit(Number(limit));

    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / limit), doctors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/doctors/:id
exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate("reviews.patient", "name profileImage");
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });
    res.json({ success: true, doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/doctors (admin)
exports.createDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.create(req.body);
    res.status(201).json({ success: true, doctor });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/doctors/:id (admin)
exports.updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });
    res.json({ success: true, doctor });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/doctors/:id (admin)
exports.deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });
    res.json({ success: true, message: "Doctor deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/doctors/:id/reviews
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });

    // Check if already reviewed
    const already = doctor.reviews.find(r => r.patient?.toString() === req.user._id.toString());
    if (already) return res.status(400).json({ success: false, message: "Already reviewed this doctor" });

    doctor.reviews.push({ patient: req.user._id, rating, comment });
    doctor.totalReviews = doctor.reviews.length;
    doctor.rating = (doctor.reviews.reduce((a, r) => a + r.rating, 0) / doctor.reviews.length).toFixed(1);
    await doctor.save();
    res.json({ success: true, message: "Review added", rating: doctor.rating });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/doctors/:id/slots?date=YYYY-MM-DD
exports.getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query;
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });

    // Fix: parse date without timezone shift by splitting manually
    const [year, month, day] = date.split("-").map(Number);
    const localDate = new Date(year, month - 1, day);
    const dayName = localDate.toLocaleDateString("en-US", { weekday: "long" });

    // Use doctor's availableSlots if they exist, otherwise use default slots for all days
    let daySlots = doctor.availableSlots.filter(s => s.day === dayName);

    if (daySlots.length === 0) {
      // Default: morning + afternoon slots for any day except Sunday
      if (dayName !== "Sunday") {
        daySlots = [
          { day: dayName, startTime: "09:00", endTime: "13:00" },
          { day: dayName, startTime: "14:00", endTime: "18:00" },
        ];
      }
    }

    // Get already booked slots for that day (match date range to avoid timezone issues)
    const startOfDay = new Date(year, month - 1, day, 0, 0, 0);
    const endOfDay   = new Date(year, month - 1, day, 23, 59, 59);

    const booked = await Appointment.find({
      doctor: doctor._id,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ["pending", "confirmed"] }
    }).select("timeSlot");

    const bookedTimes = booked.map(a => a.timeSlot);
    const allSlots    = generateTimeSlots(daySlots);
    const available   = allSlots.filter(s => !bookedTimes.includes(s));

    res.json({ success: true, date, day: dayName, available, booked: bookedTimes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/doctors/specialties
exports.getSpecialties = async (req, res) => {
  try {
    const specialties = await Doctor.distinct("specialty");
    res.json({ success: true, specialties });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

function generateTimeSlots(daySlots) {
  const slots = [];
  daySlots.forEach(slot => {
    let [h, m] = slot.startTime.split(":").map(Number);
    const [eh, em] = slot.endTime.split(":").map(Number);
    while (h < eh || (h === eh && m < em)) {
      const hour = h % 12 || 12;
      const ampm = h < 12 ? "AM" : "PM";
      slots.push(`${hour.toString().padStart(2,"0")}:${m.toString().padStart(2,"0")} ${ampm}`);
      m += 30;
      if (m >= 60) { m -= 60; h++; }
    }
  });
  return slots;
}
