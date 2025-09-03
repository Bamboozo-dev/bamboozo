const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "public/images/");
	},
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		cb(null, "product-" + uniqueSuffix + path.extname(file.originalname));
	},
});

const upload = multer({
	storage: storage,
	limits: {
		fileSize: 5 * 1024 * 1024, // 5MB limit
	},
	fileFilter: function (req, file, cb) {
		const allowedTypes = /jpeg|jpg|png|gif|webp/;
		const extname = allowedTypes.test(
			path.extname(file.originalname).toLowerCase()
		);
		const mimetype = allowedTypes.test(file.mimetype);

		if (mimetype && extname) {
			return cb(null, true);
		} else {
			cb(new Error("Only image files are allowed!"));
		}
	},
});

// Upload image endpoint
router.post("/upload", upload.single("image"), (req, res) => {
	if (!req.file) {
		return res.status(400).json({ error: "No file uploaded" });
	}

	// Return the relative path to the uploaded image
	const imagePath = `/images/${req.file.filename}`;
	res.json({ imageUrl: imagePath });
});

module.exports = router;
