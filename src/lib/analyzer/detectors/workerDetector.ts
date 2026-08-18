import type { ProjectFiles, DetectorResult, Evidence } from "../types";

const WORKER_DEPENDENCIES = [
  "bull", "bullmq", "bee-queue", "agenda", "kue",
  "node-resque", "faktory_worker_node",
  "celery", "rq", "huey", "dramatiq",
  "sidekiq", "delayed_job", "resque",
  "worker_threads",
];

const WORKER_SOURCE_PATTERNS = [
  { pattern: /new\s+Worker\s*\(/g, description: "Worker thread creation" },
  { pattern: /worker_threads/g, description: "Node.js worker_threads module" },
  { pattern: /Bull\s*\(|BullMQ|new\s+Queue\s*\(/g, description: "Bull/BullMQ queue" },
  { pattern: /celery|Celery/g, description: "Celery task queue" },
  { pattern: /\.process\s*\(\s*['"].*['"]\s*,/g, description: "Queue job processor" },
  { pattern: /cluster\.fork/g, description: "Node.js cluster fork" },
  { pattern: /child_process|exec\s*\(|spawn\s*\(/g, description: "Child process usage" },
];

export function workerDetector(files: ProjectFiles): DetectorResult {
  const evidence: Evidence[] = [];
  let usesWorkers = false;

  // Check dependencies
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
          usesWorkers = true;
          evidence.push({
            file: "package.json",
            type: "dependency",
            snippet: `Worker/queue dependency: ${dep}`,
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
    const pyWorkerDeps = ["celery", "rq", "huey", "dramatiq", "arq"];
    for (const dep of pyWorkerDeps) {
      if (requirementsTxt.toLowerCase().includes(dep.toLowerCase())) {
        usesWorkers = true;
        evidence.push({
          file: "requirements.txt",
          type: "dependency",
          snippet: `Worker dependency: ${dep}`,
        });
      }
    }
  }

  // Check source code
  if (!usesWorkers) {
    let filesChecked = 0;
    for (const [path, content] of files.entries()) {
      if (filesChecked > 200) break;
      if (!path.endsWith(".ts") && !path.endsWith(".tsx") && !path.endsWith(".js") && !path.endsWith(".jsx") && !path.endsWith(".py")) continue;
      if (path.includes("node_modules") || path.includes("dist/")) continue;
      filesChecked++;

      for (const { pattern, description } of WORKER_SOURCE_PATTERNS) {
        if (pattern.test(content)) {
          usesWorkers = true;
          evidence.push({ file: path, type: "source", snippet: description });
          pattern.lastIndex = 0;
          break;
        }
        pattern.lastIndex = 0;
      }
      if (usesWorkers) break;
    }
  }

  return {
    usesWorkers,
    evidence,
  };
}
