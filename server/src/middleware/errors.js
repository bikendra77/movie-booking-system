export const notFound = (_req, res) => {
  res.status(404).json({ message: 'The requested API route was not found.' });
};

export const errorHandler = (error, _req, res, _next) => {
  if (Number.isInteger(error.status)) {
    return res.status(error.status).json({ message: error.message });
  }
  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return res.status(400).json({ message: error.message });
  }
  if (error.code === 11000) {
    return res.status(409).json({ message: 'A record with that value already exists.' });
  }
  console.error(error);
  res.status(500).json({ message: 'An unexpected server error occurred.' });
};
