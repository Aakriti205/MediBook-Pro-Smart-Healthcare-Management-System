const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  if (err.name === "CastError") {
    error = { message: "Resource not found", statusCode: 404 };
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = { message: `${field} already exists`, statusCode: 400 };
  }
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map(e => e.message);
    error = { message: messages.join(", "), statusCode: 400 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Server Error"
  });
};

module.exports = errorHandler;
