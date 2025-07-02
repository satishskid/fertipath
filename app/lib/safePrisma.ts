import { PrismaClient } from "@prisma/client";

// Check if we're in build time
const isBuildTime =
  process.env.NODE_ENV === "production" &&
  !process.env.VERCEL_URL &&
  !process.env.DATABASE_URL;
const isServerless = typeof window === "undefined";

// Declare global variable for Prisma client
declare global {
  var __prisma: PrismaClient | undefined;
}

// Create a function to initialize Prisma client with proper error handling
function createPrismaClient(): PrismaClient | null {
  // Return null during build time to prevent initialization
  if (isBuildTime) {
    console.log("Skipping Prisma initialization during build time");
    return null;
  }

  try {
    return new PrismaClient({
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "error", "warn"]
          : ["error"],
      // Add connection pool settings for serverless
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  } catch (error) {
    console.error("Failed to initialize Prisma client:", error);
    return null;
  }
}

// Safe Prisma client that handles build-time scenarios
export const safePrisma = (() => {
  if (isBuildTime) {
    return null;
  }

  if (globalThis.__prisma) {
    return globalThis.__prisma;
  }

  return createPrismaClient();
})();

// Only cache in development to prevent memory leaks in production
if (process.env.NODE_ENV !== "production" && safePrisma) {
  globalThis.__prisma = safePrisma;
}

// Graceful shutdown handler
if (typeof process !== "undefined" && safePrisma) {
  process.on("beforeExit", async () => {
    await safePrisma.$disconnect();
  });
}

// Helper function to check if database operations are safe
export function isDatabaseAvailable(): boolean {
  return safePrisma !== null && !isBuildTime;
}

// Safe database operation wrapper
export async function safeDbOperation<T>(
  operation: (prisma: PrismaClient) => Promise<T>,
  fallback: T
): Promise<T> {
  if (!isDatabaseAvailable() || !safePrisma) {
    console.log("Database not available, returning fallback value");
    return fallback;
  }

  try {
    return await operation(safePrisma);
  } catch (error) {
    console.error("Database operation failed:", error);
    return fallback;
  }
}
