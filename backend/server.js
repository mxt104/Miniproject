const Scholarship = require("./models/Scholarship");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");
const User = require("./models/User");
const Benefit = require("./models/Benefit");


const app = express();
app.use(cors());
app.use(express.json());

let otpStore = {};

mongoose.connect("mongodb+srv://ranemitesh7_db_user:mit1104@cluster0.rsdqhbq.mongodb.net/scholarshipDB?appName=Cluster0")
.then(() => console.log("MongoDB Atlas Connected 🚀"))
.catch(err => console.log(err));

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "miteshrane59@gmail.com",
        pass: "kdoojhqwxhxfegub"
    }
});

const Notification = require("./models/Notification");

app.post("/api/notify", async (req, res) => {
  const { userId, scholarshipId, email } = req.body;

  await Notification.create({
    userId,
    scholarshipId,
    email
  });

  res.json({ success: true });
});

app.post("/api/benefits", async (req, res) => {
  try {
    const benefit = new Benefit(req.body);
    await benefit.save();
    res.json({ success: true, benefit });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/benefits", async (req, res) => {
  try {
    const benefits = await Benefit.find({ active: true });
    res.json({ success: true, benefits });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

app.delete("/api/benefits/:id", async (req, res) => {
  try {
    await Benefit.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

app.post("/api/auth/send-otp", async (req, res) => {
    const { email } = req.body;

    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore[email] = otp;

    console.log("OTP for", email, "is", otp);

    const mailOptions = {
        from: "YOUR_GMAIL@gmail.com",
        to: email,
        subject: "Your OTP Code",
        text: `Your OTP is: ${otp}`
    };

    try {
        await transporter.sendMail(mailOptions);

        res.json({
            success: true,
            email_masked: email
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            detail: "Failed to send OTP"
        });
    }
});

app.post("/api/auth/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  if (otpStore[email] == otp) {
    delete otpStore[email];

    res.json({
      success: true
    });

  } else {
    res.status(400).json({
      success: false,
      detail: "Invalid OTP"
    });
  }
});

app.post("/api/auth/register", async (req, res) => {
  const { full_name, email, phone, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ detail: "Email already registered" });
    }

    const user = await User.create({
      full_name,
      email,
      phone,
      password
    });

    res.json({ success: true, user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ detail: "Registration failed" });
  }
});

// LOGIN ROUTE
app.post("/api/auth/login", async (req, res) => {
  const { phone, password, loginType } = req.body;

  try {
    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(400).json({
        success: false,
        detail: "User not found"
      });
    }

    if (user.password !== password) {
      return res.status(400).json({
        success: false,
        detail: "Invalid password"
      });
    }

    // 🔥 Check login type
    if (loginType === "ADMIN" && user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        detail: "Not authorized as Admin"
      });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        full_name: user.full_name,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      detail: "Login failed"
    });
  }
});

// Add Scholarship
app.post("/api/scholarships", async (req, res) => {
  try {
    const scholarship = new Scholarship(req.body);
    await scholarship.save();
    res.json({ success: true, message: "Scholarship Added Successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put("/api/scholarships/:id", async (req, res) => {
  try {
    const updated = await Scholarship.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      success: true,
      scholarship: updated
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});



// ============================
// SCHOLARSHIP STATS
// ============================
app.get("/api/scholarships/stats", async (req, res) => {
  try {
    const total = await Scholarship.countDocuments();

    res.json({
      success: true,
      total_scholarships: total
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false
    });
  }
});

// Check Eligibility
app.post("/api/scholarships/check", async (req, res) => {
    const { caste, income, percentage } = req.body;

    const scholarships = await Scholarship.find({
        caste: caste,
        incomeLimit: { $gte: income },
        minPercentage: { $lte: percentage }
    });

    res.json(scholarships);
});

app.get("/api/scholarships", async (req, res) => {
  try {
    const { education, community } = req.query;

    let filter = {};

    if (education) {
      filter.education_qualifications = education;
    }

    if (community) {
      filter.communities = community;
    }

    const scholarships = await Scholarship.find(filter);

    res.json({ success: true, scholarships });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

app.delete("/api/scholarships/:id", async (req, res) => {
  try {
    await Scholarship.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});



app.get("/addSample", async (req, res) => {
    await Scholarship.create({
        name: "Post Matric Scholarship",
        caste: "OBC",
        incomeLimit: 250000,
        minPercentage: 60
    });

    res.send("Sample Scholarship Added");
});

app.get("/testCheck", async (req, res) => {
    const result = await Scholarship.find({
        caste: "OBC",
        incomeLimit: { $gte: 200000 },
        minPercentage: { $lte: 75 }
    });

    res.json(result);
});

// Add Benefit
app.post("/api/benefits", async (req, res) => {
  try {
    const benefit = new Benefit(req.body);
    await benefit.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// Get Benefits
app.get("/api/benefits", async (req, res) => {
  try {
    const benefits = await Benefit.find();
    res.json({ success: true, benefits });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

app.get("/", (req, res) => {
    res.send("Scholarship Backend Running");
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});
