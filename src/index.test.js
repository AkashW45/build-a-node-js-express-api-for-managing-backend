jest.mock('./app', () => ({
  listen: jest.fn()
}));

jest.mock('./config/database', () => ({
  sequelize: {
    authenticate: jest.fn(),
    sync: jest.fn()
  }
}));

jest.mock('./utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn()
}));

const originalEnv = { ...process.env };

describe('src/index', () => {
  let app, sequelize, logger, exitSpy;

  beforeEach(() => {
    jest.resetModules();
    exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
    app = require('./app');
    sequelize = require('./config/database').sequelize;
    logger = require('./utils/logger');

    // Default happy-path mocks
    sequelize.authenticate.mockResolvedValue();
    sequelize.sync.mockResolvedValue();
    app.listen.mockImplementation((port, cb) => cb());

    // Clean environment before each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('should start server on default port and sync when not production', async () => {
    delete process.env.NODE_ENV;
    require('../src/index');
    await Promise.resolve();

    expect(sequelize.authenticate).toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith('Database connection established successfully.');
    expect(sequelize.sync).toHaveBeenCalledWith({ alter: false });
    expect(logger.info).toHaveBeenCalledWith('Database tables synced.');
    expect(app.listen).toHaveBeenCalledWith(3000, expect.any(Function));
    expect(logger.info).toHaveBeenCalledWith(`Notes API service running on port 3000`);
  });

  test('should not sync models when NODE_ENV is production', async () => {
    process.env.NODE_ENV = 'production';
    require('../src/index');
    await Promise.resolve();

    expect(sequelize.sync).not.toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith('Database connection established successfully.');
    expect(app.listen).toHaveBeenCalledWith(3000, expect.any(Function));
    expect(logger.info).toHaveBeenCalledWith(`Notes API service running on port 3000`);
  });

  test('should use PORT from environment variable if set', async () => {
    process.env.PORT = '4000';
    delete process.env.NODE_ENV;
    require('../src/index');
    await Promise.resolve();

    expect(app.listen).toHaveBeenCalledWith(4000, expect.any(Function));
    expect(logger.info).toHaveBeenCalledWith(`Notes API service running on port 4000`);
  });

  test('should log error and exit process on database authentication failure', async () => {
    const error = new Error('Connection refused');
    sequelize.authenticate.mockRejectedValue(error);
    require('../src/index');
    await Promise.resolve();

    expect(logger.error).toHaveBeenCalledWith('Unable to start server:', error);
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});