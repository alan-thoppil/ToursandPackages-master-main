// ═══════════════════════════════════════════════════════════
//  lib/logger.js
//  Structured console logger + Express request timing middleware.
//  Zero dependencies — uses only Node built-ins.
// ═══════════════════════════════════════════════════════════

const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const MIN_LEVEL = LEVELS[process.env.LOG_LEVEL?.toLowerCase()] ?? LEVELS.info;

const COLORS = {
  debug: "\x1b[36m",   // cyan
  info:  "\x1b[32m",   // green
  warn:  "\x1b[33m",   // yellow
  error: "\x1b[31m",   // red
  reset: "\x1b[0m",
  dim:   "\x1b[2m",
  bold:  "\x1b[1m",
};

const isProd = process.env.NODE_ENV === "production";

function timestamp() {
  return new Date().toISOString();
}

function formatMsg(level, module, message, meta) {
  if (isProd) {
    // Production: machine-readable JSON
    return JSON.stringify({
      ts: timestamp(),
      level,
      module,
      message,
      ...(meta ? { meta } : {}),
    });
  }

  // Development: pretty human-readable
  const c = COLORS[level] || "";
  const tag = `${c}[${level.toUpperCase().padEnd(5)}]${COLORS.reset}`;
  const mod = module ? `${COLORS.dim}[${module}]${COLORS.reset} ` : "";
  const metaStr = meta
    ? ` ${COLORS.dim}${JSON.stringify(meta)}${COLORS.reset}`
    : "";
  return `${COLORS.dim}${timestamp()}${COLORS.reset} ${tag} ${mod}${message}${metaStr}`;
}

function log(level, module, message, meta) {
  if (LEVELS[level] < MIN_LEVEL) return;
  const output = formatMsg(level, module, message, meta);
  if (level === "error") {
    console.error(output);
  } else {
    console.log(output);
  }
}

// ── Logger factory ───────────────────────────────────────────

export function createLogger(module) {
  return {
    debug: (msg, meta) => log("debug", module, msg, meta),
    info:  (msg, meta) => log("info",  module, msg, meta),
    warn:  (msg, meta) => log("warn",  module, msg, meta),
    error: (msg, meta) => log("error", module, msg, meta),
  };
}

// ── Request timing middleware ─────────────────────────────────

const reqLogger = createLogger("http");

export function requestLogger(req, res, next) {
  const start = Date.now();
  const { method, url, ip } = req;

  res.on("finish", () => {
    const ms  = Date.now() - start;
    const sc  = res.statusCode;
    const lvl = sc >= 500 ? "error" : sc >= 400 ? "warn" : "info";
    reqLogger[lvl](`${method} ${url} → ${sc}`, { ms, ip });
  });

  next();
}

// ── Cache stats endpoint helper ───────────────────────────────

export function cacheStatsHandler(cache) {
  return (_req, res) => {
    res.json({ cache: cache.stats() });
  };
}
