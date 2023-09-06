const { v4: uuidv4 } = require("uuid");

const database = require("./firebaseConfig");
const {
  createDeveloperRef,
  getDeveloperRef,
  createProjectsRef,
  getProjectsRef,
} = require("./FirebaseRef");

const createDeveloper = async (developerId) => {
  try {
    const developerDBRef = database.ref(createDeveloperRef(developerId));
    const messageKey = await developerDBRef.push().key;
    await developerDBRef.set(messageKey);
    return messageKey;
  } catch (e) {
    throw new Error(e);
  }
};

/* -------------------------------------------------------------------------- */
/*                             create new project                             */
/* -------------------------------------------------------------------------- */

const createNewProject = async (developerId, name) => {
  try {
    const projectDBRef = database.ref(createProjectsRef(developerId));
    const messageKey = projectDBRef.push().key;
    const projectDetails = {
      api: messageKey,
      admin: developerId.toString(),
      name,
      maintenance: false,
      verification: false,
      developer: [developerId.toString()],
    };
    await projectDBRef.child(messageKey).child("details").set(projectDetails);
    return messageKey;
  } catch (e) {
    throw new Error(e);
  }
};

/* -------------------------------------------------------------------------- */
/*                             get project detail                             */
/* -------------------------------------------------------------------------- */
const getProjectDetail = async (developerId, projectId) => {
  try {
    const projectDBRef = database.ref(getProjectsRef(developerId, projectId));
    let dataSnapshot = await projectDBRef.child("details").once("value");
    dataSnapshot = dataSnapshot.val();
    if (!dataSnapshot || dataSnapshot == null)
      throw new Error("Couldn't find project");
    return dataSnapshot;
  } catch (e) {
    throw new Error(e);
  }
};

/* -------------------------------------------------------------------------- */
/*                             update project detail                             */
/* -------------------------------------------------------------------------- */
const updateProjectDetail = async (developerId, projectId, itemToSet) => {
  try {
    const projectDBRef = database.ref(getProjectsRef(developerId, projectId));
    const updatedValue = await projectDBRef
      .child("details")
      .update({ ...itemToSet });
    return updatedValue;
  } catch (e) {
    throw new Error(e);
  }
};

module.exports = {
  createDeveloper,
  createNewProject,
  getProjectDetail,
  updateProjectDetail,
};
