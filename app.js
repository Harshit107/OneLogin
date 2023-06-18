const express = require("express");
require("./src/database/mongoose");

const PORT = process.env.PORT || 5000;

// Initialize Express
const app = express();
app.use(express.json());

// Define routes
app.get("/checkserver", (req, res) => res.send("<h1>Hey Developer! Server is working fine, Go aHead!"));

// Start server

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
