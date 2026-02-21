const express = require("express");
const router = express.Router();
const userAuth = require("../middlewares/userAuth");
const validate = require("../middlewares/validate");
const projectValidation = require("../validations/projectValidation");
const projectController = require("../controllers/projectController");

// Create Project
router.post(
  "/project/create",
  userAuth,
  validate(projectValidation.createProject),
  projectController.create
);

// Get Project Details
router.post(
  "/project/get",
  userAuth,
  validate(projectValidation.getProject),
  projectController.get
);

// Update Project
router.patch(
  "/project/update/general",
  userAuth,
  validate(projectValidation.updateProject),
  projectController.update
);

module.exports = router;
