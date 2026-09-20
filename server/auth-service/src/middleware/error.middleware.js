const errorHandler = (err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
  });
};

export default errorHandler;