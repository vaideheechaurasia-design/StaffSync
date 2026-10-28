export const notFoundMiddleware = (req, res, next) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    error: 'Not Found',
    message: `Endpoint ${req.method} ${req.originalUrl} does not exist on this server.`
  });
};

