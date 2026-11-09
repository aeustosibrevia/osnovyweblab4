export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Маршрут ${req.originalUrl} не знайдено`
  });
};
