const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  userId: String,
  scholarshipId: String,
  email: String,
  notified: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model("Notification", NotificationSchema);