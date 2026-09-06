const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  patient:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  doctor:     { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  date:       { type: Date, required: true },
  timeSlot:   { type: String, required: true },
  type:       { type: String, enum: ["new", "followup", "emergency"], default: "new" },
  mode:       { type: String, enum: ["in-person", "online"], default: "in-person" },
  status:     { type: String, enum: ["pending","confirmed","cancelled","completed","no-show"], default: "pending" },
  reason:     String,
  symptoms:   [String],
  notes:      String,
  prescription: {
    medicines: [{ name: String, dosage: String, duration: String }],
    instructions: String,
    followUpDate: Date
  },
  vitals: {
    bp: String,
    pulse: String,
    temperature: String,
    weight: String,
    height: String
  },
  fee:          { type: Number, default: 0 },
  paymentStatus:{ type: String, enum: ["unpaid","paid","refunded"], default: "unpaid" },
  paymentId:    String,
  cancellationReason: String,
  cancelledBy:  { type: String, enum: ["patient","doctor","admin"] },
  reminderSent: { type: Boolean, default: false },
  meetingLink:  String,
  queueNumber:  Number,
  rating:       { type: Number, min: 1, max: 5 },
  review:       String
}, { timestamps: true });

appointmentSchema.index({ patient: 1, date: -1 });
appointmentSchema.index({ doctor: 1, date: 1 });

module.exports = mongoose.model("Appointment", appointmentSchema);
