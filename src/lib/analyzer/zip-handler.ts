import JSZip from "jszip";
import { ProjectFiles } from "./types";

const MAX_FILES = 10000;
const MAX_UNCOMPRESSED_SIZE = 100 * 1024 * 1024; // 100MB

// Files we don't need to analyze to save memory
const IGNORED_PATHS = [
  "node_modules/",
  ".git/",
  "dist/",
  "build/",
  ".next/",
  "out/",
  ".cache/",
  "__pycache__/",
  "venv/",
  ".venv/",
  "vendor/",
  "public/images/",
  "public/assets/",
  ".DS_Store",
];

// Extensions we don't need to read (binary files or irrelevant)
const IGNORED_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".ico", ".svg", ".webp",
  ".mp4", ".mp3", ".wav", ".ogg",
  ".pdf", ".zip", ".tar", ".gz", ".rar",
  ".woff", ".woff2", ".ttf", ".eot",
  ".exe", ".dll", ".so", ".dylib",
  ".pyc", ".class", ".o", ".obj",
]);

export async function extractZipSafely(buffer: Buffer): Promise<ProjectFiles> {
  const files: ProjectFiles = new Map();
  let totalSize = 0;
  let fileCount = 0;

  const zip = await JSZip.loadAsync(buffer);

  // First pass: validation
  zip.forEach((relativePath, zipEntry) => {
    if (zipEntry.dir) return;
    
    // Normalize path and check for path traversal
    if (relativePath.includes("../") || relativePath.includes("..\\")) {
      throw new Error(`Invalid path in zip: ${relativePath}`);
    }

    fileCount++;
  });

  if (fileCount > MAX_FILES) {
    throw new Error(`Archive contains too many files (max ${MAX_FILES})`);
  }

  // Second pass: extraction
  const extractionPromises: Promise<void>[] = [];

  zip.forEach((relativePath, zipEntry) => {
    if (zipEntry.dir) return;

    // Check if we should ignore this file
    const shouldIgnore = IGNORED_PATHS.some(p => relativePath.includes(p)) ||
                         IGNORED_EXTENSIONS.has(relativePath.substring(relativePath.lastIndexOf(".")).toLowerCase());

    if (shouldIgnore) return;

    extractionPromises.push(
      zipEntry.async("string").then(content => {
        totalSize += content.length;
        if (totalSize > MAX_UNCOMPRESSED_SIZE) {
          throw new Error("Uncompressed size exceeds limit");
        }
        
        // Use normalized paths without a leading slash or dot
        const normalizedPath = relativePath.replace(/^(\.\/|\/)/, "");
        files.set(normalizedPath, content);
      })
    );
  });

  await Promise.all(extractionPromises);
  
  return files;
}
