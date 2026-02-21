const express = require("express");
require("./src/database/mongoose");
const userRouter = require("./src/routes/authRoutes.js");
const testingRouter = require("./src/routes/testingRoutes.js");
const UserProject = require("./src/routes/projectRoutes.js");
const oauthRouter = require("./src/routes/oauthRoutes.js");
const cookieParser = require("cookie-parser");

const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use("/oauth", oauthRouter);

app.use(testingRouter);
app.use("/users", userRouter);

app.use("/developer", UserProject);

app.get("/checkserver", (req, res) =>
  res.send("<h1>Hey Developer! Server is working fine, Go aHead!"),
);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
