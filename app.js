const express = require("express");
require("./src/database/mongoose");
const userRouter = require('./src/router/UserRouter');
const testingRouter = require('./src/router/TestingRouter');

const PORT = process.env.PORT || 5000;

// Initialize Express
const app = express();
app.use(express.json());

app.use(testingRouter);
app.use("/users",userRouter);


app.get("/checkserver", (req, res) => res.send("<h1>Hey Developer! Server is working fine, Go aHead!"));

// Start server

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
