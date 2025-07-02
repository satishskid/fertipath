import { PrismaClient } from '@prisma/client'

// Alternative approach: Direct instantiation with connection management
// Use this if the global singleton approach still causes issues

let prismaInstance: PrismaClient | null = null

export function getPrismaClient(): PrismaClient {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    })
  }
  return prismaInstance
}

// Export as default for easy switching
export const prisma = getPrismaClient()

// Cleanup function for serverless environments
export async function disconnectPrisma() {
  if (prismaInstance) {
    await prismaInstance.$disconnect()
    prismaInstance = null
  }
}
