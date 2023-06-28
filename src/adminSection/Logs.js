var colors = require("colors/safe");

const errorLog = (message) => {
  console.log(colors.brightRed.bold(message));
};

const successLog= (message) => {
  console.log(colors.bgGreen.bold(message));
};
const normalLog= (message) => {
  console.log(colors.brightBlue.bold(message));
};

const warningLog = (message) => {
  console.log(colors.brightYellow.bold(message));
};

module.exports = { errorLog, successLog, normalLog, warningLog };
