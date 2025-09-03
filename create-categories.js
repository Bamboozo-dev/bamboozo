const mongoose = require("mongoose");
const Category = require("./models/Category");

// Connect to MongoDB
mongoose
	.connect(
		"mongodb+srv://kayantest1990_db_user:tmszUSKCkV0mMmIP@cluster0.ca1u3ju.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
		{
			useNewUrlParser: true,
			useUnifiedTopology: true,
		}
	)
	.then(() => console.log("MongoDB connected"));

// Sample categories data
const sampleCategories = [
	{ name: "Electronics", description: "Electronic devices and gadgets" },
	{ name: "Clothing", description: "Fashion and apparel" },
	{ name: "Books", description: "Books and educational materials" },
	{
		name: "Home & Garden",
		description: "Home improvement and garden supplies",
	},
	{
		name: "Sports & Outdoors",
		description: "Sports equipment and outdoor gear",
	},
	{ name: "Toys & Games", description: "Toys, games, and entertainment" },
	{ name: "Health & Beauty", description: "Health and beauty products" },
	{ name: "Food & Beverages", description: "Food items and beverages" },
	{ name: "Automotive", description: "Car parts and automotive accessories" },
	{ name: "Office Supplies", description: "Office and business supplies" },
	{ name: "Pet Supplies", description: "Pet food and accessories" },
	{ name: "Jewelry", description: "Jewelry and accessories" },
];

async function createSampleCategories() {
	try {
		// Clear existing categories
		await Category.deleteMany({});
		console.log("Cleared existing categories");

		// Insert sample categories
		const categories = await Category.insertMany(sampleCategories);
		console.log(`Created ${categories.length} sample categories:`);
		categories.forEach((category) => {
			console.log(`- ${category.name}: ${category.description}`);
		});

		process.exit(0);
	} catch (error) {
		console.error("Error creating categories:", error);
		process.exit(1);
	}
}

// Run the script
setTimeout(createSampleCategories, 1000);
