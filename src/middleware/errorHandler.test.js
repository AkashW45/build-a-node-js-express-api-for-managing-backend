const errorHandler = require('./errorHandler');
const logger = require('../utils/logger');

jest.mock('../utils/logger', () => ({
  error: jest.fn(),
}));

describe('errorHandler middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  test('handles generic error with custom status and message', () => {
    const err = { name: 'Error', message: 'Custom error', status: 404, stack: 'stack trace' };
    errorHandler(err, req, res, next);
    expect(logger.error).toHaveBeenCalledWith(err.stack);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Custom error' });
    expect(next).not.toHaveBeenCalled();
  });

  test('handles generic error without status or message, defaults to 500 and Internal server error', () => {
    const err = { name: 'Error', stack: 'stack trace' };
    errorHandler(err, req, res, next);
    expect(logger.error).toHaveBeenCalledWith(err.stack);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    expect(next).not.toHaveBeenCalled();
  });

  test('handles SequelizeValidationError with errors array', () => {
    const err = {
      name: 'SequelizeValidationError',
      errors: [{ message: 'Name is required' }, { message: 'Email is invalid' }],
      stack: 'val stack',
    };
    errorHandler(err, req, res, next);
    expect(logger.error).toHaveBeenCalledWith(err.stack);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Validation error',
      details: ['Name is required', 'Email is invalid'],
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('handles SequelizeUniqueConstraintError with errors array', () => {
    const err = {
      name: 'SequelizeUniqueConstraintError',
      errors: [{ message: 'Email must be unique' }],
      stack: 'unique stack',
    };
    errorHandler(err, req, res, next);
    expect(logger.error).toHaveBeenCalledWith(err.stack);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Validation error',
      details: ['Email must be unique'],
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('handles SequelizeValidationError without errors array', () => {
    const err = { name: 'SequelizeValidationError', stack: 'val stack' };
    errorHandler(err, req, res, next);
    expect(logger.error).toHaveBeenCalledWith(err.stack);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Validation error',
      details: 'Invalid data',
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('handles SequelizeUniqueConstraintError without errors array', () => {
    const err = { name: 'SequelizeUniqueConstraintError', stack: 'unique stack' };
    errorHandler(err, req, res, next);
    expect(logger.error).toHaveBeenCalledWith(err.stack);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Validation error',
      details: 'Invalid data',
    });
    expect(next).not.toHaveBeenCalled();
  });
});