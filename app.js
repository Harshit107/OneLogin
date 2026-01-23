const express = require("express");
require("./src/database/mongoose");
const userRouter = require("./src/routes/auth");
const testingRouter = require("./src/router/TestingRouter");
const UserProject = require("./src/router/UserProjects");

const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.json());

app.use(testingRouter);
app.use("/users", userRouter);

app.use("/developer", UserProject);

app.get("/checkserver", (req, res) =>
  res.send("<h1>Hey Developer! Server is working fine, Go aHead!"),
);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
