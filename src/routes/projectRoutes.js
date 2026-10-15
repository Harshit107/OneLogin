const express = require("express");
const router = express.Router();
const userAuth = require("../middlewares/userAuth");
const adminOnly = require("../middlewares/adminOnly");
const validate = require("../middlewares/validate");
const projectValidation = require("../validations/projectValidation");
const projectController = require("../controllers/projectController");

// All project management routes are strictly reserved for administrators
router.use(userAuth, adminOnly);

// Create Project
router.post(
  "/project/create",
  validate(projectValidation.createProject),
  projectController.create
);

// Get Project Details
router.post(
  "/project/get",
  validate(projectValidation.getProject),
  projectController.get
);

// Update Project
router.patch(
  "/project/update/general",
  validate(projectValidation.updateProject),
  projectController.update
);

// List All Projects for Admin
router.get("/project/list", projectController.list);

module.exports = router;
