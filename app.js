const express = require("express");
const cors = require("cors");
require("./src/database/mongoose");
const userRouter = require("./src/routes/authRoutes.js");
const testingRouter = require("./src/routes/testingRoutes.js");
const UserProject = require("./src/routes/projectRoutes.js");
const oauthRouter = require("./src/routes/oauthRoutes.js");
const cookieParser = require("cookie-parser");
const errorHandler = require("./src/middlewares/errorHandler");

const PORT = process.env.PORT || 5000;

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://account.harshit107.online",
    "http://account.harshit107.online",
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-admin-secret"]
}));

app.use(express.json());
app.use(cookieParser());

app.use("/oauth", oauthRouter);

app.use(testingRouter);
app.use("/users", userRouter);

app.use("/developer", UserProject);

app.get("/checkserver", (req, res) =>
  res.send("<h1>Hey Developer! Server is working fine, Go aHead!"),
);

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
