require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

connectDB();
const app = express();
const { startReminderScheduler } = require("./utils/reminderScheduler");

// Security
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000", credentials: true }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: "Too many requests" }));

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

// Routes
app.use("/api/auth",          require("./routes/authRoutes"));
app.use("/api/doctors",       require("./routes/doctorRoutes"));
app.use("/api/appointments",  require("./routes/appointmentRoutes"));
app.use("/api/payments",      require("./routes/paymentRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/admin",         require("./routes/adminRoutes"));
app.use("/api/reminders",     require("./routes/reminderRoutes"));
app.use("/api/doctor-portal", require("./routes/doctorPortalRoutes"));

// Health
app.get("/api/health", (req, res) => res.json({ status: "ok", time: new Date() }));
app.use((req, res) => res.status(404).json({ success: false, message: "Route not found" }));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 MediBook Pro API running on http://localhost:${PORT}`);
  console.log(`📚 Environment: ${process.env.NODE_ENV}`);
  startReminderScheduler();
});
