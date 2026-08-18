import { ProjectProfile, PlatformCompatibility, CompatibilityIssue, CompatibilityCheck, CompatibilityStatus } from "../types";
import { PLATFORMS } from "../platforms";

export function evaluateAWS(profile: ProjectProfile): PlatformCompatibility {
  const blockers: CompatibilityIssue[] = [];
  const warnings: CompatibilityIssue[] = [];
  const passes: CompatibilityCheck[] = [];
  const recommendations: string[] = [];

  if (profile.requiresPersistentProcess) {
    warnings.push({
      rule: "stateless-containers",
      reason: "AWS App Runner handles scaling by spinning containers up and down. Long-running stateful workers (like Discord bots) might not behave predictably without specific configuration.",
      severity: "warning",
      evidence: profile.evidence.filter(e => e.snippet?.toLowerCase().includes("persistent")),
      suggestion: "Consider AWS ECS or EC2 for purely stateful, long-running daemons.",
    });
  }

  if (profile.databases.includes("sqlite")) {
    blockers.push({
      rule: "sqlite-ephemeral",
      reason: "AWS App Runner containers are ephemeral. SQLite will be destroyed when the container stops.",
      severity: "blocker",
      evidence: profile.evidence.filter(e => e.snippet?.toLowerCase().includes("sqlite")),
      suggestion: "Use AWS RDS (PostgreSQL/MySQL) or DynamoDB.",
    });
  }

  if (profile.usesDocker) {
    passes.push({
      rule: "docker",
      description: "AWS App Runner natively deploys containers from ECR or source.",
      passed: true,
    });
  }

  let score = 90; // Slightly lower default because AWS is harder to configure than Heroku/Railway
  score -= blockers.length * 30;
  score -= warnings.length * 15;
  score = Math.max(0, score);

  let status: CompatibilityStatus = "compatible";
  if (blockers.length > 0) {
    status = "incompatible";
  } else if (warnings.length > 0) {
    status = "possible";
  }

  let why = "";
  if (status === "incompatible") {
    why = `AWS App Runner is incompatible because of ${blockers.map(b => b.rule).join(", ")}.`;
  } else if (status === "possible") {
    why = `AWS App Runner can host this, but beware of ${warnings.map(w => w.rule).join(", ")}.`;
  } else {
    why = `AWS App Runner is a solid choice for scalable, stateless containerized workloads.`;
  }

  return {
    platform: PLATFORMS.aws,
    status,
    score,
    why,
    blockers,
    warnings,
    passes,
    recommendations,
  };
}
