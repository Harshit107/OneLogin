

const createUserRef = (developerId, projectId) => {
  return `developer/${developerId}/projects/${projectId}/users`;
};
const getUserRef = (developerId, projectId, userId) => {
  return `developer/${developerId}/projects/${projectId}/users/${userId}`;
};

module.exports = {
  createUserRef,
  getUserRef
};