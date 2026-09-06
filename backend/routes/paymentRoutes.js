const express = require("express");
const r = express.Router();
const pc = require("../controllers/paymentController");
const { protect, authorize } = require("../middleware/authMiddleware");
r.post("/", protect, pc.createPayment);
r.get("/my", protect, pc.getMyPayments);
r.get("/stats", protect, authorize("admin"), pc.getStats);
r.post("/:id/refund", protect, authorize("admin"), pc.refund);
module.exports = r;
