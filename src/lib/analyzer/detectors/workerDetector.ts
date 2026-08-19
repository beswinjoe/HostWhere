import type { ProjectFiles, DetectorResult, Evidence } from "../types";

// Strong dependencies indicating a background task queue or worker
const WORKER_DEPENDENCIES = [
  "bull", "bullmq", "bee-queue", "agenda", "kue",
  "node-resque", "faktory_worker_node",
  "celery", "rq", "huey", "dramatiq",
  "sidekiq", "delayed_job", "resque",
];

// High-confidence patterns indicating a background worker processor (Not generic Web Workers)
const WORKER_SOURCE_PATTERNS = [
  { pattern: /Bull\s*\(|BullMQ|new\s+Queue\s*\(/g, description: "Bull/BullMQ queue" },
  { pattern: /celery|Celery/g, description: "Celery task queue" },
  { pattern: /\.process\s*\(\s*['"].*['"]\s*,/g, description: "Queue job processor" },
];

export function workerDetector(files: ProjectFiles): DetectorResult {
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

      for (const dep of WORKER_DEPENDENCIES) {
        if (allDeps.includes(dep)) {
          totalConfidence += 50; // Medium confidence
          evidence.push({
            file: "package.json",
            type: "dependency",
            snippet: `Worker/queue dependency: ${dep}`,
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
    const pyWorkerDeps = ["celery", "rq", "huey", "dramatiq", "arq"];
    for (const dep of pyWorkerDeps) {
      const regex = new RegExp(`^${dep}(?:[>=<~].*)?$`, "im");
      if (regex.test(requirementsTxt)) {
        totalConfidence += 50;
        evidence.push({
          file: "requirements.txt",
          type: "dependency",
          snippet: `Worker dependency: ${dep}`,
          confidence: 50,
        });
      }
    }
  }

  // 3. Check for specific Procfile workers
  const procfile = files.get("Procfile");
  if (procfile && /^worker:/im.test(procfile)) {
    totalConfidence += 90; // High confidence
    evidence.push({
      file: "Procfile",
      type: "config",
      snippet: "Explicit worker process defined in Procfile",
      confidence: 90,
    });
  }

  // 4. Check source code
  let sourceConfidenceAdded = false;
  for (const [path, content] of files.entries()) {
    if (path.match(/\.(md|mdx|txt|json|yaml|yml|toml|html|css|scss|less)$/i)) continue;
    
    for (const { pattern, description } of WORKER_SOURCE_PATTERNS) {
      if (pattern.test(content)) {
        if (!sourceConfidenceAdded) {
          totalConfidence += 40;
          sourceConfidenceAdded = true;
        }
        evidence.push({ file: path, type: "source", snippet: description, confidence: 40 });
        pattern.lastIndex = 0;
        break;
      }
      pattern.lastIndex = 0;
    }
  }

  return {
    usesWorkers: totalConfidence >= 80,
    evidence,
  };
}
