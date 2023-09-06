const createDeveloperRef = (developerId) => {
  return `developer/${developerId}/details/securityKey`;
};
const getDeveloperRef = (developerId) => {
  return `developer/${developerId}`;
};
const createProjectsRef = (developerId) => {
  return `developer/${developerId}/projects`;
};
const getProjectsRef = (developerId, projectId) => {
  return `developer/${developerId}/projects/${projectId}`;
};

const createUserRef = (developerId, projectId) => {
  return `developer/${developerId}/projects/${projectId}/users`;
};
const getUserRef = (developerId, projectId, userId) => {
  return `developer/${developerId}/projects/${projectId}/users/${userId}`;
};

module.exports = {
  createUserRef,
  getUserRef,
  createDeveloperRef,
  getDeveloperRef,
  createProjectsRef,
  getProjectsRef,
};
