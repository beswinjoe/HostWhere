import type { ProjectFiles, DetectorResult, Evidence } from "../types";

/** Dependencies that indicate a persistent, long-running process */
const PERSISTENT_PROCESS_DEPS = [
  // Discord bots
  "discord.js", "discord.io", "eris", "oceanic.js", "discordeno",
  // Telegram bots
  "telegraf", "node-telegram-bot-api", "grammy",
  // Slack bots
  "@slack/bolt", "@slack/rtm-api",
  // IRC
  "irc", "irc-framework",
  // Game servers
  "colyseus", "geckos.io",
  // MQTT / IoT
  "mqtt", "aedes",
  // gRPC servers (often persistent)
  "@grpc/grpc-js",
  // Python equivalents
  "discord.py", "python-telegram-bot", "aiogram", "slackclient",
];

const PERSISTENT_SOURCE_PATTERNS = [
  { pattern: /client\.login\s*\(/g, description: "Bot login (persistent connection)" },
  { pattern: /bot\.start\s*\(/g, description: "Bot start (persistent process)" },
  { pattern: /bot\.launch\s*\(/g, description: "Bot launch (persistent process)" },
  { pattern: /\.on\s*\(\s*['"]ready['"]/g, description: "Ready event listener (persistent)" },
  { pattern: /GatewayIntentBits/g, description: "Discord Gateway intents (persistent)" },
  { pattern: /Intents\.FLAGS/g, description: "Discord intents (persistent)" },
  { pattern: /app\.listen\s*\(\s*\d/g, description: "HTTP server listen on port" },
  { pattern: /server\.listen\s*\(\s*\d/g, description: "Server listen on port" },
  { pattern: /createServer\s*\(/g, description: "HTTP server creation" },
  { pattern: /\.run\s*\(\s*host\s*=/g, description: "Python server run" },
  { pattern: /uvicorn\.run/g, description: "Uvicorn server" },
];

export function persistentProcessDetector(files: ProjectFiles): DetectorResult {
  const evidence: Evidence[] = [];
  let requiresPersistentProcess = false;

  // Check dependencies
  const pkgContent = files.get("package.json");
  if (pkgContent) {
    try {
      const pkg = JSON.parse(pkgContent) as Record<string, unknown>;
      const allDeps = [
        ...Object.keys((pkg.dependencies || {}) as Record<string, string>),
        ...Object.keys((pkg.devDependencies || {}) as Record<string, string>),
      ];

      for (const dep of PERSISTENT_PROCESS_DEPS) {
        if (allDeps.includes(dep)) {
          requiresPersistentProcess = true;
          evidence.push({
            file: "package.json",
            type: "dependency",
            snippet: `Persistent process dependency: ${dep}`,
          });
        }
      }

      // Check start script for node/ts-node direct execution
      const scripts = (pkg.scripts || {}) as Record<string, string>;
      if (scripts.start) {
        const startCmd = scripts.start;
        if (
          startCmd.includes("node ") ||
          startCmd.includes("ts-node ") ||
          startCmd.includes("tsx ") ||
          startCmd.includes("nodemon ")
        ) {
          // A direct node execution start script implies a persistent server
          if (!startCmd.includes("next ") && !startCmd.includes("react-scripts")) {
            requiresPersistentProcess = true;
            evidence.push({
              file: "package.json",
              type: "config",
              snippet: `Start script runs persistent process: "${startCmd}"`,
            });
          }
        }
      }
    } catch {
      // Invalid JSON
    }
  }

  // Check Python deps
  const requirementsTxt = files.get("requirements.txt");
  if (requirementsTxt) {
    for (const dep of PERSISTENT_PROCESS_DEPS) {
      if (requirementsTxt.toLowerCase().includes(dep.toLowerCase())) {
        requiresPersistentProcess = true;
        evidence.push({
          file: "requirements.txt",
          type: "dependency",
          snippet: `Persistent process dependency: ${dep}`,
        });
      }
    }
  }

  // Check source patterns
  let filesChecked = 0;
  for (const [path, content] of files.entries()) {
    if (filesChecked > 200) break;
    if (!path.endsWith(".ts") && !path.endsWith(".tsx") && !path.endsWith(".js") && !path.endsWith(".jsx") && !path.endsWith(".py")) continue;
    if (path.includes("node_modules") || path.includes("dist/")) continue;
    filesChecked++;

    for (const { pattern, description } of PERSISTENT_SOURCE_PATTERNS) {
      if (pattern.test(content)) {
        // Only mark as persistent if it's a bot or standalone server
        // Next.js/React dev servers don't count
        if (!path.includes("next.config") && !path.includes("react-scripts")) {
          evidence.push({ file: path, type: "source", snippet: description });
        }
        pattern.lastIndex = 0;
      } else {
        pattern.lastIndex = 0;
      }
    }
  }

  // Check Procfile for worker processes
  const procfile = files.get("Procfile");
  if (procfile) {
    if (procfile.includes("worker:") || procfile.includes("web:")) {
      requiresPersistentProcess = true;
      evidence.push({
        file: "Procfile",
        type: "config",
        snippet: "Procfile defines persistent process types",
      });
    }
  }

  return {
    requiresPersistentProcess,
    evidence,
  };
}
