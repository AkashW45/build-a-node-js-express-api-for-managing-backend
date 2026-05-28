const LOG_LEVEL_ENV = 'LOG_LEVEL';

describe('logger', () => {
  let consoleErrorSpy;
  let consoleWarnSpy;
  let consoleLogSpy;

  beforeEach(() => {
    jest.resetModules();
    delete process.env[LOG_LEVEL_ENV];
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function loadLogger() {
    return require('./logger');
  }

  it('should log error, warn, and info when LOG_LEVEL is "info" (default), but not debug', () => {
    const logger = loadLogger();
    logger.error('test');
    logger.warn('test');
    logger.info('test');
    logger.debug('test');

    expect(consoleErrorSpy).toHaveBeenCalledWith('[ERROR]', 'test');
    expect(consoleWarnSpy).toHaveBeenCalledWith('[WARN]', 'test');
    expect(consoleLogSpy).toHaveBeenCalledWith('[INFO]', 'test');
    expect(consoleLogSpy).not.toHaveBeenCalledWith('[DEBUG]', 'test');
    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
  });

  it('should log all levels when LOG_LEVEL is "debug"', () => {
    process.env[LOG_LEVEL_ENV] = 'debug';
    const logger = loadLogger();
    logger.error('test');
    logger.warn('test');
    logger.info('test');
    logger.debug('test');

    expect(consoleErrorSpy).toHaveBeenCalledWith('[ERROR]', 'test');
    expect(consoleWarnSpy).toHaveBeenCalledWith('[WARN]', 'test');
    expect(consoleLogSpy).toHaveBeenCalledWith('[INFO]', 'test');
    expect(consoleLogSpy).toHaveBeenCalledWith('[DEBUG]', 'test');
    expect(consoleLogSpy).toHaveBeenCalledTimes(2);
  });

  it('should log only error when LOG_LEVEL is "error"', () => {
    process.env[LOG_LEVEL_ENV] = 'error';
    const logger = loadLogger();
    logger.error('test');
    logger.warn('test');
    logger.info('test');
    logger.debug('test');

    expect(consoleErrorSpy).toHaveBeenCalledWith('[ERROR]', 'test');
    expect(consoleWarnSpy).not.toHaveBeenCalled();
    expect(consoleLogSpy).not.toHaveBeenCalled();
  });

  it('should log nothing when LOG_LEVEL is an invalid string', () => {
    process.env[LOG_LEVEL_ENV] = 'none';
    const logger = loadLogger();
    logger.error('test');
    logger.warn('test');
    logger.info('test');
    logger.debug('test');

    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(consoleWarnSpy).not.toHaveBeenCalled();
    expect(consoleLogSpy).not.toHaveBeenCalled();
  });

  it('should log nothing when LOG_LEVEL is uppercase (case-sensitive)', () => {
    process.env[LOG_LEVEL_ENV] = 'INFO';
    const logger = loadLogger();
    logger.error('test');
    logger.warn('test');
    logger.info('test');
    logger.debug('test');

    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(consoleWarnSpy).not.toHaveBeenCalled();
    expect(consoleLogSpy).not.toHaveBeenCalled();
  });
});