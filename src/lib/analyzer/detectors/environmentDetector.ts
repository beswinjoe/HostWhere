import type { ProjectFiles, DetectorResult, Evidence } from "../types";

export function environmentDetector(files: ProjectFiles): DetectorResult {
  const evidence: Evidence[] = [];
  const envVars = new Set<string>();

  // Check .env.example, .env.sample, .env.template
  const envFiles = [".env.example", ".env.sample", ".env.template", ".env.local.example"];
  for (const envFile of envFiles) {
    const content = files.get(envFile);
    if (content) {
      const lines = content.split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
          const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)\s*=/);
          if (match) {
            envVars.add(match[1]);
          }
        }
      }
      if (envVars.size > 0) {
        evidence.push({
          file: envFile,
          type: "config",
          snippet: `${envVars.size} environment variables defined`,
        });
      }
    }
  }

  // Scan source code for process.env references
  let filesChecked = 0;
  for (const [path, content] of files.entries()) {
    if (filesChecked > 200) break;
    if (!path.endsWith(".ts") && !path.endsWith(".tsx") && !path.endsWith(".js") && !path.endsWith(".jsx")) continue;
    if (path.includes("node_modules") || path.includes("dist/") || path.includes(".next/")) continue;
    filesChecked++;

    const envMatches = content.matchAll(/process\.env\.([A-Z_][A-Z0-9_]*)/g);
    for (const match of envMatches) {
      envVars.add(match[1]);
    }

    // Also check for import.meta.env (Vite)
    const metaEnvMatches = content.matchAll(/import\.meta\.env\.([A-Z_][A-Z0-9_]*)/g);
    for (const match of metaEnvMatches) {
      envVars.add(match[1]);
    }
  }

  // Check Python os.environ / os.getenv
  for (const [path, content] of files.entries()) {
    if (!path.endsWith(".py")) continue;
    if (path.includes("venv/") || path.includes(".venv/")) continue;

    const osEnvMatches = content.matchAll(/os\.(?:environ|getenv)\s*(?:\[|\.get\s*\(\s*)['"]([A-Z_][A-Z0-9_]*)['"]/g);
    for (const match of osEnvMatches) {
      envVars.add(match[1]);
    }
  }

  return {
    environmentVariables: [...envVars],
    evidence,
  };
}
