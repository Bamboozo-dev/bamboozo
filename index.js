const express = require("express");
const mongoose = require("mongoose");
const usersRouter = require("./routes/users");
const productsRouter = require("./routes/products");
const categoriesRouter = require("./routes/categories");
const uploadRouter = require("./routes/upload");

const app = express();
app.use(express.json());
app.use(express.static("public"));

mongoose
	.connect(
		"mongodb+srv://kayantest1990_db_user:tmszUSKCkV0mMmIP@cluster0.ca1u3ju.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
		{
			useNewUrlParser: true,
			useUnifiedTopology: true,
		}
	)
	.then(() => console.log("MongoDB connected"))
	.catch((err) => console.error("MongoDB connection error:", err));

app.use("/api/users", usersRouter);
app.use("/api/products", productsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/upload", uploadRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
