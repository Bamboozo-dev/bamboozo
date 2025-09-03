const express = require("express");
const Category = require("../models/Category");
const router = express.Router();

// Create category
router.post("/", async (req, res) => {
	try {
		const category = new Category(req.body);
		category.updatedAt = new Date();
		await category.save();
		res.status(201).json(category);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

// Get all categories
router.get("/", async (req, res) => {
	try {
		const { isActive } = req.query;
		let filter = {};

		if (isActive !== undefined) filter.isActive = isActive === "true";

		const categories = await Category.find(filter).sort({ name: 1 });
		res.json(categories);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Get category by ID
router.get("/:id", async (req, res) => {
	try {
		const category = await Category.findById(req.params.id);
		if (!category) return res.status(404).json({ error: "Category not found" });
		res.json(category);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Update category
router.put("/:id", async (req, res) => {
	try {
		const updateData = { ...req.body, updatedAt: new Date() };
		const category = await Category.findByIdAndUpdate(
			req.params.id,
			updateData,
			{
				new: true,
				runValidators: true,
			}
		);
		if (!category) return res.status(404).json({ error: "Category not found" });
		res.json(category);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

// Delete category
router.delete("/:id", async (req, res) => {
	try {
		const category = await Category.findByIdAndDelete(req.params.id);
		if (!category) return res.status(404).json({ error: "Category not found" });
		res.json({ message: "Category deleted successfully" });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Toggle category active status
router.patch("/:id/toggle", async (req, res) => {
	try {
		const category = await Category.findById(req.params.id);
		if (!category) return res.status(404).json({ error: "Category not found" });

		category.isActive = !category.isActive;
		category.updatedAt = new Date();
		await category.save();

		res.json(category);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

module.exports = router;
