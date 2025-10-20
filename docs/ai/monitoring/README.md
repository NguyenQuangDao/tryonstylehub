---
phase: monitoring
title: Monitoring & Observability
description: Define monitoring strategy, metrics, alerts, and incident response
---

# Monitoring & Observability - AIStyleHub

## Key Metrics

### Performance Metrics

**Response Time / Latency**
- Virtual Try-On: < 30s (target: 15-25s)
- Image Editing: < 20s (target: 5-15s)
- Recommendations: < 10s (target: 2-5s)
- Product Catalog: < 1s
- Health Check: < 100ms

**Throughput**
- Requests per second (RPS) per endpoint
- Peak vs average traffic patterns
- Rate limit hit rate (should be < 5%)

**Resource Utilization**
- Memory usage: < 512MB (Vercel function limit)
- CPU usage: Monitor spikes
- Database connections: Monitor pool usage
- Cache hit rate: Target > 70%

**Core Web Vitals (Client-Side)**
```typescript
// Tracked automatically by Vercel Analytics
{
  "FCP": 1.2,    // First Contentful Paint (< 1.8s)
  "LCP": 2.1,    // Largest Contentful Paint (< 2.5s)
  "FID": 45,     // First Input Delay (< 100ms)
  "CLS": 0.05,   // Cumulative Layout Shift (< 0.1)
  "TTFB": 0.4    // Time to First Byte (< 600ms)
}
```

### Business Metrics

**User Engagement**
- Daily active users (DAU)
- Session duration
- Feature usage (try-on vs recommend vs edit)
- Bounce rate per page
- Return user rate

**Conversion/Success Rates**
- Try-on success rate (target: > 95%)
- Recommendation acceptance rate
- Shop link click-through rate (target: > 20%)
- Error rate per feature (target: < 5%)

**Feature Usage**
```typescript
{
  "tryon_requests": 150,
  "edit_requests": 45,
  "recommend_requests": 80,
  "product_views": 320,
  "shop_clicks": 25
}
```

### Error Metrics

**Error Rates by Type**
- Validation errors (400): Should be < 10%
- Rate limit errors (429): Should be < 5%
- Server errors (500): Should be < 1%
- OpenAI API errors: Should be < 2%
- Database errors: Should be < 0.5%

**Failed Requests**
- Total failed requests per hour
- Failed requests by endpoint
- Failed requests by error type
- OpenAI API timeout rate

**Exception Tracking**
```typescript
interface ErrorMetric {
  timestamp: string;
  endpoint: string;
  errorType: string;
  errorMessage: string;
  statusCode: number;
  userImpact: "high" | "medium" | "low";
  resolved: boolean;
}
```

### Cost Metrics

**OpenAI API Costs**
```typescript
{
  "tryon_cost": 0.07,           // Per request
  "edit_cost": 0.04,             // Per request
  "recommend_cost": 0.01,        // Per request
  "daily_total": 15.50,          // USD
  "monthly_projection": 465.00   // USD
}
```

**Cost per Feature**
- GPT-4 Vision calls: Track token usage
- DALL-E 3 generations: Count by quality (standard/HD)
- DALL-E 2 edits: Count edit requests
- Database queries: Monitor connection time

**Budget Alerts**
- Daily spend > $25: Warning
- Daily spend > $50: Critical
- Monthly projection > $600: Warning

## Monitoring Tools

### Application Monitoring (APM)

**Vercel Analytics** (Built-in)
- Real User Monitoring (RUM)
- Core Web Vitals
- Page load times
- Geographic distribution
- Device/browser breakdown

**Setup:** Automatically enabled for all Vercel projects

**Dashboard:** https://vercel.com/[team]/[project]/analytics

**Sentry** (Recommended for Error Tracking)
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

**Configuration:**
```typescript
// sentry.server.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
  beforeSend(event) {
    // Filter sensitive data
    if (event.request?.headers?.authorization) {
      delete event.request.headers.authorization;
    }
    return event;
  },
});
```

### Infrastructure Monitoring

**Vercel Dashboard**
- Function execution logs
- Build logs
- Deployment history
- Error aggregation
- Bandwidth usage

**Neon Database Dashboard**
- Connection pooling
- Query performance
- Storage usage
- Backup status

**OpenAI Usage Dashboard**
- https://platform.openai.com/usage
- Daily token usage
- API key usage by feature
- Cost breakdown

### Log Aggregation

**Vercel Logs** (Built-in)
- Runtime logs from functions
- Build logs
- Search and filter capabilities
- Real-time log streaming

**Access Logs:**
```bash
# View logs via CLI
vercel logs [deployment-url]

# Filter by function
vercel logs --output=function-name

# Follow logs in real-time
vercel logs --follow
```

**Optional: External Log Service**
- Papertrail, Logtail, or Datadog
- For long-term retention (> 7 days)
- Advanced search and alerting

### User Analytics

**Vercel Analytics** (Privacy-friendly)
- Pageview tracking
- Geographic data
- Device/browser stats
- Referrer data

**Optional: Google Analytics 4**
```typescript
// pages/_app.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('config', 'G-XXXXXXXXXX', {
          page_path: url,
        });
      }
    };
    
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);
  
  return <Component {...pageProps} />;
}
```

## Logging Strategy

### Log Levels and Categories

**Levels:**
```typescript
enum LogLevel {
  DEBUG = 'debug',   // Development only
  INFO = 'info',     // General information
  WARN = 'warn',     // Warning conditions
  ERROR = 'error',   // Error conditions
  FATAL = 'fatal'    // Critical failures
}
```

**Categories:**
- `API`: API endpoint activity
- `OPENAI`: OpenAI API interactions
- `DB`: Database operations
- `CACHE`: Cache hits/misses
- `AUTH`: Authentication events (future)
- `COST`: Cost tracking

**Examples:**
```typescript
// Information
console.log('[API:TryOn] Processing request', { userId, imageCount: 2 });

// Warning
console.warn('[OPENAI] High token usage', { tokens: 4500, limit: 5000 });

// Error
console.error('[DB] Query failed', { error: err.message, query: 'findProducts' });

// Cost tracking
console.info('[COST] Try-on completed', { cost: 0.07, feature: 'tryon' });
```

### Structured Logging Format

**Format:**
```typescript
{
  timestamp: "2024-10-20T12:00:00Z",
  level: "info",
  category: "API",
  feature: "tryon",
  message: "Request completed",
  metadata: {
    duration: 23500,
    cached: false,
    quality: "standard"
  },
  userId?: "optional",
  requestId: "req-abc123"
}
```

**Implementation:**
```typescript
// src/lib/logger.ts
export function log(
  level: LogLevel,
  category: string,
  message: string,
  metadata?: Record<string, unknown>
) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    category,
    message,
    ...metadata
  };
  
  if (level === 'error' || level === 'fatal') {
    console.error(`[${category}] ${message}`, logEntry);
  } else if (level === 'warn') {
    console.warn(`[${category}] ${message}`, logEntry);
  } else {
    console.log(`[${category}] ${message}`, logEntry);
  }
}
```

### Log Retention Policy

**Vercel:** 7 days (free tier)
**External Service:** 30 days (if implemented)
**Critical Logs:** Archive to S3 for 1 year

### Sensitive Data Handling

**Never Log:**
- API keys or secrets
- Full credit card numbers
- Passwords
- PII (email, phone) in production

**Redact Before Logging:**
```typescript
function sanitize(data: any) {
  const sanitized = { ...data };
  if (sanitized.apiKey) sanitized.apiKey = '***REDACTED***';
  if (sanitized.email) sanitized.email = sanitized.email.replace(/(.{2}).*(@.*)/, '$1***$2');
  return sanitized;
}
```

## Alerts & Notifications

### Critical Alerts

**Alert 1: API Error Rate High**
- **Condition:** Error rate > 10% over 5 minutes
- **Action:** 
  - Send Slack/email notification
  - Check OpenAI status
  - Review recent deployments
  - Consider rollback if > 20%

**Alert 2: OpenAI API Down**
- **Condition:** OpenAI returns 503 for > 3 consecutive requests
- **Action:**
  - Display maintenance message to users
  - Switch to cached responses if available
  - Monitor OpenAI status page
  - Notify team immediately

**Alert 3: Database Connection Failed**
- **Condition:** Database queries fail for > 2 minutes
- **Action:**
  - Check Neon dashboard
  - Verify connection string
  - Review recent migrations
  - Rollback if necessary

**Alert 4: Daily Cost Exceeded**
- **Condition:** OpenAI daily cost > $50
- **Action:**
  - Enable more aggressive caching
  - Reduce quality to 'standard'
  - Implement temporary rate limits
  - Review usage patterns

### Warning Alerts

**Alert 5: Response Time Degraded**
- **Condition:** Average response time > 40s for 10 minutes
- **Action:**
  - Check OpenAI API status
  - Monitor server resources
  - Review recent code changes
  - Consider scaling if needed

**Alert 6: Cache Hit Rate Low**
- **Condition:** Cache hit rate < 50% over 1 hour
- **Action:**
  - Review cache TTL settings
  - Check cache key generation
  - Monitor memory usage
  - Investigate unique request patterns

**Alert 7: Rate Limit Hits High**
- **Condition:** Rate limit rejections > 10% of requests
- **Action:**
  - Review rate limit settings
  - Check for bot traffic
  - Consider increasing limits
  - Implement user education

**Alert 8: Approaching Budget Limit**
- **Condition:** Monthly projection > $600
- **Action:**
  - Review cost breakdown
  - Optimize expensive features
  - Consider feature usage limits
  - Plan for scaling costs

### Alert Configuration

**Vercel Monitoring:**
```javascript
// vercel.json
{
  "monitoring": {
    "alerts": [
      {
        "name": "high-error-rate",
        "condition": "error_rate > 0.1",
        "duration": "5m",
        "channels": ["slack", "email"]
      },
      {
        "name": "slow-response",
        "condition": "p95_response_time > 40000",
        "duration": "10m",
        "channels": ["slack"]
      }
    ]
  }
}
```

**Sentry Alerts:**
- New issue created: Immediate notification
- Issue spike: 10x normal rate
- Performance degradation: > 50% slower

## Dashboards

### System Health Dashboard

**Metrics to Display:**
```typescript
interface SystemHealth {
  // Status
  status: "operational" | "degraded" | "down";
  uptime: number; // percentage
  
  // Performance
  avgResponseTime: {
    tryon: number;
    edit: number;
    recommend: number;
  };
  
  // Traffic
  requestsPerMinute: number;
  activeUsers: number;
  
  // Errors
  errorRate: number;
  errorCount: number;
  
  // Resources
  cacheHitRate: number;
  dbConnections: number;
  
  // Costs
  dailyCost: number;
  monthlyProjection: number;
}
```

**Implementation Options:**
- Vercel Analytics Dashboard (built-in)
- Grafana (self-hosted)
- Datadog (paid service)
- Custom dashboard with Recharts

### Business Metrics Dashboard

**Key Metrics:**
- Daily active users
- Feature usage breakdown (pie chart)
- Conversion funnel:
  1. Page visits
  2. Feature usage
  3. Shop link clicks
- User retention (7-day, 30-day)
- Geographic distribution (map)

**Tools:**
- Google Analytics 4
- Mixpanel (optional)
- Custom Next.js dashboard

### Cost Tracking Dashboard

**Display:**
```typescript
{
  "today": {
    "tryon": { count: 120, cost: 8.40 },
    "edit": { count: 45, cost: 1.80 },
    "recommend": { count: 80, cost: 0.80 },
    "total": 11.00
  },
  "week": {
    "total": 77.00,
    "projection": 330.00
  },
  "month": {
    "total": 245.00,
    "projection": 465.00,
    "budget": 500.00,
    "remaining": 255.00
  }
}
```

**Implementation:**
```typescript
// src/lib/cost-tracker.ts
export async function trackCost(feature: string, cost: number) {
  await prisma.costLog.create({
    data: {
      feature,
      cost,
      timestamp: new Date()
    }
  });
  
  // Check daily budget
  const todayTotal = await getDailyCost();
  if (todayTotal > 50) {
    await sendAlert('high-daily-cost', { total: todayTotal });
  }
}
```

## Incident Response

### On-Call Rotation
**Phase 1:** Single developer (you)
**Phase 2:** Rotating on-call schedule

**Responsibilities:**
- Respond to critical alerts within 15 minutes
- Investigate and triage issues
- Implement fixes or rollbacks
- Document incidents
- Conduct post-mortems

### Escalation Path

**Level 1 (0-15 min):** On-call developer
- Acknowledge alert
- Assess severity
- Initial investigation

**Level 2 (15-30 min):** Team lead
- Escalate if not resolved
- Coordinate resources
- Communicate with stakeholders

**Level 3 (30+ min):** Management
- Major incident declared
- External communication
- Resource allocation

### Incident Process

#### 1. Detection and Triage (0-5 minutes)
- Alert received via monitoring
- On-call acknowledges
- Assess impact:
  - Critical: All features down
  - High: One core feature down
  - Medium: Degraded performance
  - Low: Minor issue, no user impact

#### 2. Investigation and Diagnosis (5-30 minutes)
- Check recent deployments
- Review error logs
- Test in staging
- Identify root cause
- Document findings

#### 3. Resolution and Mitigation (30-120 minutes)
- Implement fix or rollback
- Deploy to production
- Verify resolution
- Monitor closely
- Update status

#### 4. Post-Mortem and Learning (24-48 hours)
- Write incident report
- Identify preventable causes
- Document lessons learned
- Create action items
- Update runbooks

### Incident Template

```markdown
# Incident Report: [Title]

## Summary
- **Date:** 2024-10-20
- **Duration:** 2 hours 15 minutes
- **Severity:** High
- **Impact:** Try-on feature unavailable

## Timeline
- 14:00 - Alert triggered: High error rate
- 14:05 - On-call acknowledged
- 14:15 - Root cause identified: OpenAI API key rotated incorrectly
- 14:20 - Fix implemented: Updated API key in Vercel
- 14:25 - Deployed and verified
- 16:15 - Declared resolved

## Root Cause
Incorrect API key stored in Vercel environment variables during routine rotation.

## Resolution
- Updated API key in Vercel dashboard
- Redeployed application
- Verified all features working

## Action Items
- [ ] Add API key validation to deployment checklist
- [ ] Implement health check for OpenAI connectivity
- [ ] Document key rotation procedure
- [ ] Add automated tests for API integration

## Lessons Learned
1. Always verify API keys in staging before production
2. Implement automated checks for critical dependencies
3. Improve alerting for authentication failures
```

## Health Checks

### Endpoint Health Checks

**Main Health Check:** `/api/health`

```typescript
// src/app/api/health/route.ts
export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    status: 'ok',
    checks: {
      database: await checkDatabase(),
      openai: await checkOpenAI(),
      cache: checkCache(),
      storage: await checkStorage()
    }
  };
  
  const allHealthy = Object.values(checks.checks).every(c => c === 'ok');
  
  return Response.json(checks, {
    status: allHealthy ? 200 : 503
  });
}

async function checkDatabase() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return 'ok';
  } catch {
    return 'failed';
  }
}

async function checkOpenAI() {
  try {
    await openai.models.list();
    return 'ok';
  } catch {
    return 'failed';
  }
}
```

**Monitoring:**
- UptimeRobot: Check `/api/health` every 5 minutes
- Vercel: Synthetic monitoring (if available)
- Internal: Automated tests every 15 minutes

### Dependency Checks

**External Services:**
- OpenAI API: https://status.openai.com
- Vercel: https://www.vercel-status.com
- Neon: https://neonstatus.com

**Monitoring:**
- Subscribe to status page updates
- Add RSS feeds to Slack
- Check before major deployments

### Automated Smoke Tests

**Post-Deployment Tests:**
```typescript
// tests/smoke/api.test.ts
describe('Smoke Tests', () => {
  test('Health check passes', async () => {
    const res = await fetch('https://aistylehub.com/api/health');
    expect(res.status).toBe(200);
  });
  
  test('Products API returns data', async () => {
    const res = await fetch('https://aistylehub.com/api/products');
    const data = await res.json();
    expect(data.products.length).toBeGreaterThan(0);
  });
  
  test('Homepage loads', async () => {
    const res = await fetch('https://aistylehub.com');
    expect(res.status).toBe(200);
  });
});
```

**Run After Each Deployment:**
```bash
npm run test:smoke
```

## Monitoring Checklist

### Daily
- [ ] Check error rate dashboard
- [ ] Review OpenAI cost
- [ ] Check response times
- [ ] Review critical alerts

### Weekly
- [ ] Review cost trends
- [ ] Check cache effectiveness
- [ ] Review user feedback
- [ ] Update documentation

### Monthly
- [ ] Review all incidents
- [ ] Update runbooks
- [ ] Cost optimization review
- [ ] Performance trends analysis
- [ ] Security audit

## Related Documents
- [Requirements](../requirements/README.md)
- [Design & Architecture](../design/README.md)
- [Implementation Guide](../implementation/README.md)
- [Testing Strategy](../testing/README.md)
- [Deployment Guide](../deployment/README.md)
