const Project = require("../../model/Project");
const ApiError = require("../../utils/ApiError");

/**
 * Creates a new project in MongoDB
 */
const createProject = async (userId, name) => {
  const project = new Project({
    name,
    admin: userId,
    developers: [userId],
  });

  await project.save();
  return project.apiKey;
};

/**
 * Retrieves project details from MongoDB with ownership check
 */
const getProject = async (userId, projectId) => {
  const project = await Project.findOne({ apiKey: projectId });

  if (!project) {
    throw new ApiError(404, "Couldn't find project");
  }

  // Verify access permissions: user must be admin or assigned developer
  const isOwner = project.admin.toString() === userId.toString();
  const isDeveloper = (project.developers || []).some(
    (devId) => devId.toString() === userId.toString()
  );

  if (!isOwner && !isDeveloper) {
    throw new ApiError(403, "You do not have access to this project");
  }

  return project.toUiFormat();
};

/**
 * Updates project details in MongoDB with ownership check
 */
const updateProject = async (userId, projectId, updateData) => {
  const allowedKeys = ["name", "email", "maintenance", "verification"];

  const sanitizedData = {};
  for (const key of Object.keys(updateData)) {
    if (allowedKeys.includes(key)) {
      sanitizedData[key] = updateData[key];
    }
  }

  if (Object.keys(sanitizedData).length === 0) {
    throw new ApiError(400, "No valid update data provided");
  }

  const project = await Project.findOne({ apiKey: projectId });

  if (!project) {
    throw new ApiError(404, "Couldn't find project");
  }

  // Only project admin or assigned developers can update settings
  const isOwner = project.admin.toString() === userId.toString();
  const isDeveloper = (project.developers || []).some(
    (devId) => devId.toString() === userId.toString()
  );

  if (!isOwner && !isDeveloper) {
    throw new ApiError(403, "You do not have permission to update this project");
  }

  Object.assign(project, sanitizedData);
  await project.save();

  return project.toUiFormat();
};

/**
 * Lists all projects owned by or assigned to a user
 */
const listUserProjects = async (userId) => {
  const projects = await Project.find({
    $or: [{ admin: userId }, { developers: userId }],
  }).sort({ createdAt: -1 });

  return projects.map((p) => p.toUiFormat());
};

module.exports = {
  createProject,
  getProject,
  updateProject,
  listUserProjects,
};
