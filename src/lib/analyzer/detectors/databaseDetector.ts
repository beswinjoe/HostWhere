import type { ProjectFiles, DetectorResult, Database, Evidence } from "../types";

/** Dependency-to-database mapping */
const DB_DEPENDENCY_MAP: Record<string, Database> = {
  // PostgreSQL
  pg: "postgresql",
  postgres: "postgresql",
  "pg-pool": "postgresql",
  "@prisma/client": "postgresql", // Default, but could be others
  sequelize: "postgresql",
  typeorm: "postgresql",
  knex: "postgresql",
  drizzle: "postgresql",
  "drizzle-orm": "postgresql",
  psycopg2: "postgresql",
  "psycopg2-binary": "postgresql",
  asyncpg: "postgresql",
  sqlalchemy: "postgresql",

  // MySQL
  mysql: "mysql",
  mysql2: "mysql",
  mysqlclient: "mysql",
  "PyMySQL": "mysql",

  // MongoDB
  mongoose: "mongodb",
  mongodb: "mongodb",
  mongoid: "mongodb",
  pymongo: "mongodb",
  "motor": "mongodb",

  // Redis
  redis: "redis",
  ioredis: "redis",
  "redis-py": "redis",
  bullmq: "redis",
  bull: "redis",

  // SQLite
  "better-sqlite3": "sqlite",
  sqlite3: "sqlite",
  "sql.js": "sqlite",

  // Supabase
  "@supabase/supabase-js": "supabase",

  // Firebase
  firebase: "firebase",
  "firebase-admin": "firebase",
  "@firebase/firestore": "firebase",

  // PlanetScale
  "@planetscale/database": "planetscale",
};

/** Source code patterns indicating database usage */
const DB_SOURCE_PATTERNS: Array<{ pattern: RegExp; database: Database; description: string }> = [
  { pattern: /DATABASE_URL|POSTGRES|PG_/i, database: "postgresql", description: "PostgreSQL connection reference" },
  { pattern: /MONGODB_URI|MONGO_URL/i, database: "mongodb", description: "MongoDB connection reference" },
  { pattern: /REDIS_URL|REDIS_HOST/i, database: "redis", description: "Redis connection reference" },
  { pattern: /MYSQL_HOST|MYSQL_URL/i, database: "mysql", description: "MySQL connection reference" },
];

/** Prisma schema database detection */
function detectPrismaDatabase(files: ProjectFiles): { database: Database; evidence: Evidence } | null {
  const schemaPath = "prisma/schema.prisma";
  const schema = files.get(schemaPath);
  if (!schema) return null;

  if (schema.includes('provider = "postgresql"') || schema.includes('provider = "postgres"')) {
    return { database: "postgresql", evidence: { file: schemaPath, type: "config", snippet: 'Prisma provider: postgresql' } };
  }
  if (schema.includes('provider = "mysql"')) {
    return { database: "mysql", evidence: { file: schemaPath, type: "config", snippet: 'Prisma provider: mysql' } };
  }
  if (schema.includes('provider = "mongodb"')) {
    return { database: "mongodb", evidence: { file: schemaPath, type: "config", snippet: 'Prisma provider: mongodb' } };
  }
  if (schema.includes('provider = "sqlite"')) {
    return { database: "sqlite", evidence: { file: schemaPath, type: "config", snippet: 'Prisma provider: sqlite' } };
  }

  return null;
}

export function databaseDetector(files: ProjectFiles): DetectorResult {
  const evidence: Evidence[] = [];
  const databases = new Set<Database>();

  // Check Prisma schema first (most specific)
  const prismaResult = detectPrismaDatabase(files);
  if (prismaResult) {
    databases.add(prismaResult.database);
    evidence.push(prismaResult.evidence);
  }

  // Check package.json / requirements.txt dependencies
  const pkgContent = files.get("package.json");
  if (pkgContent) {
    try {
      const pkg = JSON.parse(pkgContent) as Record<string, unknown>;
      const deps = {
        ...((pkg.dependencies || {}) as Record<string, string>),
        ...((pkg.devDependencies || {}) as Record<string, string>),
      };

      for (const depName of Object.keys(deps)) {
        if (DB_DEPENDENCY_MAP[depName]) {
          const db = DB_DEPENDENCY_MAP[depName];
          if (!databases.has(db)) {
            databases.add(db);
            evidence.push({
              file: "package.json",
              type: "dependency",
              snippet: `${depName} → ${db}`,
            });
          }
        }
      }
    } catch {
      // Invalid JSON
    }
  }

  // Check Python dependencies
  const requirementsTxt = files.get("requirements.txt");
  if (requirementsTxt) {
    for (const [depName, db] of Object.entries(DB_DEPENDENCY_MAP)) {
      if (requirementsTxt.toLowerCase().includes(depName.toLowerCase())) {
        if (!databases.has(db)) {
          databases.add(db);
          evidence.push({
            file: "requirements.txt",
            type: "dependency",
            snippet: `${depName} → ${db}`,
          });
        }
      }
    }
  }

  // Check docker-compose for database services
  const dockerCompose = files.get("docker-compose.yml") || files.get("docker-compose.yaml") || files.get("compose.yml") || files.get("compose.yaml");
  if (dockerCompose) {
    if (dockerCompose.includes("postgres") || dockerCompose.includes("postgresql")) {
      databases.add("postgresql");
      evidence.push({ file: "docker-compose.yml", type: "config", snippet: "PostgreSQL service in docker-compose" });
    }
    if (dockerCompose.includes("mongo")) {
      databases.add("mongodb");
      evidence.push({ file: "docker-compose.yml", type: "config", snippet: "MongoDB service in docker-compose" });
    }
    if (dockerCompose.includes("redis")) {
      databases.add("redis");
      evidence.push({ file: "docker-compose.yml", type: "config", snippet: "Redis service in docker-compose" });
    }
    if (dockerCompose.includes("mysql") || dockerCompose.includes("mariadb")) {
      databases.add("mysql");
      evidence.push({ file: "docker-compose.yml", type: "config", snippet: "MySQL service in docker-compose" });
    }
  }

  // Check .env.example for database references
  const envExample = files.get(".env.example") || files.get(".env.sample") || files.get(".env.template");
  if (envExample) {
    for (const { pattern, database, description } of DB_SOURCE_PATTERNS) {
      if (pattern.test(envExample)) {
        if (!databases.has(database)) {
          databases.add(database);
          evidence.push({
            file: ".env.example",
            type: "config",
            snippet: description,
          });
        }
      }
    }
  }

  return {
    databases: [...databases],
    evidence,
  };
}
