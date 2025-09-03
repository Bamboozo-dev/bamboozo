const mongoose = require("mongoose");
const User = require("./models/User");

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

// Sample users data
const sampleUsers = [
	{
		name: "Admin User",
		email: "admin@example.com",
		password: "admin123",
		role: "admin",
	},
	{
		name: "John Doe",
		email: "john@example.com",
		password: "password123",
		role: "user",
	},
	{
		name: "Jane Smith",
		email: "jane@example.com",
		password: "password123",
		role: "user",
	},
	{
		name: "Mike Johnson",
		email: "mike@example.com",
		password: "password123",
		role: "user",
	},
	{
		name: "Sarah Wilson",
		email: "sarah@example.com",
		password: "password123",
		role: "user",
	},
	{
		name: "David Brown",
		email: "david@example.com",
		password: "password123",
		role: "user",
	},
	{
		name: "Lisa Davis",
		email: "lisa@example.com",
		password: "password123",
		role: "user",
	},
	{
		name: "Tom Miller",
		email: "tom@example.com",
		password: "password123",
		role: "user",
	},
	{
		name: "Anna Garcia",
		email: "anna@example.com",
		password: "password123",
		role: "user",
	},
	{
		name: "Chris Lee",
		email: "chris@example.com",
		password: "password123",
		role: "user",
	},
];

async function createSampleUsers() {
	try {
		// Clear existing users
		await User.deleteMany({});
		console.log("Cleared existing users");

		// Insert sample users
		const users = await User.insertMany(sampleUsers);
		console.log(`Created ${users.length} sample users:`);
		users.forEach((user) => {
			console.log(`- ${user.name} (${user.email}) - ${user.role}`);
		});

		process.exit(0);
	} catch (error) {
		console.error("Error creating users:", error);
		process.exit(1);
	}
}

// Run the script
setTimeout(createSampleUsers, 1000);
