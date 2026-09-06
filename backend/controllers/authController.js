const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Notification = require("../models/Notification");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
const generateRefreshToken = (id) => jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN });
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
}

async function sendOTPEmail(email, otp, name) {
  if (!transporter) { console.log(`\n📧 [DEV MODE] OTP for ${email} => ${otp}\n`); return; }
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || "MediBook Pro <noreply@medibook.pro>",
    to: email,
    subject: "Your MediBook Pro Verification OTP",
    html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;background:#060d1f;color:#f0f4ff;border-radius:16px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#00d4aa,#0099cc);padding:28px;text-align:center;">
        <h1 style="margin:0;color:#fff;font-size:22px;">✦ MediBook Pro</h1>
        <p style="margin:6px 0 0;color:rgba(255,255,255,.85);font-size:13px;">Account Verification</p>
      </div>
      <div style="padding:32px;">
        <h2 style="font-size:18px;margin:0 0 12px;">Hello, ${name}!</h2>
        <p style="color:#8b9bb4;font-size:14px;line-height:1.7;margin:0 0 20px;">Use the OTP below to verify your account. It expires in <strong style="color:#f0c040;">10 minutes</strong>.</p>
        <div style="background:rgba(0,212,170,.1);border:2px dashed rgba(0,212,170,.4);border-radius:14px;padding:24px;text-align:center;margin-bottom:24px;">
          <div style="font-size:44px;font-weight:900;letter-spacing:16px;color:#00d4aa;font-family:monospace;">${otp}</div>
        </div>
        <p style="color:#4a5568;font-size:12px;">If you didn't request this, ignore this email. Never share your OTP.</p>
      </div>
      <div style="background:rgba(255,255,255,.04);padding:14px;text-align:center;font-size:11px;color:#4a5568;">© 2024 MediBook Pro</div>
    </div>`,
  });
}

// POST /api/auth/send-otp
exports.sendOTP = async (req, res) => {
  try {
    const { name, email, password, phone, age, gender } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: "Name, email and password required" });
    const exists = await User.findOne({ email, isVerified: true });
    if (exists) return res.status(400).json({ success: false, message: "Email already registered" });
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    let temp = await User.findOne({ email, isVerified: false });
    if (temp) {
      temp.name = name; temp.phone = phone; temp.age = age; temp.gender = gender;
      temp.otp = otp; temp.otpExpires = otpExpires;
      if (password) { temp.password = password; }
      await temp.save();
    } else {
      await User.create({ name, email, password, phone, age, gender, otp, otpExpires, isVerified: false, role: "patient" });
    }
    await sendOTPEmail(email, otp, name);
    res.json({ success: true, message: transporter ? `OTP sent to ${email}` : `[Dev] OTP: ${otp}`, devOtp: !transporter ? otp : undefined });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// POST /api/auth/verify-otp
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email }).select("+otp +otpExpires +password +refreshToken");
    if (!user) return res.status(400).json({ success: false, message: "No registration found for this email" });
    if (user.isVerified) return res.status(400).json({ success: false, message: "Account already verified. Please login." });
    if (!user.otp || user.otp !== otp) return res.status(400).json({ success: false, message: "Invalid OTP" });
    if (new Date() > user.otpExpires) return res.status(400).json({ success: false, message: "OTP expired. Please register again." });
    user.isVerified = true; user.otp = undefined; user.otpExpires = undefined;
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken; user.lastLogin = new Date(); user.loginCount = 1;
    await user.save({ validateBeforeSave: false });
    await Notification.create({ user: user._id, title: "Welcome to MediBook Pro! 🎉", message: `Hello ${user.name}, your account is verified. Book your first appointment today.`, type: "system" });
    res.status(201).json({ success: true, token, refreshToken, user: user.toPublicJSON() });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// POST /api/auth/resend-otp
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email, isVerified: false }).select("+otp +otpExpires");
    if (!user) return res.status(400).json({ success: false, message: "No pending registration for this email" });
    const otp = generateOTP();
    user.otp = otp; user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save({ validateBeforeSave: false });
    await sendOTPEmail(email, otp, user.name);
    res.json({ success: true, message: "OTP resent", devOtp: !transporter ? otp : undefined });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// POST /api/auth/login  (patient + admin + doctor)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password +refreshToken");
    if (!user) return res.status(401).json({ success: false, message: "Invalid email or password" });
    if (!user.isActive) return res.status(403).json({ success: false, message: "Account deactivated. Contact support." });
    if (!user.isVerified) return res.status(403).json({ success: false, message: "Please verify your email first." });
    const match = await user.matchPassword(password);
    if (!match) return res.status(401).json({ success: false, message: "Invalid email or password" });
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken; user.lastLogin = new Date(); user.loginCount += 1;
    await user.save({ validateBeforeSave: false });
    // If doctor role, attach doctorId
    let doctorProfile = null;
    if (user.role === "doctor") {
      doctorProfile = await Doctor.findOne({ user: user._id }).select("_id name specialty hospital");
    }
    res.json({ success: true, token, refreshToken, user: user.toPublicJSON(), doctorProfile });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// POST /api/auth/register (internal/seeder use)
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, age, gender, role } = req.body;
    const exists = await User.findOne({ email, isVerified: true });
    if (exists) return res.status(400).json({ success: false, message: "Email already registered" });
    const allowedRole = ["patient","doctor","admin"].includes(role) ? role : "patient";
    const user = await User.create({ name, email, password, phone, age, gender, role: allowedRole, isVerified: true });
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken; user.lastLogin = new Date(); user.loginCount = 1;
    await user.save({ validateBeforeSave: false });
    await Notification.create({ user: user._id, title: "Welcome to MediBook Pro! 🎉", message: `Hello ${name}, your account is ready.`, type: "system" });
    res.status(201).json({ success: true, token, refreshToken, user: user.toPublicJSON() });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// POST /api/auth/refresh
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ success: false, message: "No refresh token" });
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select("+refreshToken");
    if (!user || user.refreshToken !== refreshToken) return res.status(401).json({ success: false, message: "Invalid refresh token" });
    res.json({ success: true, token: generateToken(user._id) });
  } catch { res.status(401).json({ success: false, message: "Refresh token expired" }); }
};

// GET /api/auth/profile
exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, user });
};

// PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const fields = ["name","phone","age","gender","address","bloodGroup","medicalHistory","emergencyContact","notifications"];
    const updates = {};
    fields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

// PUT /api/auth/change-password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password");
    if (!(await user.matchPassword(currentPassword))) return res.status(400).json({ success: false, message: "Current password incorrect" });
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: "Password changed" });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

// POST /api/auth/logout
exports.logout = async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
  res.json({ success: true, message: "Logged out" });
};
