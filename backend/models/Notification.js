const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title:   { type: String, required: true },
  message: { type: String, required: true },
  type:    { type: String, enum: ["appointment","payment","reminder","system","review"], default: "system" },
  data:    { type: mongoose.Schema.Types.Mixed },
  isRead:  { type: Boolean, default: false },
  readAt:  Date
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);
