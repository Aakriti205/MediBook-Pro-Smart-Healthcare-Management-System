/**
 * MediBook Pro — Reminder Scheduler
 * Runs every 15 minutes and sends:
 *  - 24-hour reminder notifications
 *  - 1-hour reminder notifications
 * Uses in-app Notification model (no external email needed).
 * If you configure .env EMAIL_* fields, it also sends emails via nodemailer.
 */

const Appointment = require("../models/Appointment");
const Notification = require("../models/Notification");
const nodemailer   = require("nodemailer");

// ── Email transporter (optional — only works if EMAIL_* env vars are set) ──
let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  console.log("📧 Email transporter configured for reminders");
} else {
  console.log("📧 Email not configured — in-app reminders only");
}

// ── Helper: send email if transporter is ready ──
async function sendEmail(to, subject, html) {
  if (!transporter) return;
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || "MediBook Pro <noreply@medibook.pro>",
      to, subject, html,
    });
    console.log(`📧 Reminder email sent to ${to}`);
  } catch (err) {
    console.error(`📧 Email failed for ${to}: ${err.message}`);
  }
}

// ── Format date nicely ──
function fmt(date) {
  return new Date(date).toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

// ── Main reminder function ──
async function sendReminders() {
  const now = new Date();

  // Window for 24-hour reminder: appointments 23h 45min → 24h 15min from now
  const h24start = new Date(now.getTime() + 23 * 60 * 60 * 1000 + 45 * 60 * 1000);
  const h24end   = new Date(now.getTime() + 24 * 60 * 60 * 1000 + 15 * 60 * 1000);

  // Window for 1-hour reminder: appointments 45min → 75min from now
  const h1start  = new Date(now.getTime() + 45 * 60 * 1000);
  const h1end    = new Date(now.getTime() + 75 * 60 * 1000);

  // Fetch upcoming confirmed/pending appointments not yet reminded
  const upcoming = await Appointment.find({
    status: { $in: ["confirmed", "pending"] },
    date: { $gte: h1start, $lte: h24end },
    reminderSent: false,
  })
    .populate("patient", "name email")
    .populate("doctor",  "name specialty hospital phone");

  if (upcoming.length === 0) return;

  console.log(`⏰ Reminder check: ${upcoming.length} upcoming appointment(s) found`);

  for (const apt of upcoming) {
    const aptTime = new Date(apt.date);
    const msUntil = aptTime - now;
    const hoursUntil = msUntil / (1000 * 60 * 60);

    let reminderType = null;
    if (hoursUntil >= 23.75 && hoursUntil <= 24.25) reminderType = "24h";
    if (hoursUntil >= 0.75  && hoursUntil <= 1.25)  reminderType = "1h";
    if (!reminderType) continue;

    const label    = reminderType === "24h" ? "tomorrow" : "in 1 hour";
    const urgency  = reminderType === "1h"  ? "⚠️ " : "🔔 ";
    const patName  = apt.patient?.name  || "Patient";
    const docName  = apt.doctor?.name   || "Doctor";
    const docSpec  = apt.doctor?.specialty || "";
    const hospital = apt.doctor?.hospital  || "";
    const dateStr  = fmt(apt.date);
    const timeSlot = apt.timeSlot || "";
    const mode     = apt.mode || "in-person";

    // ── 1. In-app notification ──
    await Notification.create({
      user:    apt.patient._id,
      title:   `${urgency}Appointment Reminder`,
      message: `Your appointment with Dr. ${docName} (${docSpec}) is ${label} — ${dateStr} at ${timeSlot}. Mode: ${mode}.`,
      type:    "reminder",
      data:    { appointmentId: apt._id, hoursUntil: Math.round(hoursUntil) },
      isRead:  false,
    });

    // ── 2. Email reminder (if configured) ──
    if (apt.patient?.email) {
      const subject = `${urgency}Your MediBook appointment is ${label}`;
      const html = `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;background:#060d1f;color:#f0f4ff;border-radius:16px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#00d4aa,#0099cc);padding:32px;text-align:center;">
            <h1 style="margin:0;font-size:24px;color:#fff;">✦ MediBook Pro</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,.85);font-size:14px;">Appointment Reminder</p>
          </div>
          <div style="padding:32px;">
            <h2 style="font-size:20px;margin:0 0 16px;">Hello, ${patName}!</h2>
            <p style="color:#8b9bb4;font-size:15px;line-height:1.7;margin:0 0 24px;">
              This is a reminder that you have an upcoming appointment <strong style="color:#f0c040">${label}</strong>.
            </p>
            <div style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:20px;margin-bottom:24px;">
              <table style="width:100%;border-collapse:collapse;font-size:14px;">
                <tr><td style="padding:6px 0;color:#8b9bb4;">Doctor</td><td style="padding:6px 0;font-weight:600;">Dr. ${docName}</td></tr>
                <tr><td style="padding:6px 0;color:#8b9bb4;">Specialty</td><td style="padding:6px 0;">${docSpec}</td></tr>
                <tr><td style="padding:6px 0;color:#8b9bb4;">Hospital</td><td style="padding:6px 0;">${hospital}</td></tr>
                <tr><td style="padding:6px 0;color:#8b9bb4;">Date</td><td style="padding:6px 0;">${dateStr}</td></tr>
                <tr><td style="padding:6px 0;color:#8b9bb4;">Time</td><td style="padding:6px 0;color:#00d4aa;font-weight:700;">${timeSlot}</td></tr>
                <tr><td style="padding:6px 0;color:#8b9bb4;">Mode</td><td style="padding:6px 0;text-transform:capitalize;">${mode}</td></tr>
                ${apt.mode === "online" && apt.meetingLink ? `<tr><td style="padding:6px 0;color:#8b9bb4;">Meeting Link</td><td style="padding:6px 0;"><a href="${apt.meetingLink}" style="color:#4da6ff;">Join Meeting</a></td></tr>` : ""}
              </table>
            </div>
            ${reminderType === "1h" ? `
            <div style="background:rgba(240,192,64,.1);border:1px solid rgba(240,192,64,.3);border-radius:10px;padding:14px 18px;margin-bottom:20px;">
              <strong style="color:#f0c040;">⚠️ Your appointment is in 1 hour.</strong> Please be ready on time.
            </div>` : ""}
            <p style="color:#8b9bb4;font-size:13px;margin:0;">
              If you need to cancel or reschedule, please do so at least 2 hours before your appointment.<br/>
              Visit <a href="${process.env.CLIENT_URL}" style="color:#00d4aa;">${process.env.CLIENT_URL}</a>
            </p>
          </div>
          <div style="background:rgba(255,255,255,.04);padding:16px 32px;text-align:center;font-size:12px;color:#4a5568;">
            © 2024 MediBook Pro. This is an automated reminder.
          </div>
        </div>
      `;
      await sendEmail(apt.patient.email, subject, html);
    }

    // ── 3. Mark as reminded (only mark after 1h reminder to allow both to fire) ──
    if (reminderType === "1h") {
      await Appointment.findByIdAndUpdate(apt._id, { reminderSent: true });
    }

    console.log(`  ✅ ${reminderType} reminder sent → ${patName} for Dr. ${docName} at ${timeSlot}`);
  }
}

// ── Scheduler: run every 15 minutes ──
function startReminderScheduler() {
  console.log("⏰ Reminder scheduler started (runs every 15 minutes)");

  // Run immediately on startup to catch any missed reminders
  sendReminders().catch(err => console.error("Reminder error:", err));

  // Then run every 15 minutes
  setInterval(() => {
    sendReminders().catch(err => console.error("Reminder error:", err));
  }, 15 * 60 * 1000);
}

module.exports = { startReminderScheduler, sendReminders };
