import { ProjectProfile, PlatformCompatibility, CompatibilityIssue, CompatibilityCheck, CompatibilityStatus } from "../types";
import { PLATFORMS } from "../platforms";

export function evaluateDocker(profile: ProjectProfile): PlatformCompatibility {
  const blockers: CompatibilityIssue[] = [];
  const warnings: CompatibilityIssue[] = [];
  const passes: CompatibilityCheck[] = [];
  const recommendations: string[] = [];

  // A generic VPS / Docker setup supports almost anything, provided there's a Dockerfile
  
  if (profile.usesDocker) {
     passes.push({
      rule: "dockerfile",
      description: "Project contains Docker configuration, making it ready for any VPS.",
      passed: true,
    });
  } else {
      warnings.push({
        rule: "missing-dockerfile",
        reason: "You do not have a Dockerfile. To deploy to a generic VPS easily, you usually need to write a Dockerfile first.",
        severity: "warning",
        evidence: [],
        suggestion: "Add a Dockerfile or use a PaaS like Railway/Render that builds the app for you.",
      });
  }

  // 1. Persistent Processes (Pass)
  if (profile.requiresPersistentProcess) {
     passes.push({
      rule: "persistent-process",
      description: "Full control over processes. Daemons and bots are fully supported.",
      passed: true,
    });
  }

  // 2. WebSockets (Pass)
  if (profile.usesWebSockets) {
     passes.push({
      rule: "websockets",
      description: "Full network control for WebSockets. Just configure your reverse proxy (nginx/traefik) correctly.",
      passed: true,
    });
  }

  // 3. Background Workers (Pass)
  if (profile.usesWorkers) {
     passes.push({
      rule: "background-workers",
      description: "You can run as many background processes as your server's RAM allows.",
      passed: true,
    });
  }

  // 4. Cron Jobs (Pass)
  if (profile.usesCron) {
     passes.push({
      rule: "cron-jobs",
      description: "You have full access to the system cron or can run scheduler containers.",
      passed: true,
    });
  }

  // 5. Databases (Pass)
  if (profile.databases.length > 0) {
      passes.push({
      rule: "databases",
      description: "You can run any database via Docker containers on your VPS.",
      passed: true,
    });
  }
  
  if (profile.databases.includes("sqlite")) {
      passes.push({
      rule: "sqlite",
      description: "SQLite works perfectly on a VPS file system. Just map a Docker volume.",
      passed: true,
    });
  }

  let score = 100;
  score -= blockers.length * 30;
  score -= warnings.length * 10;
  score = Math.max(0, score);

  let status: CompatibilityStatus = "compatible";
  if (blockers.length > 0) {
    status = "incompatible";
  } else if (warnings.length > 0) {
    status = "possible";
  }

  let why = "";
  if (status === "incompatible") {
    why = `A VPS/Docker setup is not recommended because ${blockers.map(b => b.rule).join(", ")}.`;
  } else if (status === "possible") {
    why = `A VPS/Docker setup will work, but be mindful of ${warnings.map(w => w.rule).join(", ")}.`;
  } else {
    why = `A generic VPS or Docker environment can host this project perfectly, offering maximum control.`;
  }

  return {
    platform: PLATFORMS.docker,
    status,
    score,
    why,
    blockers,
    warnings,
    passes,
    recommendations,
  };
}
