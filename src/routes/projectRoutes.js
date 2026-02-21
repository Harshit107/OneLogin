const express = require("express");
const router = express.Router();
const database = require("../database/firebaseConfig");
const auth = require("../middlewares/userAuth");
const {
  createNewProject,
  getProjectDetail,
  updateProjectDetail,
} = require("../database/FirebaseHelper");




/* -------------------------------------------------------------------------- */
/*                             Create New Project   ⁡⁢⁣⁢POST⁡                        */
/* -------------------------------------------------------------------------- */

router.post("/project/create", auth, async function (req, res) {
  const { name } = req.body;
  if (!name || name.trim() === "")
    return res.status(400).send({ error: "Enter valid project name" });
  try {
    const id = req.user._id;
    const createdProject = await createNewProject(id, name);
    res.status(201).send({
      message: "Project created successfully",
      API_KEY: createdProject,
    });
  } catch (e) {
    res.status(400).send({ data: "", error: e.message });
  }
});



/* -------------------------------------------------------------------------- */
/*                        // Get Project Detail {⁡⁢⁣⁢POST⁡}                        */
/* -------------------------------------------------------------------------- */
router.post("/project/get", auth, async function (req, res) {
  const { projectId } = req.body;
  if (!projectId || projectId.trim() === "")
    return res.status(400).send({ error: "Enter valid project Id" });
  try {
    const project = await getProjectDetail(req.user._id, projectId);
    res.status(201).send({ message: project });
  } catch (e) {
    res.status(400).send({ data: "", error: e.message });
  }
});

/* -------------------------------------------------------------------------- */
/*                        // Update Project Detail {⁡⁣⁢⁢PATCH⁡}                        */
/* -------------------------------------------------------------------------- */
router.patch("/project/update/general", auth, async function (req, res) {
  const itemCanUpdate = [
    "name",
    "email",
    "maintenance",
    "verification",
    "projectId",
  ];

  for (const key in req.body) {
    if (!itemCanUpdate.includes(key))
      return res.status(400).send({ error: `${key} Cannot be updated` });
  }

  const { projectId } = req.body;
  if (!projectId)
    return res.status(400).send({ error: "Enter valid Project Id" });

  if (Object.keys(req.body).length === 1)
    return res.status(400).send({ error: "Enter valid Updation data" });
  try {
    await getProjectDetail(req.user._id, projectId);
    delete req.body.projectId;
     await updateProjectDetail(
      req.user._id,
      projectId,
      req.body
    );
    res.status(200).send({ message: "Success" });
  } catch (e) {
    res.status(400).send({ data: "", error: e.message });
  }
});

module.exports = router;
