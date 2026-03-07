const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  full_name: String,
  email: { type: String, unique: true },
  phone: String,
  password: String,
  dob: Date,
  passingYear: Number,

  role: {
    type: String,
    default: "USER"
  }
});

module.exports = mongoose.model("User", UserSchema);