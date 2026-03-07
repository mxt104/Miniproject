const mongoose = require("mongoose");

const ScholarshipSchema = new mongoose.Schema({
  name: String,
  description: String,

  type: {
    type: String,
    required: true
  },

  education_qualifications: [
    {
      type: String,
      enum: ["Undergraduate", "Postgraduate", "Doctorate"]
    }
  ],

  communities: [
    {
      type: String,
      enum: ["General", "OBC", "SC/ST", "Minority"]
    }
  ],

  incomeLimit: Number,
  minPercentage: Number,

  // 🔥 NEW FIELDS
  deadline: Date,
  passingYearRequired: Number,
  minAge: Number,
  maxAge: Number,

  benefits: String,
  link: String
});

module.exports = mongoose.model("Scholarship", ScholarshipSchema);