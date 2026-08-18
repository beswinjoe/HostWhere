import type { ProjectFiles, DetectorResult, MonorepoInfo, Evidence } from "../types";

export function monorepoDetector(files: ProjectFiles): DetectorResult {
  const evidence: Evidence[] = [];
  let monorepo: MonorepoInfo | null = null;

  const pkgContent = files.get("package.json");
  if (pkgContent) {
    try {
      const pkg = JSON.parse(pkgContent) as Record<string, unknown>;

      // npm/yarn workspaces
      if (pkg.workspaces) {
        const workspaces = Array.isArray(pkg.workspaces)
          ? (pkg.workspaces as string[])
          : ((pkg.workspaces as { packages?: string[] }).packages || []);

        monorepo = {
          type: "npm-workspaces",
          packages: workspaces,
        };
        evidence.push({
          file: "package.json",
          type: "config",
          snippet: `Workspaces: ${workspaces.join(", ")}`,
        });
      }
    } catch {
      // Invalid JSON
    }
  }

  // pnpm workspaces
  if (files.has("pnpm-workspace.yaml")) {
    const content = files.get("pnpm-workspace.yaml")!;
    const packages: string[] = [];
    const lines = content.split("\n");
    for (const line of lines) {
      const match = line.match(/^\s*-\s+['"]?([^'"]+)['"]?/);
      if (match) packages.push(match[1]);
    }
    monorepo = { type: "pnpm-workspaces", packages };
    evidence.push({
      file: "pnpm-workspace.yaml",
      type: "config",
      snippet: `pnpm workspaces: ${packages.join(", ")}`,
    });
  }

  // Turborepo
  if (files.has("turbo.json")) {
    if (monorepo) {
      monorepo.type = "turborepo";
    } else {
      monorepo = { type: "turborepo", packages: [] };
    }
    evidence.push({
      file: "turbo.json",
      type: "config",
      snippet: "Turborepo configuration detected",
    });
  }

  // Nx
  if (files.has("nx.json")) {
    if (monorepo) {
      monorepo.type = "nx";
    } else {
      monorepo = { type: "nx", packages: [] };
    }
    evidence.push({
      file: "nx.json",
      type: "config",
      snippet: "Nx workspace detected",
    });
  }

  // Lerna
  if (files.has("lerna.json")) {
    if (monorepo) {
      monorepo.type = "lerna";
    } else {
      monorepo = { type: "lerna", packages: [] };
    }
    evidence.push({
      file: "lerna.json",
      type: "config",
      snippet: "Lerna monorepo detected",
    });
  }

  return {
    monorepo,
    evidence,
  };
}
