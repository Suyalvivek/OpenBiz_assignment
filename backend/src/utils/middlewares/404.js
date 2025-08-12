/**
 * 404 Not Found middleware
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({ error: 'Resource not found' });
};

export default notFoundHandler;