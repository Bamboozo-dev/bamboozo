const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const router = express.Router();

// Create user
router.post("/", async (req, res) => {
	try {
		const user = new User(req.body);
		await user.save();
		res.status(201).json(user);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

// Get all users
router.get("/", async (req, res) => {
	try {
		const users = await User.find();
		res.json(users);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Get user by ID
router.get("/:id", async (req, res) => {
	try {
		const user = await User.findById(req.params.id);
		if (!user) return res.status(404).json({ error: "User not found" });
		res.json(user);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Update user
router.put("/:id", async (req, res) => {
	try {
		const user = await User.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});
		if (!user) return res.status(404).json({ error: "User not found" });
		res.json(user);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

// Delete user
router.delete("/:id", async (req, res) => {
	try {
		const user = await User.findByIdAndDelete(req.params.id);
		if (!user) return res.status(404).json({ error: "User not found" });
		res.json({ message: "User deleted" });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Sign in
router.post("/signin", async (req, res) => {
	const { email, password } = req.body;
	try {
		const user = await User.findOne({ email });
		if (!user || user.password !== password) {
			return res.status(401).json({ error: "Invalid email or password" });
		}
		// Generate JWT token
		const token = jwt.sign(
			{ id: user._id, name: user.name, email: user.email, role: user.role },
			"your_jwt_secret", // Replace with env variable in production
			{ expiresIn: "1h" }
		);
		res.json({
			message: "Sign in successful",
			token,
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
			},
		});
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

module.exports = router;
