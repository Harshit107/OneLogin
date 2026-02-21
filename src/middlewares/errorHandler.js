const ApiError = require("../utils/ApiError");

const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;
  
  // Default to 500 if unknown error
  if (!err.isOperational) {
    statusCode = statusCode || 500;
    message = statusCode === 500 ? "Internal Server Error" : message;
  }

  const response = {
    code: statusCode,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  };

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
