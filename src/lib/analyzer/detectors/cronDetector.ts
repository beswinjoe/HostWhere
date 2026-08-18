import type { ProjectFiles, DetectorResult, Evidence } from "../types";

const CRON_DEPENDENCIES = [
  "node-cron", "cron", "node-schedule", "bree",
  "agenda", "later", "bottleneck",
];

const CRON_SOURCE_PATTERNS = [
  { pattern: /cron\.schedule\s*\(/g, description: "Cron job scheduling" },
  { pattern: /new\s+CronJob\s*\(/g, description: "CronJob creation" },
  { pattern: /schedule\.(scheduleJob|every|cron)/g, description: "Job scheduler" },
  { pattern: /['"](\*|\d+)\s+(\*|\d+)\s+(\*|\d+)\s+(\*|\d+)\s+(\*|\d+)['"]/g, description: "Cron expression" },
  { pattern: /setInterval\s*\(/g, description: "Interval-based scheduling" },
  { pattern: /@app\.on_event|@repeat_every/g, description: "FastAPI scheduled event" },
  { pattern: /celery\.beat|celerybeat|periodic_task/gi, description: "Celery Beat scheduler" },
];

export function cronDetector(files: ProjectFiles): DetectorResult {
  const evidence: Evidence[] = [];
  let usesCron = false;

  // Check dependencies
  const pkgContent = files.get("package.json");
  if (pkgContent) {
    try {
      const pkg = JSON.parse(pkgContent) as Record<string, unknown>;
      const allDeps = [
        ...Object.keys((pkg.dependencies || {}) as Record<string, string>),
        ...Object.keys((pkg.devDependencies || {}) as Record<string, string>),
      ];

      for (const dep of CRON_DEPENDENCIES) {
        if (allDeps.includes(dep)) {
          usesCron = true;
          evidence.push({
            file: "package.json",
            type: "dependency",
            snippet: `Cron/scheduler dependency: ${dep}`,
          });
        }
      }
    } catch {
      // Invalid JSON
    }
  }

  // Check source patterns
  if (!usesCron) {
    let filesChecked = 0;
    for (const [path, content] of files.entries()) {
      if (filesChecked > 200) break;
      if (!path.endsWith(".ts") && !path.endsWith(".tsx") && !path.endsWith(".js") && !path.endsWith(".jsx") && !path.endsWith(".py")) continue;
      if (path.includes("node_modules") || path.includes("dist/")) continue;
      filesChecked++;

      for (const { pattern, description } of CRON_SOURCE_PATTERNS) {
        if (pattern.test(content)) {
          usesCron = true;
          evidence.push({ file: path, type: "source", snippet: description });
          pattern.lastIndex = 0;
          break;
        }
        pattern.lastIndex = 0;
      }
      if (usesCron) break;
    }
  }

  // Check Vercel cron config
  const vercelJson = files.get("vercel.json");
  if (vercelJson) {
    try {
      const config = JSON.parse(vercelJson) as Record<string, unknown>;
      if (config.crons) {
        usesCron = true;
        evidence.push({
          file: "vercel.json",
          type: "config",
          snippet: "Vercel cron configuration",
        });
      }
    } catch {
      // Invalid JSON
    }
  }

  return {
    usesCron,
    evidence,
  };
}
