const express = require("express");
const connectDB = require("./src/database/mongoose");

// Connect to MongoDB
connectDB();

// Initialize Express
const app = express();

// Define routes
app.get("/", (req, res) => res.send("Hello World!"));

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
