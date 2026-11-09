export const errorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? 'Внутрішня помилка сервера' : error.message
  });
};
