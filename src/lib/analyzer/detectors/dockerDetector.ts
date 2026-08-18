import type { ProjectFiles, DetectorResult, Evidence } from "../types";

export function dockerDetector(files: ProjectFiles): DetectorResult {
  const evidence: Evidence[] = [];
  let usesDocker = false;

  const dockerFiles = [
    "Dockerfile",
    "dockerfile",
    "Dockerfile.dev",
    "Dockerfile.prod",
    "Dockerfile.production",
    "docker-compose.yml",
    "docker-compose.yaml",
    "compose.yml",
    "compose.yaml",
    ".dockerignore",
  ];

  for (const df of dockerFiles) {
    if (files.has(df)) {
      usesDocker = true;
      const content = files.get(df) || "";
      let snippet = `Docker file detected: ${df}`;
      
      if (df.toLowerCase() === "dockerfile") {
        const exposeMatch = content.match(/EXPOSE\s+(\d+)/i);
        if (exposeMatch) {
          snippet += ` (Exposes port ${exposeMatch[1]})`;
        }
      }

      evidence.push({
        file: df,
        type: "file-presence",
        snippet,
      });
    }
  }

  // Check for nested Dockerfiles
  for (const path of files.keys()) {
    if (path.endsWith("/Dockerfile") || path.endsWith("/dockerfile")) {
      if (!evidence.some(e => e.file === path)) {
        usesDocker = true;
        evidence.push({
          file: path,
          type: "file-presence",
          snippet: "Nested Dockerfile detected",
        });
      }
    }
  }

  // Check for Procfile (Heroku-style, indicates container/process management)
  if (files.has("Procfile")) {
    evidence.push({
      file: "Procfile",
      type: "config",
      snippet: "Procfile detected (Heroku-style process management)",
    });
  }

  // Check for nixpacks.toml or railway.toml
  if (files.has("nixpacks.toml")) {
    evidence.push({
      file: "nixpacks.toml",
      type: "config",
      snippet: "Nixpacks configuration detected",
    });
  }
  if (files.has("railway.toml")) {
    evidence.push({
      file: "railway.toml",
      type: "config",
      snippet: "Railway configuration detected",
    });
  }

  return {
    usesDocker,
    evidence,
  };
}
