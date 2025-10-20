---
phase: deployment
title: Deployment Strategy
description: Define deployment process, infrastructure, and release procedures
---

# Deployment Strategy - AIStyleHub

## Infrastructure

### Hosting Platform
**Vercel** (Primary choice)
- **Why:** Optimized for Next.js, free tier, automatic scaling, edge functions
- **Alternatives:** Netlify, Railway, AWS Amplify

### Infrastructure Components

```mermaid
graph TD
    Users[Users] -->|HTTPS| Vercel[Vercel Edge Network]
    Vercel -->|Next.js App| App[Application Server]
    App -->|Read/Write| DB[(PostgreSQL Database)]
    App -->|API Calls| OpenAI[OpenAI API]
    App -->|Store Images| Storage[File Storage /uploads]
    
    Vercel -->|CDN| CDN[Static Assets]
    
    subgraph Monitoring
        App -->|Logs| Logs[Log Aggregation]
        App -->|Metrics| Metrics[Metrics Dashboard]
        App -->|Errors| Errors[Error Tracking]
    end
```

### Environment Separation

| Environment | Purpose | Database | Domain |
|------------|---------|----------|--------|
| **Development** | Local development | SQLite | localhost:3000 |
| **Staging** | Testing & QA | PostgreSQL (Neon) | staging.aistylehub.vercel.app |
| **Production** | Live user traffic | PostgreSQL (Neon) | aistylehub.com |

## Deployment Pipeline

### CI/CD Workflow

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant Git as GitHub
    participant Vercel as Vercel
    participant DB as Database
    participant Monitor as Monitoring

    Dev->>Git: Push to branch
    Git->>Vercel: Trigger webhook
    Vercel->>Vercel: Run build
    Vercel->>Vercel: Run tests
    alt Tests pass
        Vercel->>Vercel: Deploy preview
        Vercel-->>Dev: Preview URL
        Dev->>Dev: Test preview
        Dev->>Git: Merge to main
        Git->>Vercel: Trigger production deploy
        Vercel->>DB: Run migrations
        Vercel->>Vercel: Deploy to production
        Vercel->>Monitor: Send deployment event
        Vercel-->>Dev: Production URL
    else Tests fail
        Vercel-->>Dev: Build failed notification
    end
```

### Build Process

**Build Command:**
```bash
npm run build
```

**Build Steps:**
1. Install dependencies (`npm ci`)
2. Run TypeScript compilation
3. Run linting (`npm run lint`)
4. Run tests (`npm run test`)
5. Build Next.js application
6. Optimize images and assets
7. Generate static pages
8. Create production bundle

### Build Configuration

**next.config.ts:**
```typescript
const nextConfig = {
  output: 'standalone', // For Docker/self-hosting if needed
  images: {
    domains: ['oaidalleapiprodscus.blob.core.windows.net'], // OpenAI image domains
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    serverActions: true,
  },
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
};
```

**Build Optimization:**
- Enable compression
- Tree-shaking unused code
- Code splitting by route
- Image optimization
- Font optimization

## Environment Configuration

### Development Environment

**Setup:**
```bash
# Clone repository
git clone https://github.com/yourusername/aistylehub.git
cd aistylehub

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local

# Initialize database
npx prisma generate
npx prisma db push
npx prisma db seed

# Start development server
npm run dev
```

**.env.local:**
```env
# Database
DATABASE_URL="file:./prisma/dev.db"

# OpenAI
OPENAI_API_KEY="sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### Staging Environment

**Setup:**
```bash
# Create staging branch
git checkout -b staging

# Push to trigger deployment
git push origin staging
```

**Vercel Configuration:**
```json
{
  "name": "aistylehub-staging",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm ci",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
```

**Environment Variables (Vercel Dashboard):**
```env
DATABASE_URL="postgresql://user:password@db.neon.tech/staging"
OPENAI_API_KEY="sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
NEXT_PUBLIC_APP_URL="https://staging.aistylehub.vercel.app"
NODE_ENV="production"
```

### Production Environment

**Vercel Project Settings:**
- **Framework:** Next.js
- **Root Directory:** `/`
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm ci`
- **Node Version:** 18.x

**Environment Variables:**
```env
DATABASE_URL="postgresql://user:password@db.neon.tech/production"
OPENAI_API_KEY="sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
NEXT_PUBLIC_APP_URL="https://aistylehub.com"
NODE_ENV="production"
```

**Domain Configuration:**
- Add custom domain in Vercel dashboard
- Configure DNS records:
  ```
  A     @     76.76.21.21
  CNAME www   cname.vercel-dns.com
  ```
- SSL certificate auto-provisioned by Vercel

## Deployment Steps

### Initial Deployment

#### 1. Pre-Deployment Checklist

- [ ] All tests passing (`npm run test`)
- [ ] Linting passing (`npm run lint`)
- [ ] Build succeeds locally (`npm run build`)
- [ ] Environment variables documented
- [ ] Database migrations ready
- [ ] Mock data/seed script ready
- [ ] OpenAI API key has sufficient credits
- [ ] Code reviewed and approved

#### 2. Database Setup

**Create Neon Database:**
```bash
# Sign up at https://neon.tech
# Create new project "aistylehub-production"
# Copy connection string
```

**Run Migrations:**
```bash
# Set DATABASE_URL to Neon connection string
export DATABASE_URL="postgresql://user:password@db.neon.tech/production"

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed database
npx prisma db seed
```

**Verify Database:**
```bash
# Open Prisma Studio
npx prisma studio

# Check tables exist
# Verify seed data loaded
```

#### 3. Vercel Deployment

**Via CLI:**
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Follow prompts:
# Set up and deploy "aistylehub"? Y
# Which scope? [your-team]
# Link to existing project? N
# What's your project's name? aistylehub
# In which directory is your code located? ./
```

**Via GitHub Integration:**
1. Go to https://vercel.com/new
2. Import Git Repository
3. Select your GitHub repo
4. Configure project:
   - Framework Preset: Next.js
   - Root Directory: `/`
   - Build Command: `npm run build`
5. Add environment variables
6. Click "Deploy"

#### 4. Post-Deployment Validation

- [ ] Homepage loads (`https://aistylehub.com`)
- [ ] Health check passes (`/api/health`)
- [ ] Try-on feature works
- [ ] Recommend feature works
- [ ] Image edit feature works
- [ ] Products page loads
- [ ] All images display correctly
- [ ] No console errors
- [ ] SSL certificate active
- [ ] Performance acceptable (< 3s load time)

### Subsequent Deployments

**Automatic (Recommended):**
```bash
# Make changes
git add .
git commit -m "feat: add new feature"
git push origin main

# Vercel auto-deploys on push to main
```

**Manual:**
```bash
# Deploy specific branch
vercel --prod

# Or deploy from GitHub Actions
# See .github/workflows/deploy.yml
```

### Rollback Procedure

**Via Vercel Dashboard:**
1. Go to project deployments
2. Find last working deployment
3. Click "..." menu → "Promote to Production"
4. Confirm rollback

**Via Vercel CLI:**
```bash
# List deployments
vercel ls

# Rollback to specific deployment
vercel promote <deployment-url> --prod
```

**Emergency Rollback:**
1. Navigate to Vercel dashboard
2. Select previous deployment
3. Promote to production
4. Verify rollback successful
5. Investigate issue in staging
6. Fix and redeploy

## Database Migrations

### Migration Strategy

**Development:**
```bash
# Create migration
npx prisma migrate dev --name add_user_table

# Apply migration
npx prisma migrate dev

# Reset database (careful!)
npx prisma migrate reset
```

**Production:**
```bash
# Review migration
npx prisma migrate diff --from-url $DATABASE_URL --to-schema-datamodel prisma/schema.prisma

# Deploy migration
npx prisma migrate deploy

# Verify migration
npx prisma studio
```

### Backup Procedures

**Before Each Migration:**
```bash
# Neon automatic backups (point-in-time recovery)
# Manual backup:
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d-%H%M%S).sql
```

**Restore from Backup:**
```bash
# From Neon dashboard:
# 1. Go to Branches
# 2. Create branch from backup point
# 3. Test branch
# 4. Promote to main if needed

# Or manual restore:
psql $DATABASE_URL < backup-20241020-120000.sql
```

### Migration Best Practices

1. **Test in staging first**
2. **Use transactions** (default in Prisma)
3. **Backup before migration**
4. **Document breaking changes**
5. **Plan for rollback**
6. **Monitor after deployment**

## Secrets Management

### Environment Variables

**Never commit:**
- API keys (OpenAI, database, etc.)
- Connection strings
- Secrets or tokens
- Private keys

**Storage:**
- **Local:** `.env.local` (gitignored)
- **Vercel:** Environment Variables in dashboard
- **Alternative:** Vault, AWS Secrets Manager

### Adding Secrets

**Vercel Dashboard:**
1. Project Settings → Environment Variables
2. Add variable:
   - Name: `OPENAI_API_KEY`
   - Value: `sk-proj-xxxxx`
   - Environments: Production, Preview, Development
3. Click "Save"
4. Redeploy to apply

**Vercel CLI:**
```bash
# Add secret
vercel env add OPENAI_API_KEY

# Pull secrets to local
vercel env pull .env.local

# Remove secret
vercel env rm OPENAI_API_KEY
```

### Key Rotation

**Rotation Schedule:**
- OpenAI API key: Every 6 months
- Database password: Every 3 months
- Custom API keys: Every 6 months

**Rotation Process:**
1. Generate new key
2. Add to Vercel environment variables
3. Deploy with new key
4. Verify functionality
5. Remove old key
6. Update documentation

## Monitoring Setup

### Health Checks

**Endpoint:** `/api/health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-10-20T12:00:00Z",
  "checks": {
    "database": "connected",
    "openai": "available",
    "cache": "operational"
  }
}
```

**Monitoring Services:**
- Vercel built-in monitoring
- UptimeRobot (external)
- Better Stack (optional)

### Logging

**Log Levels:**
- `ERROR`: Critical failures
- `WARN`: Warning conditions
- `INFO`: General information
- `DEBUG`: Detailed debugging (dev only)

**Log Format:**
```typescript
console.log(`[${feature}] ${message}`, { metadata });
```

**Aggregation:**
- Vercel logs dashboard
- Optional: Papertrail, Logtail, Datadog

### Error Tracking

**Recommended:** Sentry

**Setup:**
```bash
npm install @sentry/nextjs

npx @sentry/wizard@latest -i nextjs
```

**Configuration:**
```typescript
// sentry.client.config.ts
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
});
```

## Performance Monitoring

### Metrics to Track

**Core Web Vitals:**
- First Contentful Paint (FCP): < 1.8s
- Largest Contentful Paint (LCP): < 2.5s
- Cumulative Layout Shift (CLS): < 0.1
- First Input Delay (FID): < 100ms

**Custom Metrics:**
- API response times
- OpenAI API latency
- Cache hit rate
- Database query time

**Vercel Analytics:**
- Automatically enabled for all deployments
- View in Vercel dashboard → Analytics
- Real User Monitoring (RUM)

## Rollback Plan

### Rollback Triggers

**Automatic Rollback If:**
- Health check fails
- Error rate > 10%
- Response time > 60s
- Critical bug reported

**Manual Rollback When:**
- User reports critical issues
- Data corruption detected
- Security vulnerability found
- Performance degradation > 50%

### Rollback Steps

1. **Immediate Response** (< 5 minutes)
   - Promote previous deployment via Vercel
   - Verify rollback successful
   - Update status page

2. **Investigation** (< 30 minutes)
   - Check logs for errors
   - Review recent changes
   - Identify root cause
   - Document findings

3. **Communication** (< 1 hour)
   - Notify stakeholders
   - Post status update
   - Provide ETA for fix

4. **Resolution** (< 4 hours)
   - Fix issue in staging
   - Test thoroughly
   - Deploy fix
   - Monitor closely

### Rollback Testing

**Quarterly Drill:**
- Practice rollback procedure
- Test in staging environment
- Update runbook if needed
- Train team on process

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Database migration tested in staging
- [ ] Environment variables configured
- [ ] Backup created
- [ ] Rollback plan ready
- [ ] Team notified
- [ ] Off-hours deployment scheduled (if breaking changes)

### During Deployment

- [ ] Monitor build logs
- [ ] Watch for errors
- [ ] Verify deployment URL
- [ ] Check health endpoint
- [ ] Test core features
- [ ] Monitor error rate
- [ ] Check performance metrics

### Post-Deployment

- [ ] Smoke test all features
- [ ] Verify database migrations
- [ ] Check external integrations (OpenAI)
- [ ] Monitor logs for 30 minutes
- [ ] Update documentation
- [ ] Notify team of completion
- [ ] Archive deployment logs

## Related Documents
- [Requirements](../requirements/README.md)
- [Design & Architecture](../design/README.md)
- [Implementation Guide](../implementation/README.md)
- [Testing Strategy](../testing/README.md)
- [Monitoring & Observability](../monitoring/README.md)
