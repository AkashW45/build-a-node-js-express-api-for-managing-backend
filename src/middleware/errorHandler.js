const logger = require('../utils/logger');

// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
  logger.error(err.stack);

  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      error: 'Validation error',
      details: err.errors?.map(e => e.message) || 'Invalid data',
    });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
};
