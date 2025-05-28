// controllers/errorController.js
const AppError = require('../utils/appError');

// Handle Mongoose validation errors
const handleValidationErrorDB = err => {
  const messages = Object.values(err.errors).map(el => el.message);
  return new AppError(messages.join('. '), 400);
};

// Handle duplicate key errors (11000)
// const handleDuplicateFieldsDB = err => {
//   const field = Object.keys(err.keyValue)[0];
//   const value = err.keyValue[field];
//   return new AppError(`Duplicate field "${field}": "${value}". Please use another value.`, 400);
// };
const handleDuplicateFieldsDB = err => {
  const field = Object.keys(err.keyValue)[0];
  // if it's the email index, give a friendlier message:
  if (field === 'email') {
    return new AppError('That email is already registered.', 400);
  }
  // otherwise fallback to a generic duplicate‐field message
  return new AppError(
    `Duplicate field "${field}". Please choose another ${field}.`,
    400
  );
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }
  // Programming or other unknown error: don't leak details
  console.error('💥 ERROR:', err);
  res.status(500).json({
    status: 'error',
    message: 'Something went very wrong!'
  });
};

module.exports = (err, req, res, next) => {
  // set defaults
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = Object.assign(err);
    // handle known Mongoose errors
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    sendErrorProd(error, res);
  }
};
