const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  phone:    { type: String, trim: true },
  role:     { type: String, enum: ["patient", "doctor", "admin"], default: "patient" },
  age:      { type: Number, min: 0, max: 120 },
  gender:   { type: String, enum: ["male", "female", "other"] },
  address:  { type: String },
  bloodGroup: { type: String, enum: ["A+","A-","B+","B-","AB+","AB-","O+","O-"] },
  medicalHistory: [{ condition: String, since: String, notes: String }],
  profileImage: { type: String, default: "" },
  emergencyContact: {
    name: String,
    phone: String,
    relation: String
  },
  notifications: {
    email:  { type: Boolean, default: true },
    sms:    { type: Boolean, default: false }
  },
  refreshToken: { type: String, select: false },
  passwordResetToken: String,
  passwordResetExpires: Date,
  isVerified:   { type: Boolean, default: false },
  otp:          { type: String, select: false },
  otpExpires:   { type: Date, select: false },
  isActive:   { type: Boolean, default: true },
  lastLogin:  { type: Date },
  loginCount: { type: Number, default: 0 }
}, { timestamps: true });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

userSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.passwordResetToken;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
