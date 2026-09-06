// notificationRoutes.js
const express = require("express");
const rn = express.Router();
const nc = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");
rn.get("/", protect, nc.getMyNotifications);
rn.put("/read-all", protect, nc.markRead);
rn.delete("/:id", protect, nc.deleteNotification);
module.exports = rn;
