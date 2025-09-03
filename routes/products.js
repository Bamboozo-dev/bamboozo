const express = require("express");
const Product = require("../models/Product");
const fs = require("fs");
const path = require("path");
const router = express.Router();

// Create product
router.post("/", async (req, res) => {
	try {
		const product = new Product(req.body);
		product.updatedAt = new Date();
		await product.save();
		res.status(201).json(product);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

// Get all products
router.get("/", async (req, res) => {
	try {
		const { category, minPrice, maxPrice, inStock } = req.query;
		let filter = {};

		if (category) filter.category = category;
		if (minPrice) filter.price = { $gte: Number(minPrice) };
		if (maxPrice) filter.price = { ...filter.price, $lte: Number(maxPrice) };
		if (inStock === "true") filter.stock = { $gt: 0 };

		const products = await Product.find(filter).sort({ createdAt: -1 });
		res.json(products);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Get product by ID
router.get("/:id", async (req, res) => {
	try {
		const product = await Product.findById(req.params.id);
		if (!product) return res.status(404).json({ error: "Product not found" });
		res.json(product);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Update product
router.put("/:id", async (req, res) => {
	try {
		const updateData = { ...req.body, updatedAt: new Date() };
		const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
			new: true,
			runValidators: true,
		});
		if (!product) return res.status(404).json({ error: "Product not found" });
		res.json(product);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

// Delete product
router.delete("/:id", async (req, res) => {
	try {
		const product = await Product.findById(req.params.id);
		if (!product) return res.status(404).json({ error: "Product not found" });

		// Delete associated image file if it exists
		if (product.imageUrl && product.imageUrl.startsWith("/images/")) {
			const imagePath = path.join(__dirname, "../public", product.imageUrl);
			try {
				if (fs.existsSync(imagePath)) {
					fs.unlinkSync(imagePath);
					console.log(`Deleted image: ${imagePath}`);
				}
			} catch (imageError) {
				console.error("Error deleting image:", imageError);
				// Continue with product deletion even if image deletion fails
			}
		}

		await Product.findByIdAndDelete(req.params.id);
		res.json({ message: "Product and associated image deleted successfully" });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Update stock
router.patch("/:id/stock", async (req, res) => {
	try {
		const { stock } = req.body;
		if (typeof stock !== "number" || stock < 0) {
			return res
				.status(400)
				.json({ error: "Stock must be a non-negative number" });
		}

		const product = await Product.findByIdAndUpdate(
			req.params.id,
			{ stock, updatedAt: new Date() },
			{ new: true }
		);
		if (!product) return res.status(404).json({ error: "Product not found" });
		res.json(product);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

module.exports = router;
