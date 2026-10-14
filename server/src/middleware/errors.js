const redactSensitiveDetails = (value, limit = 500) => value
  .replace(/\b(mongodb(?:\+srv)?:\/\/)[^\s/@]+@/gi, '$1[REDACTED]@')
  .replace(/\b((?:password|passwd|pwd|token|secret|authorization|api[_-]?key)\s*[:=]\s*)(?:"[^"]*"|'[^']*'|[^\s,;]+)/gi, '$1[REDACTED]')
  .slice(0, limit);

const logUnexpectedError = (req, error) => {
  const details = {
    event: 'api.unexpected_error',
    method: req.method,
    path: req.path,
    errorName: typeof error.name === 'string' ? error.name.slice(0, 100) : 'Error'
  };
  if (typeof error.code === 'string' || typeof error.code === 'number') {
    details.errorCode = error.code;
  }
  if (typeof error.message === 'string') {
    details.errorMessage = redactSensitiveDetails(error.message);
  }
  if (typeof error.stack === 'string') {
    details.errorStack = redactSensitiveDetails(error.stack, 8000);
  }
  console.error(JSON.stringify(details));
};

export const notFound = (_req, res) => {
  res.status(404).json({ message: 'The requested API route was not found.' });
};

export const errorHandler = (error, req, res, _next) => {
  if (Number.isInteger(error.status) && error.status >= 500) {
    logUnexpectedError(req, error);
    return res.status(error.status).json({ message: 'An unexpected server error occurred.' });
  }
  if (Number.isInteger(error.status)) {
    return res.status(error.status).json({ message: error.message });
  }
  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return res.status(400).json({ message: error.message });
  }
  if (error.code === 11000) {
    return res.status(409).json({ message: 'A record with that value already exists.' });
  }
  logUnexpectedError(req, error);
  res.status(500).json({ message: 'An unexpected server error occurred.' });
};
