const levels = ['error', 'warn', 'info', 'debug'];
const currentLevel = levels.indexOf(process.env.LOG_LEVEL || 'info');

const logger = {
  error: (...args) => { if (currentLevel >= 0) console.error('[ERROR]', ...args); },
  warn: (...args) => { if (currentLevel >= 1) console.warn('[WARN]', ...args); },
  info: (...args) => { if (currentLevel >= 2) console.log('[INFO]', ...args); },
  debug: (...args) => { if (currentLevel >= 3) console.log('[DEBUG]', ...args); },
};

module.exports = logger;
