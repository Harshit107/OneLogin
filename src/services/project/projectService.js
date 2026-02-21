const {
  createDeveloper,
  createNewProject,
  getProjectDetail,
  updateProjectDetail,
} = require("../../database/FirebaseHelper");

/**
 * Creates a new project in Firebase
 */
const createProject = async (userId, name) => {
  const createdProjectApi = await createNewProject(userId, name);
  return createdProjectApi;
};

/**
 * Retrieves project details from Firebase
 */
const getProject = async (userId, projectId) => {
  const project = await getProjectDetail(userId, projectId);
  return project;
};

/**
 * Updates project details in Firebase
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
    throw new Error("No valid update data provided");
  }

  // Ensure project exists before updating
  await getProjectDetail(userId, projectId);
  
  await updateProjectDetail(userId, projectId, sanitizedData);
};

module.exports = {
  createProject,
  getProject,
  updateProject,
};
