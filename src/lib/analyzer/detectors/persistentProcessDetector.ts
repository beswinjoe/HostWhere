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
  let totalConfidence = 0;

  // 1. Check dependencies
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
          totalConfidence += 50; // Medium confidence
          evidence.push({
            file: "package.json",
            type: "dependency",
            snippet: `Persistent process dependency: ${dep}`,
            confidence: 50,
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
            totalConfidence += 90; // High confidence
            evidence.push({
              file: "package.json",
              type: "config",
              snippet: `Start script runs persistent process: "${startCmd}"`,
              confidence: 90,
            });
          }
        }
      }
    } catch {
      // Invalid JSON
    }
  }

  // 2. Check Python deps
  const requirementsTxt = files.get("requirements.txt");
  if (requirementsTxt) {
    const pyPersistentDeps = ["discord.py", "python-telegram-bot", "aiogram", "slackclient"];
    for (const dep of pyPersistentDeps) {
      const regex = new RegExp(`^${dep}(?:[>=<~].*)?$`, "im");
      if (regex.test(requirementsTxt)) {
        totalConfidence += 50;
        evidence.push({
          file: "requirements.txt",
          type: "dependency",
          snippet: `Persistent process dependency: ${dep}`,
          confidence: 50,
        });
      }
    }
  }

  // 3. Check source patterns
  let sourceConfidenceAdded = false;
  for (const [path, content] of files.entries()) {
    if (path.match(/\.(md|mdx|txt|json|yaml|yml|toml|html|css|scss|less)$/i)) continue;
    
    for (const { pattern, description } of PERSISTENT_SOURCE_PATTERNS) {
      if (pattern.test(content)) {
        if (!path.includes("next.config") && !path.includes("react-scripts")) {
          if (!sourceConfidenceAdded) {
            totalConfidence += 40;
            sourceConfidenceAdded = true;
          }
          evidence.push({ file: path, type: "source", snippet: description, confidence: 40 });
        }
        pattern.lastIndex = 0;
      } else {
        pattern.lastIndex = 0;
      }
    }
  }

  // 4. Check Procfile for worker processes
  const procfile = files.get("Procfile");
  if (procfile) {
    if (procfile.includes("worker:") || procfile.includes("web:")) {
      totalConfidence += 90;
      evidence.push({
        file: "Procfile",
        type: "config",
        snippet: "Procfile defines persistent process types",
        confidence: 90,
      });
    }
  }

  return {
    requiresPersistentProcess: totalConfidence >= 80,
    evidence,
  };
}
