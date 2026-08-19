import type { ProjectFiles, DetectorResult, Evidence } from "../types";

// Only strong server-side dependencies that indicate hosting a WebSocket server
const WS_SERVER_DEPENDENCIES = [
  "ws", "socket.io", "sockjs", "engine.io",
  "websocket", "faye-websocket", "uws", "µWebSockets",
  "primus", "actioncable", "anycable", "@fastify/websocket"
];

// High-confidence patterns indicating server-side WebSocket hosting
const WS_SOURCE_PATTERNS = [
  { pattern: /WebSocketServer|ws\.Server/g, description: "WebSocket server creation" },
  { pattern: /\.on\s*\(\s*['"]connection['"]/g, description: "WebSocket connection handler" },
  { pattern: /upgrade.*websocket/gi, description: "WebSocket upgrade handling" },
];

export function websocketDetector(files: ProjectFiles): DetectorResult {
  const evidence: Evidence[] = [];
  let totalConfidence = 0;

  // 1. Check JS/TS dependencies
  const pkgContent = files.get("package.json");
  if (pkgContent) {
    try {
      const pkg = JSON.parse(pkgContent) as Record<string, unknown>;
      const allDeps = [
        ...Object.keys((pkg.dependencies || {}) as Record<string, string>),
        ...Object.keys((pkg.devDependencies || {}) as Record<string, string>),
      ];

      for (const dep of WS_SERVER_DEPENDENCIES) {
        if (allDeps.includes(dep)) {
          totalConfidence += 50; // Medium confidence
          evidence.push({
            file: "package.json",
            type: "dependency",
            snippet: `Server WebSocket dependency: ${dep}`,
            confidence: 50,
          });
        }
      }
    } catch {
      // Invalid JSON
    }
  }

  // 2. Check Python dependencies
  const requirementsTxt = files.get("requirements.txt");
  if (requirementsTxt) {
    const pyWsDeps = ["channels", "django-channels", "websockets", "daphne"];
    for (const dep of pyWsDeps) {
      const regex = new RegExp(`^${dep}(?:[>=<~].*)?$`, "im");
      if (regex.test(requirementsTxt)) {
        totalConfidence += 50;
        evidence.push({
          file: "requirements.txt",
          type: "dependency",
          snippet: `Server WebSocket dependency: ${dep}`,
          confidence: 50,
        });
      }
    }
  }

  // 3. Check source code patterns
  let sourceConfidenceAdded = false;
  for (const [path, content] of files.entries()) {
    // Skip documentation and non-code files completely
    if (path.match(/\.(md|mdx|txt|json|yaml|yml|toml|html|css|scss|less)$/i)) continue;
    
    for (const { pattern, description } of WS_SOURCE_PATTERNS) {
      if (pattern.test(content)) {
        if (!sourceConfidenceAdded) {
          totalConfidence += 40;
          sourceConfidenceAdded = true;
        }
        evidence.push({
          file: path,
          type: "source",
          snippet: description,
          confidence: 40,
        });
        pattern.lastIndex = 0;
        break; // Only count once per file
      }
      pattern.lastIndex = 0;
    }
  }

  return {
    usesWebSockets: totalConfidence >= 80,
    evidence,
  };
}
