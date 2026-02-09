const router = require("express").Router();
const User = require("../models/User");
const verifyToken = require("../middleware/verify-token");

// Index (non-authenticated) GET /users
router.get("/", async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
});

// Get Profile (Authenticated) GET /:userId
router.get("/:userId", verifyToken, async (req, res) => {
  try {
    if (req.user._id !== req.params.userId) {
      res.status(403);
      throw new Error("Not Authorized");
    }

    const user = await User.findById(req.params.userId);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    res.status(200).json({ user });
  } catch (error) {
    if (req.statusCode === 403 || req.statusCode === 404) {
      res.json({ err: error.message });
    } else {
      res.status(500).json({ err: error.message });
    }
  }
});

module.exports = router;
