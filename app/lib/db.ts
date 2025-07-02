import { PrismaClient } from '@prisma/client'

// Declare global variable for Prisma client
declare global {
  var __prisma: PrismaClient | undefined
}

// Create a function to initialize Prisma client with proper error handling
function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    // Add connection pool settings for serverless
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })
}

// Use global variable to prevent multiple instances in serverless environment
export const prisma = globalThis.__prisma ?? createPrismaClient()

// Only cache in development to prevent memory leaks in production
if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}

// Graceful shutdown handler
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
  })
}
