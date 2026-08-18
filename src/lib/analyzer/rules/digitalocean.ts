import { ProjectProfile, PlatformCompatibility, CompatibilityIssue, CompatibilityCheck, CompatibilityStatus } from "../types";
import { PLATFORMS } from "../platforms";

export function evaluateDigitalOcean(profile: ProjectProfile): PlatformCompatibility {
  const blockers: CompatibilityIssue[] = [];
  const warnings: CompatibilityIssue[] = [];
  const passes: CompatibilityCheck[] = [];
  const recommendations: string[] = [];

  if (profile.requiresPersistentProcess) {
    passes.push({
      rule: "persistent-process",
      description: "DigitalOcean App Platform natively supports persistent long-running background workers and services.",
      passed: true,
    });
  }

  if (profile.usesWebSockets) {
    passes.push({
      rule: "websockets",
      description: "DigitalOcean App Platform fully supports WebSockets.",
      passed: true,
    });
  }

  if (profile.databases.includes("sqlite")) {
    blockers.push({
      rule: "sqlite-ephemeral",
      reason: "App Platform uses ephemeral filesystems. SQLite will be lost on redeploy.",
      severity: "blocker",
      evidence: profile.evidence.filter(e => e.snippet?.toLowerCase().includes("sqlite")),
      suggestion: "Use managed databases instead.",
    });
  }

  if (profile.databases.length > 0 && !profile.databases.includes("sqlite")) {
    passes.push({
      rule: "databases",
      description: "You can provision managed databases (PostgreSQL, MySQL, Redis) directly in DO.",
      passed: true,
    });
  }

  if (profile.usesDocker) {
    passes.push({
      rule: "docker",
      description: "App Platform can deploy directly from Dockerfiles.",
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
    why = `DigitalOcean App Platform is incompatible because of ${blockers.map(b => b.rule).join(", ")}.`;
  } else if (status === "possible") {
    why = `DigitalOcean App Platform works, but you should note ${warnings.map(w => w.rule).join(", ")}.`;
  } else {
    why = `DigitalOcean App Platform is a perfect, fully-managed PaaS fit for this project's architecture.`;
  }

  return {
    platform: PLATFORMS.digitalocean,
    status,
    score,
    why,
    blockers,
    warnings,
    passes,
    recommendations,
  };
}
