const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const runId = `predev-${Date.now()}`;
const cwd = process.cwd();
const viteCmdPath = path.join(cwd, "node_modules", ".bin", "vite.cmd");
const viteBinPath = path.join(cwd, "node_modules", ".bin", "vite");
const vitePkgPath = path.join(cwd, "node_modules", "vite", "package.json");

const safeStat = (filePath) => {
  try {
    const stat = fs.statSync(filePath);
    return { exists: true, size: stat.size, mtimeMs: stat.mtimeMs };
  } catch {
    return { exists: false };
  }
};

const safePreview = (filePath) => {
  try {
    return fs
      .readFileSync(filePath, "utf8")
      .split(/\r?\n/)
      .slice(0, 5)
      .join(" | ");
  } catch {
    return null;
  }
};

const safeWhere = (target) => {
  const result = spawnSync("where.exe", [target], { encoding: "utf8" });
  return {
    status: result.status,
    stdout: (result.stdout || "").trim().split(/\r?\n/).slice(0, 8),
    stderr: (result.stderr || "").trim().split(/\r?\n/).slice(0, 8),
  };
};

const pathHead = (process.env.PATH || "").split(";").slice(0, 10);

// #region agent log
fetch("http://127.0.0.1:7540/ingest/9ab1bba2-3be0-4dad-a0c3-aecb5617ecca", {
  method: "POST",
  headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "7cdf32" },
  body: JSON.stringify({
    sessionId: "7cdf32",
    runId,
    hypothesisId: "H3",
    location: "scripts/debug-predev.cjs:42",
    message: "npm lifecycle and execution context",
    data: {
      cwd,
      execPath: process.execPath,
      npmLifecycleEvent: process.env.npm_lifecycle_event || null,
      npmExecpath: process.env.npm_execpath || null,
      npmNodeExecpath: process.env.npm_node_execpath || null,
      npmConfigScriptShell: process.env.npm_config_script_shell || null,
      pathHead,
    },
    timestamp: Date.now(),
  }),
}).catch(() => {});
// #endregion

// #region agent log
fetch("http://127.0.0.1:7540/ingest/9ab1bba2-3be0-4dad-a0c3-aecb5617ecca", {
  method: "POST",
  headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "7cdf32" },
  body: JSON.stringify({
    sessionId: "7cdf32",
    runId,
    hypothesisId: "H2",
    location: "scripts/debug-predev.cjs:67",
    message: "vite binary and package file presence",
    data: {
      viteCmdPath,
      viteBinPath,
      vitePkgPath,
      viteCmdStat: safeStat(viteCmdPath),
      viteBinStat: safeStat(viteBinPath),
      vitePkgStat: safeStat(vitePkgPath),
    },
    timestamp: Date.now(),
  }),
}).catch(() => {});
// #endregion

// #region agent log
fetch("http://127.0.0.1:7540/ingest/9ab1bba2-3be0-4dad-a0c3-aecb5617ecca", {
  method: "POST",
  headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "7cdf32" },
  body: JSON.stringify({
    sessionId: "7cdf32",
    runId,
    hypothesisId: "H1",
    location: "scripts/debug-predev.cjs:89",
    message: "binary resolution order from where.exe",
    data: {
      whereNode: safeWhere("node"),
      whereNpm: safeWhere("npm"),
      whereBun: safeWhere("bun"),
      whereVite: safeWhere("vite"),
    },
    timestamp: Date.now(),
  }),
}).catch(() => {});
// #endregion

// #region agent log
fetch("http://127.0.0.1:7540/ingest/9ab1bba2-3be0-4dad-a0c3-aecb5617ecca", {
  method: "POST",
  headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "7cdf32" },
  body: JSON.stringify({
    sessionId: "7cdf32",
    runId,
    hypothesisId: "H4",
    location: "scripts/debug-predev.cjs:111",
    message: "vite shim previews before npm executes dev command",
    data: {
      viteCmdPreview: safePreview(viteCmdPath),
      viteBinPreview: safePreview(viteBinPath),
    },
    timestamp: Date.now(),
  }),
}).catch(() => {});
// #endregion

// #region agent log
fetch("http://127.0.0.1:7540/ingest/9ab1bba2-3be0-4dad-a0c3-aecb5617ecca", {
  method: "POST",
  headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "7cdf32" },
  body: JSON.stringify({
    sessionId: "7cdf32",
    runId,
    hypothesisId: "H5",
    location: "scripts/debug-predev.cjs:130",
    message: "predev instrumentation completed",
    data: { finished: true },
    timestamp: Date.now(),
  }),
}).catch(() => {});
// #endregion
