const express = require("express");
const router = express.Router();
const User = require("../models/User");

// CREATE user (POST)
router.post("/", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => { 
  try { 
    const user = await User.findById(req.params.id); 
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user); 
  } 
  catch (err) { 
    res.status(500).json({ error: err.message }); 
  } 
});
// READ all users (GET)
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET users by name (partial match, case-insensitive)
router.get("/name/:name", async (req, res) => {
  try {
    const regex = new RegExp(req.params.name, "i"); // "i" = case-insensitive
    const users = await User.find({ name: regex });

    if (!users || users.length === 0) {
      return res.status(404).json({ error: "No users found with that name" });
    }

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// UPDATE user (PUT)
router.put("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE user (DELETE)
router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
