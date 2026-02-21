const catchAsync = require("../utils/catchAsync");
const projectService = require("../services/project/projectService");

exports.create = catchAsync(async (req, res) => {
  const { name } = req.body;
  const userId = req.user._id;

  const createdProjectAPI = await projectService.createProject(userId, name);

  res.status(201).json({
    message: "Project created successfully",
    API_KEY: createdProjectAPI,
  });
});

exports.get = catchAsync(async (req, res) => {
  const { projectId } = req.body;
  const userId = req.user._id;

  const project = await projectService.getProject(userId, projectId);

  res.status(200).json({ message: project });
});

exports.update = catchAsync(async (req, res) => {
  const { projectId, ...updateData } = req.body;
  const userId = req.user._id;

  await projectService.updateProject(userId, projectId, updateData);

  res.status(200).json({ message: "Success" });
});
