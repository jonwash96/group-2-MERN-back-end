const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const requireAuth = require("../middleware/requireAuth");
const { User, UserProfile } = require("../models/User");

const saltRounds = 12;

function signToken(user) {
  const payload = { _id: user._id, username: user.username };
  return jwt.sign(payload, process.env.SECRET, { expiresIn: "7d" });
}

// POST /auth/sign-up
router.post("/sign-up", async (req, res) => {
  try {
    const { username, password, displayName } = req.body;

    if (!username?.trim() || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    const existingUser = await User.findOne({ username: username.trim() });

    if (existingUser) {
      return res
        .status(409)
        .json({ message: `User with username ${username} already exists.` });
    }

    // create profile
    const profile = await UserProfile.create({
      username: username.trim(),
      displayName: displayName?.trim(),
      userId: null,
    });

    const hashed = bcrypt.hashSync(password, saltRounds);

    const user = await User.create({
      username: username.trim(),
      password: hashed,
      profile: profile._id,
    });

    profile.userId = user._id;
    await profile.save();

    const token = signToken(user);

    // return safe user data
    return res.status(201).json({
      token,
      user: { _id: user._id, username: user.username, profile: profile._id },
      profile: {
        _id: profile._id,
        username: profile.username,
        displayName: profile.displayName,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Server error" });
  }

  // GET /auth/me
  router.get("/me", requireAuth, async (req, res) => {
    const user = await User.findById(req.user._id).populate("profile");
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({
      user: {
        _id: user._id,
        username: user.username,
        profile: user.profile?._id,
      },
      profile: user.profile,
    });
  });

  // POST /auth/sign-in
  router.post("/sign-in", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username?.trim() || !password) {
        return res
          .status(400)
          .json({ message: "Username and password are required" });
      }

      const user = await User.findOne({ username: username.trim() })
        .select("+password")
        .populate("profile");

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isMatch = bcrypt.compareSync(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = signToken(user);

      return res.status(200).json({
        token,
        user: {
          _id: user._id,
          username: user.username,
          profile: user.profile?._id,
        },
        profile: user.profile
          ? {
              _id: user.profile._id,
              username: user.profile.username,
              displayName: user.profile.displayName,
            }
          : null,
      });
    } catch (error) {
      return res.status(500).json({ message: error.message || "Server error" });
    }
  });
});

module.exports = router;
