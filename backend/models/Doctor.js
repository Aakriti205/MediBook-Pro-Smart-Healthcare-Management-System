const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
  day:       { type: String, enum: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"] },
  startTime: String,
  endTime:   String,
  maxPatients: { type: Number, default: 10 }
}, { _id: false });

const reviewSchema = new mongoose.Schema({
  patient:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  rating:    { type: Number, min: 1, max: 5 },
  comment:   String,
  createdAt: { type: Date, default: Date.now }
});

const doctorSchema = new mongoose.Schema({
  user:           { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  name:           { type: String, required: true, trim: true },
  specialty:      { type: String, required: true },
  subSpecialty:   String,
  hospital:       { type: String, required: true },
  department:     String,
  email:          { type: String, lowercase: true, trim: true },
  phone:          String,
  experience:     { type: Number, default: 0 },
  qualifications: [String],
  location:       String,
  locality:       String,
  about:          String,
  consultationFee:{ type: Number, default: 0 },
  followUpFee:    { type: Number, default: 0 },
  availableSlots: [slotSchema],
  reviews:        [reviewSchema],
  rating:         { type: Number, default: 0, min: 0, max: 5 },
  totalReviews:   { type: Number, default: 0 },
  totalPatients:  { type: Number, default: 0 },
  isAvailable:    { type: Boolean, default: true },
  isVerified:     { type: Boolean, default: false },
  profileImage:   { type: String, default: "" },
  languages:      [String],
  awards:         [String],
  consultationType: {
    inPerson: { type: Boolean, default: true },
    online:   { type: Boolean, default: false }
  },
  nextAvailable: Date
}, { timestamps: true });

doctorSchema.index({ specialty: 1, location: 1 });
doctorSchema.index({ name: "text", specialty: "text", hospital: "text" });

module.exports = mongoose.model("Doctor", doctorSchema);
