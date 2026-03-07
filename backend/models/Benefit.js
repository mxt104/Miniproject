const mongoose = require("mongoose");

const BenefitSchema = new mongoose.Schema({
  name: String,
  description: String,
  category: {
    type: String,
    enum: ["Entertainment", "Shopping", "Travel", "Education", "Food", "Software"]
  },
  discount: String, // e.g. "50% Off"
  eligibility: String, // e.g. "Valid student ID required"
  link: String,
  logo: String
});

module.exports = mongoose.model("Benefit", BenefitSchema);