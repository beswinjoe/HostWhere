import JSZip from "jszip";
import { ProjectFiles } from "./types";

const MAX_FILES = 10000;
const MAX_UNCOMPRESSED_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_COMPRESSION_RATIO = 100; // Uncompressed size shouldn't be 100x the compressed size
const BATCH_SIZE = 50; // Extract 50 files at a time to prevent memory spikes

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

/**
 * Normalizes and sanitizes a file path.
 * Throws an error if path traversal is detected.
 */
function sanitizePath(relativePath: string): string {
  // Check for path traversal attempts
  if (
    relativePath.includes("../") || 
    relativePath.includes("..\\") || 
    relativePath.startsWith("/") ||
    relativePath.startsWith("\\")
  ) {
    throw new Error(`Invalid path in zip: Path traversal detected`);
  }

  // Use normalized paths without a leading slash or dot
  return relativePath.replace(/^(\.\/|\/)/, "");
}

/**
 * Helper to process promises in batches
 */
async function processInBatches<T>(items: T[], batchSize: number, processor: (item: T) => Promise<void>) {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await Promise.all(batch.map(processor));
  }
}

export async function extractZipSafely(buffer: Buffer): Promise<ProjectFiles> {
  const files: ProjectFiles = new Map();
  let totalSize = 0;
  let fileCount = 0;
  const compressedArchiveSize = buffer.length;

  const zip = await JSZip.loadAsync(buffer);

  const entriesToProcess: { path: string; entry: JSZip.JSZipObject }[] = [];

  // First pass: validation and filtering
  zip.forEach((relativePath, zipEntry) => {
    if (zipEntry.dir) return;

    // Fast fail for traversal
    sanitizePath(relativePath);

    fileCount++;

    if (fileCount > MAX_FILES) {
      throw new Error(`Archive contains too many files (max ${MAX_FILES}).`);
    }

    // Check if we should ignore this file
    const shouldIgnore = IGNORED_PATHS.some(p => relativePath.includes(p)) ||
                         IGNORED_EXTENSIONS.has(relativePath.substring(relativePath.lastIndexOf(".")).toLowerCase());

    if (!shouldIgnore) {
      entriesToProcess.push({ path: relativePath, entry: zipEntry });
    }
  });

  // Second pass: extraction in controlled batches
  await processInBatches(entriesToProcess, BATCH_SIZE, async ({ path, entry }) => {
    const content = await entry.async("string");
    
    totalSize += content.length;
    
    // Limits checks
    if (totalSize > MAX_UNCOMPRESSED_SIZE) {
      throw new Error(`Uncompressed size exceeds limit (${MAX_UNCOMPRESSED_SIZE / 1024 / 1024}MB).`);
    }

    // ZIP Bomb detection (only check ratio if we've extracted > 5MB to avoid noise on tiny files)
    if (totalSize > 5 * 1024 * 1024 && totalSize > compressedArchiveSize * MAX_COMPRESSION_RATIO) {
      throw new Error("Suspicious compression ratio detected. Potential ZIP bomb.");
    }

    const normalizedPath = sanitizePath(path);
    files.set(normalizedPath, content);
  });
  
  return files;
}

/**
 * Sanitizes project names extracted from filenames
 * Only allows alphanumeric, dashes, and underscores.
 */
export function sanitizeProjectName(filename: string): string {
  const base = filename.replace(/\.zip$/i, "");
  return base.replace(/[^a-zA-Z0-9-_]/g, "_").substring(0, 50); // limit length
}
