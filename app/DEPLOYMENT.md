# Deployment Guide for FertiPath

## Vercel Deployment Instructions

### Prerequisites

- Vercel account
- PostgreSQL database (Vercel Postgres recommended)
- Environment variables configured

### Step 1: Connect to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Select the `app` directory as the root directory

### Step 2: Configure Environment Variables

In your Vercel project settings, add these environment variables:

```env
# Required
DATABASE_URL="postgresql://username:password@host:port/database"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="https://your-domain.vercel.app"

# Optional
NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"
NEXT_PUBLIC_APP_NAME="Fertility Pathway Planner"
OPENAI_API_KEY="your-openai-key"
```

### Step 3: Database Setup

1. Use Vercel Postgres or external PostgreSQL service
2. Run database migrations:
   ```bash
   npx prisma db push
   # or
   npx prisma migrate deploy
   ```

### Step 4: Build Configuration

The project is configured to use npm only. Vercel will automatically:

- Use `npm install` for dependencies
- Use `npm run build` for building
- Use `npm start` for starting the application

### Step 5: Deploy

1. Push your changes to GitHub
2. Vercel will automatically deploy
3. Check the deployment logs for any issues

## Common Deployment Issues & Solutions

### Issue 1: Prisma Build Errors

**Solution**: The project includes `safePrisma.ts` which handles build-time scenarios properly.

### Issue 2: Environment Variables Missing

**Solution**: Ensure all required environment variables are set in Vercel dashboard.

### Issue 3: Database Connection Issues

**Solution**:

- Verify DATABASE_URL is correct
- Ensure database is accessible from Vercel's servers
- Check if database requires SSL connections

### Issue 4: Build Timeout

**Solution**: The `vercel.json` configuration includes extended function timeouts.

## Package Manager: npm Only

This project has been configured to use npm exclusively:

- ✅ `package-lock.json` included
- ❌ `yarn.lock` removed
- ❌ `.yarnrc.yml` removed
- ❌ `.yarn/` directory removed

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Troubleshooting

### If build fails on Vercel:

1. Check the build logs in Vercel dashboard
2. Ensure all dependencies are in `package.json`
3. Verify TypeScript compilation passes locally
4. Check environment variables are properly set

### If database operations fail:

1. Verify DATABASE_URL is correct
2. Check database connectivity
3. Ensure Prisma schema is up to date
4. Run `npx prisma generate` locally and commit changes

### If API routes return errors:

1. Check function timeout settings in `vercel.json`
2. Verify API route handlers are properly exported
3. Check for any missing dependencies
