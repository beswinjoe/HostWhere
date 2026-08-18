import { ProjectProfile, PlatformCompatibility, CompatibilityIssue, CompatibilityCheck, CompatibilityStatus } from "../types";
import { PLATFORMS } from "../platforms";

export function evaluateHeroku(profile: ProjectProfile): PlatformCompatibility {
  const blockers: CompatibilityIssue[] = [];
  const warnings: CompatibilityIssue[] = [];
  const passes: CompatibilityCheck[] = [];
  const recommendations: string[] = [];

  // 1. Persistent Processes (Pass)
  if (profile.requiresPersistentProcess) {
    passes.push({
      rule: "persistent-process",
      description: "Heroku supports persistent worker and web dynos perfectly.",
      passed: true,
    });
  }

  // 2. WebSockets (Warning/Pass)
  if (profile.usesWebSockets) {
    warnings.push({
      rule: "websockets",
      reason: "Heroku supports WebSockets, but connections may be dropped after 55 seconds of inactivity. You must implement ping/pong keepalives.",
      severity: "warning",
      evidence: profile.evidence.filter(e => e.snippet?.toLowerCase().includes("websocket")),
      suggestion: "Implement WebSocket keepalives.",
    });
  }

  // 3. SQLite (Blocker)
  if (profile.databases.includes("sqlite")) {
    blockers.push({
      rule: "sqlite-ephemeral",
      reason: "Heroku's filesystem is ephemeral. SQLite databases will be erased on every restart or deployment.",
      severity: "blocker",
      evidence: profile.evidence.filter(e => e.snippet?.toLowerCase().includes("sqlite")),
      suggestion: "Migrate to Heroku Postgres.",
    });
  }

  // 4. Databases (Pass)
  if (profile.databases.length > 0 && !profile.databases.includes("sqlite")) {
    passes.push({
      rule: "databases",
      description: "Heroku offers managed Postgres and Redis add-ons natively.",
      passed: true,
    });
  }

  // 5. Docker (Pass)
  if (profile.usesDocker) {
    passes.push({
      rule: "docker",
      description: "Heroku supports Docker via its Container Registry.",
      passed: true,
    });
  }

  let score = 100;
  score -= blockers.length * 30;
  score -= warnings.length * 5;
  score = Math.max(0, score);

  let status: CompatibilityStatus = "compatible";
  if (blockers.length > 0) {
    status = "incompatible";
  } else if (warnings.length > 0) {
    status = "possible";
  }

  let why = "";
  if (status === "incompatible") {
    why = `Heroku is incompatible because of ${blockers.map(b => b.rule).join(", ")}.`;
  } else if (status === "possible") {
    why = `Heroku is a solid choice, but keep in mind ${warnings.map(w => w.rule).join(", ")}.`;
  } else {
    why = `Heroku fully supports this project's requirements, offering an easy-to-manage PaaS environment.`;
  }

  return {
    platform: PLATFORMS.heroku,
    status,
    score,
    why,
    blockers,
    warnings,
    passes,
    recommendations,
  };
}
