
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Please log in to continue.",
    });
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Your session is invalid or expired. Please log in again.",
    });
  }
}

function getPublicUser(user) {
  return {
    id: user._id,
    usn: user.usn,
    email: user.email,
    phone: user.phone || "",
    address: user.address || "",
  };
}

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const usn = String(req.body.usn || "").trim().toUpperCase();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!usn || !email || !password) {
      return res.status(400).json({
        message: "USN, email and password are required.",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        message: "Please enter a valid email address.",
      });
    }

    if (password.length < 6 || password.length > 72) {
      return res.status(400).json({
        message: "Password must contain 6 to 72 characters.",
      });
    }

    const existingUser = await User.findOne({
      $or: [{ usn }, { email }],
    });

    if (existingUser) {
      return res.status(409).json({
        message: "This USN or email is already registered.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      usn,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "Registration successful. Please log in.",
      user: getPublicUser(user),
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "This USN or email is already registered.",
      });
    }

    return res.status(500).json({
      message: "Registration failed. Please try again.",
    });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        message: "Incorrect email or password.",
      });
    }

    const token = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      message: "Login successful.",
      token,
      user: getPublicUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Login failed. Please try again.",
    });
  }
});

// GET PROFILE
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.json({ user: getPublicUser(user) });
  } catch (error) {
    console.error("Profile retrieval error:", error);
    return res.status(500).json({
      message: "Could not retrieve profile.",
    });
  }
});

// EDIT PROFILE
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const usn = String(req.body.usn || "").trim().toUpperCase();
    const email = String(req.body.email || "").trim().toLowerCase();
    const phone = String(req.body.phone || "").trim();
    const address = String(req.body.address || "").trim();

    if (!usn || !email) {
      return res.status(400).json({
        message: "USN and email are required.",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        message: "Please enter a valid email address.",
      });
    }

    const duplicate = await User.findOne({
      _id: { $ne: req.userId },
      $or: [{ usn }, { email }],
    });

    if (duplicate) {
      return res.status(409).json({
        message: "This USN or email is already being used.",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { usn, email, phone, address },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.json({
      message: "Profile updated successfully.",
      user: getPublicUser(user),
    });
  } catch (error) {
    console.error("Profile update error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "This USN or email is already being used.",
      });
    }

    return res.status(500).json({
      message: "Could not update profile.",
    });
  }
});

// CHANGE PASSWORD
router.put("/change-password", authenticateToken, async (req, res) => {
  try {
    const currentPassword = String(req.body.currentPassword || "");
    const newPassword = String(req.body.newPassword || "");

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Enter your current and new password.",
      });
    }

    if (newPassword.length < 6 || newPassword.length > 72) {
      return res.status(400).json({
        message: "New password must contain 6 to 72 characters.",
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const validPassword = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!validPassword) {
      return res.status(400).json({
        message: "Your current password is incorrect.",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("Password change error:", error);
    return res.status(500).json({
      message: "Could not change password.",
    });
  }
});

module.exports = router;
