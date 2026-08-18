import type { ProjectFiles, DetectorResult, Evidence } from "../types";

const WS_DEPENDENCIES = [
  "ws", "socket.io", "socket.io-client", "@socket.io/admin-ui",
  "sockjs", "sockjs-client", "engine.io",
  "websocket", "faye-websocket", "uws", "µWebSockets",
  "primus", "pusher", "pusher-js", "ably",
  "channels", "django-channels", "daphne",
  "actioncable", "anycable",
];

const WS_SOURCE_PATTERNS = [
  { pattern: /new\s+WebSocket\s*\(/g, description: "WebSocket constructor usage" },
  { pattern: /WebSocketServer|ws\.Server/g, description: "WebSocket server creation" },
  { pattern: /io\s*\(\s*['"]?http/g, description: "Socket.IO client connection" },
  { pattern: /socketio|socket\.io/gi, description: "Socket.IO reference" },
  { pattern: /\.on\s*\(\s*['"]connection['"]/g, description: "WebSocket connection handler" },
  { pattern: /upgrade.*websocket/gi, description: "WebSocket upgrade handling" },
  { pattern: /wss?:\/\//g, description: "WebSocket URL protocol" },
];

export function websocketDetector(files: ProjectFiles): DetectorResult {
  const evidence: Evidence[] = [];
  let usesWebSockets = false;

  // Check dependencies
  const pkgContent = files.get("package.json");
  if (pkgContent) {
    try {
      const pkg = JSON.parse(pkgContent) as Record<string, unknown>;
      const allDeps = [
        ...Object.keys((pkg.dependencies || {}) as Record<string, string>),
        ...Object.keys((pkg.devDependencies || {}) as Record<string, string>),
      ];

      for (const dep of WS_DEPENDENCIES) {
        if (allDeps.includes(dep)) {
          usesWebSockets = true;
          evidence.push({
            file: "package.json",
            type: "dependency",
            snippet: `WebSocket dependency: ${dep}`,
          });
        }
      }
    } catch {
      // Invalid JSON
    }
  }

  // Check Python dependencies
  const requirementsTxt = files.get("requirements.txt");
  if (requirementsTxt) {
    const pyWsDeps = ["channels", "django-channels", "websockets", "aiohttp", "daphne"];
    for (const dep of pyWsDeps) {
      if (requirementsTxt.toLowerCase().includes(dep.toLowerCase())) {
        usesWebSockets = true;
        evidence.push({
          file: "requirements.txt",
          type: "dependency",
          snippet: `WebSocket dependency: ${dep}`,
        });
      }
    }
  }

  // Check source code patterns (limited to avoid performance issues)
  if (!usesWebSockets) {
    let filesChecked = 0;
    for (const [path, content] of files.entries()) {
      if (filesChecked > 200) break;
      if (!path.endsWith(".ts") && !path.endsWith(".tsx") && !path.endsWith(".js") && !path.endsWith(".jsx") && !path.endsWith(".py")) continue;
      if (path.includes("node_modules") || path.includes(".next") || path.includes("dist/")) continue;
      filesChecked++;

      for (const { pattern, description } of WS_SOURCE_PATTERNS) {
        if (pattern.test(content)) {
          usesWebSockets = true;
          evidence.push({
            file: path,
            type: "source",
            snippet: description,
          });
          pattern.lastIndex = 0;
          break;
        }
        pattern.lastIndex = 0;
      }
      if (usesWebSockets) break;
    }
  }

  return {
    usesWebSockets,
    evidence,
  };
}
