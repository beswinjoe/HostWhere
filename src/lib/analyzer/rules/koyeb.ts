import { ProjectProfile, PlatformCompatibility, CompatibilityIssue, CompatibilityCheck, CompatibilityStatus } from "../types";
import { PLATFORMS } from "../platforms";

export function evaluateKoyeb(profile: ProjectProfile): PlatformCompatibility {
  const blockers: CompatibilityIssue[] = [];
  const warnings: CompatibilityIssue[] = [];
  const passes: CompatibilityCheck[] = [];
  const recommendations: string[] = [];

  if (profile.requiresPersistentProcess) {
    passes.push({
      rule: "persistent-process",
      description: "Koyeb supports persistent background workers and standard server processes.",
      passed: true,
    });
  }

  if (profile.usesWebSockets) {
    passes.push({
      rule: "websockets",
      description: "Koyeb's global edge network fully supports WebSocket connections.",
      passed: true,
    });
  }

  if (profile.databases.includes("sqlite")) {
    blockers.push({
      rule: "sqlite-ephemeral",
      reason: "Koyeb instances have ephemeral filesystems. SQLite databases will be lost on redeploys/restarts.",
      severity: "blocker",
      evidence: profile.evidence.filter(e => e.snippet?.toLowerCase().includes("sqlite")),
      suggestion: "Use an external managed database like Neon or Supabase.",
    });
  }

  if (profile.usesDocker) {
    passes.push({
      rule: "docker",
      description: "Koyeb is deeply integrated with Docker and can deploy any containerized application.",
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
    why = `Koyeb is incompatible because of ${blockers.map(b => b.rule).join(", ")}.`;
  } else if (status === "possible") {
    why = `Koyeb can run this, but note limitations regarding ${warnings.map(w => w.rule).join(", ")}.`;
  } else {
    why = `Koyeb is an excellent serverless platform choice for this application, offering global distribution.`;
  }

  return {
    platform: PLATFORMS.koyeb,
    status,
    score,
    why,
    blockers,
    warnings,
    passes,
    recommendations,
  };
}
