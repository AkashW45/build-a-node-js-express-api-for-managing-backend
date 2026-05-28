jest.mock('sequelize', () => {
  const mockSequelize = jest.fn();
  return { Sequelize: mockSequelize };
});

jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

describe('database configuration', () => {
  let SequelizeMock;
  let dotenvMock;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    delete process.env.DB_NAME;
    delete process.env.DB_USER;
    delete process.env.DB_PASSWORD;
    delete process.env.DB_HOST;
    delete process.env.DB_PORT;
    delete process.env.NODE_ENV;
    SequelizeMock = require('sequelize').Sequelize;
    dotenvMock = require('dotenv');
  });

  it('should create sequelize instance with environment variables', () => {
    process.env.DB_NAME = 'test_db';
    process.env.DB_USER = 'test_user';
    process.env.DB_PASSWORD = 'test_pass';
    process.env.DB_HOST = 'custom_host';
    process.env.DB_PORT = '1234';

    require('./database');

    expect(SequelizeMock).toHaveBeenCalledTimes(1);
    const [dbName, user, password, options] = SequelizeMock.mock.calls[0];
    expect(dbName).toBe('test_db');
    expect(user).toBe('test_user');
    expect(password).toBe('test_pass');
    expect(options.host).toBe('custom_host');
    expect(options.port).toBe(1234); // port is parsed to number? Sequelize likely uses string but we check raw env, env is string. source uses +? Actually source uses process.env.DB_PORT || 5432, so it's a string if present. So expect a string.
    expect(options.port).toBe('1234'); // because process.env.DB_PORT is string, no casting.
    expect(options.dialect).toBe('postgres');
  });

  it('should default host to "localhost" and port to 5432 when not provided', () => {
    process.env.DB_NAME = 'test_db';
    process.env.DB_USER = 'test_user';
    process.env.DB_PASSWORD = 'test_pass';
    // DB_HOST and DB_PORT not set

    require('./database');

    const options = SequelizeMock.mock.calls[0][3];
    expect(options.host).toBe('localhost');
    expect(options.port).toBe(5432);
  });

  it('should use console.log for logging in development mode', () => {
    process.env.DB_NAME = 'test';
    process.env.DB_USER = 'test';
    process.env.DB_PASSWORD = 'test';
    process.env.NODE_ENV = 'development';

    require('./database');

    const options = SequelizeMock.mock.calls[0][3];
    expect(options.logging).toBe(console.log);
  });

  it('should disable logging when not in development mode', () => {
    process.env.DB_NAME = 'test';
    process.env.DB_USER = 'test';
    process.env.DB_PASSWORD = 'test';
    process.env.NODE_ENV = 'production';

    require('./database');

    const options = SequelizeMock.mock.calls[0][3];
    expect(options.logging).toBe(false);
  });

  it('should set define options with timestamps and underscored', () => {
    process.env.DB_NAME = 'test';
    process.env.DB_USER = 'test';
    process.env.DB_PASSWORD = 'test';

    require('./database');

    const options = SequelizeMock.mock.calls[0][3];
    expect(options.define).toEqual({
      timestamps: true,
      underscored: true,
    });
  });

  it('should call dotenv.config() to load environment variables', () => {
    process.env.DB_NAME = 'test';
    process.env.DB_USER = 'test';
    process.env.DB_PASSWORD = 'test';

    require('./database');

    expect(dotenvMock.config).toHaveBeenCalledTimes(1);
  });
});