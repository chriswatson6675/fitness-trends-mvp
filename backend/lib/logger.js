const LEVELS = ['debug','info','warn','error'];
const configuredLevel = (process.env.LOG_LEVEL || 'debug').toLowerCase();
const levelIndex = Math.max(0, LEVELS.indexOf(configuredLevel));

function timestamp() {
  return new Date().toISOString();
}

function formatArgs(args) {
  return args.map(a => {
    if (a instanceof Error) return a.stack || a.message;
    if (typeof a === 'object') {
      try { return JSON.stringify(a); } catch (e) { return String(a); }
    }
    return String(a);
  }).join(' ');
}

function loggerFor(level) {
  return (...args) => {
    const idx = LEVELS.indexOf(level);
    if (idx < levelIndex) return;
    const out = `[${timestamp()}] [${level.toUpperCase()}] ${formatArgs(args)}`;
    if (level === 'error') {
      console.error(out);
    } else {
      console.log(out);
    }
  };
}

module.exports = {
  info: loggerFor('info'),
  error: loggerFor('error'),
  warn: loggerFor('warn'),
  debug: loggerFor('debug'),
};
