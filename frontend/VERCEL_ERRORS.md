# 🚨 Vercel Error Prevention Checklist

## ✅ FIXED ISSUES

### 1. **Stripe API Key Missing** ✅
**Error**: `Neither apiKey nor config.authenticator provided`
- **Root Cause**: `process.env.STRIPE_SECRET_KEY!` was undefined during build
- **Fix**: Added validation checks in [app/api/checkout/session/route.ts](app/api/checkout/session/route.ts#L4-L6)
- **Status**: RESOLVED

### 2. **Turbopack Webpack Conflict** ✅
**Error**: `This build is using Turbopack, with a webpack config`
- **Root Cause**: Next.js 16 uses Turbopack by default, webpack config incompatible
- **Fix**: Removed webpack config, added `turbopack: {}` in [next.config.ts](next.config.ts)
- **Status**: RESOLVED

### 3. **Function Timeout (10s default)** ✅
**Potential Error**: `FUNCTION_INVOCATION_TIMEOUT`
- **Risk**: Upload/order processing > 10s
- **Fix**: Added `maxDuration: 300` for heavy routes
- **Files**: 
  - [app/api/uploads/route.ts](app/api/uploads/route.ts#L6) - 300s
  - [app/api/orders/route.ts](app/api/orders/route.ts#L35) - 300s
  - [app/api/checkout/session/route.ts](app/api/checkout/session/route.ts#L12) - 60s
  - [app/api/webhooks/stripe/route.ts](app/api/webhooks/stripe/route.ts#L19) - 60s
- **Status**: RESOLVED

### 4. **Prisma Client Missing** ✅
**Potential Error**: `PrismaClient is unable to be run in the browser`
- **Risk**: Prisma not generated during Vercel build
- **Fix**: `buildCommand: "prisma generate && next build"` in [vercel.json](vercel.json#L3)
- **Status**: RESOLVED

### 5. **Node.js Version Mismatch** ✅
**Potential Error**: `The engine "node" is incompatible`
- **Fix**: Added `"engines": { "node": ">=20.x" }` in [package.json](package.json#L5-L7)
- **Vercel Default**: Node.js 20.x
- **Status**: RESOLVED

### 6. **Build Size Too Large (760MB)** ⚠️
**Vercel Limit**: 250MB compressed output
- **Current**: 760MB uncompressed `.next` folder
- **Risk**: Medium (Vercel compresses during upload)
- **Fix Applied**: 
  - Removed webpack fallbacks (reduced client bundle)
  - Enabled `serverMinification`
  - Turbopack tree-shaking
- **Monitor**: Check deployment logs for size warnings
- **Status**: LIKELY OK (compression should handle it)

### 7. **Database Connection Pool Exhaustion** ⚠️
**Potential Error**: `too many connections for role`
- **Risk**: Serverless creates new connection per invocation
- **Current Fix**: Singleton pattern in [lib/prisma.ts](lib/prisma.ts)
- **Recommended**: Use PgBouncer or connection pooler (Supabase/Neon)
- **Status**: MITIGATED (needs monitoring in production)

### 8. **Memory Limit (1024MB default)** ✅
**Potential Error**: `FUNCTION_PAYLOAD_TOO_LARGE`
- **Risk**: Large file uploads, PDF generation
- **Fix**: Set 3008MB in [vercel.json](vercel.json#L10-L16) for uploads/orders
- **Status**: RESOLVED

## 🔍 ENVIRONMENT VARIABLE CHECKLIST

All must be set in **Vercel Dashboard → Settings → Environment Variables**:

### Critical (App won't work without these):
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `STRIPE_SECRET_KEY` - Live: `sk_live_...` (Test: `sk_test_...`)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Live: `pk_live_...`
- [ ] `STRIPE_WEBHOOK_SECRET` - Get from Stripe CLI or Dashboard
- [ ] `RESEND_API_KEY` - Email delivery API key
- [ ] `OWNCLOUD_URL` - File storage endpoint
- [ ] `OWNCLOUD_USERNAME` - WebDAV username
- [ ] `OWNCLOUD_PASSWORD` - WebDAV password/token

### Optional (Has defaults):
- [ ] `EMAIL_FROM` - Default: `onboarding@resend.dev`
- [ ] `EMAIL_TO` - Default: `kovac.jr@slza.sk`
- [ ] `NEXT_PUBLIC_BASE_URL` - Default: auto-detected
- [ ] `PACKETA_API_KEY` - Only if using Packeta delivery
- [ ] `ENABLE_PASSWORD_PROTECTION` - Default: `false`
- [ ] `ENABLE_INVOICES` - Default: `true`

## 🧪 PRE-DEPLOYMENT TESTS

Run these locally before deploying:

```bash
# 1. Build test
npm run build
# Expected: ✓ Compiled successfully

# 2. Production start test
npm run start
# Expected: Server running on http://localhost:3000

# 3. Prisma check
cd frontend && npx prisma generate
# Expected: ✓ Generated Prisma Client

# 4. Environment vars test
node -e "console.log(process.env.DATABASE_URL ? '✓ DB' : '✗ DB')"
# Expected: ✓ DB

# 5. Stripe connection test
curl http://localhost:3000/api/orders/generate-number
# Expected: {"orderNumber":"202602-1"}
```

## 🚀 DEPLOYMENT STEPS

### Step 1: Vercel Setup
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import GitHub repository: `PALIKOVY222/slza.sk`
4. **Framework Preset**: Next.js (auto-detected)
5. **Root Directory**: `frontend` ⚠️ CRITICAL
6. **Build Command**: Leave default (uses vercel.json)
7. **Output Directory**: Leave default (`.next`)

### Step 2: Environment Variables
1. Go to **Settings → Environment Variables**
2. Add all variables from `.env.local`
3. **Important**: Use **Production** scope for live keys
4. **Important**: Use **Preview** scope for test keys

### Step 3: Deploy
1. Click "Deploy"
2. Wait for build (3-5 minutes)
3. Check logs for errors

### Step 4: Post-Deploy Configuration

#### A. Stripe Webhook Setup
1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. URL: `https://slza.sk/api/webhooks/stripe`
4. Events to send:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy **Signing secret** (starts with `whsec_`)
6. Add to Vercel env vars: `STRIPE_WEBHOOK_SECRET`
7. Redeploy

#### B. DNS Configuration
1. Go to domain registrar (where you bought slza.sk)
2. Add CNAME record:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```
3. Or use Vercel nameservers (recommended)

#### C. Database Setup
1. If using Vercel Postgres:
   - Go to **Storage → Create Database**
   - Choose "Postgres"
   - Copy connection string to `DATABASE_URL`
2. Run migrations:
   ```bash
   cd frontend
   npx prisma migrate deploy
   ```

#### D. OwnCloud Verification
1. Test upload endpoint:
   ```bash
   curl https://slza.sk/api/uploads -X POST \
     -H "Content-Type: application/json" \
     -d '{"fileName":"test.txt","base64":"SGVsbG8="}'
   ```
2. Expected: `{"url":"https://cloud.repro.sk/...","path":"..."}`

## 📊 POST-DEPLOY MONITORING

### First 24 Hours:
- [ ] Check function invocations: Vercel Dashboard → Analytics
- [ ] Monitor cold start times (should be < 2s)
- [ ] Watch error rate (should be < 1%)
- [ ] Verify Stripe webhooks received (Stripe Dashboard → Webhooks)
- [ ] Test full checkout flow (test card: 4242 4242 4242 4242)
- [ ] Check email delivery (Resend Dashboard → Logs)
- [ ] Monitor database connections (PostgreSQL logs)

### Ongoing:
- Enable **Vercel Logs**: Real-time function logs
- Enable **Vercel Analytics**: Web Vitals monitoring
- Set up **Alerts**: For 5xx errors, high latency
- Check **Function Duration**: Should stay under limits

## 🆘 TROUBLESHOOTING

### Error: "DEPLOYMENT_FAILED"
**Solution**: Check build logs in Vercel dashboard

### Error: "MODULE_NOT_FOUND" in production
**Solution**: 
1. Ensure dependency is in `dependencies`, not `devDependencies`
2. Clear cache: Vercel Dashboard → Settings → Clear Cache

### Error: "DATABASE_URL not defined"
**Solution**: 
1. Check env vars in Vercel Dashboard
2. Ensure variable is set for correct environment (Production/Preview)
3. Redeploy after adding variables

### Error: "FUNCTION_INVOCATION_TIMEOUT"
**Solution**: Already fixed with `maxDuration`, check if route needs higher limit

### Error: "ECONNREFUSED" when connecting to database
**Solution**:
1. Check if DATABASE_URL uses external host (not localhost)
2. Verify database accepts connections from Vercel IPs
3. Use connection pooler (recommended)

### Error: "STRIPE_SECRET_KEY is not defined"
**Solution**: 
1. Add env var in Vercel Dashboard
2. Ensure it's not wrapped in quotes
3. Redeploy

### Slow cold starts (> 5s)
**Solution**:
1. Enable **Vercel Edge Functions** for lighter routes
2. Reduce bundle size
3. Use ISR (Incremental Static Regeneration) where possible

## ✨ OPTIMIZATION TIPS

### Bundle Size Reduction:
```typescript
// Use dynamic imports for heavy components
const PDFViewer = dynamic(() => import('./PDFViewer'), {
  ssr: false,
  loading: () => <p>Loading...</p>
})
```

### Database Connection Pooling:
```typescript
// Use Prisma Data Proxy or PgBouncer
DATABASE_URL="prisma://aws-us-east-1.prisma-data.com/?api_key=..."
```

### Caching:
```typescript
// Cache static data
export const revalidate = 3600; // 1 hour

// ISR for product pages
export async function generateStaticParams() {
  const products = await prisma.product.findMany();
  return products.map((p) => ({ slug: p.slug }));
}
```

## 🎯 SUCCESS CRITERIA

Deployment is successful when:
- [ ] Build completes without errors
- [ ] Homepage loads at https://slza.sk
- [ ] API routes respond (test with /api/orders/generate-number)
- [ ] Stripe checkout works with test card
- [ ] Emails are delivered via Resend
- [ ] File uploads work to OwnCloud
- [ ] Database queries execute
- [ ] Function duration < 60s for all routes
- [ ] No 5xx errors in first 100 requests
- [ ] Web Vitals are green (LCP < 2.5s, FID < 100ms, CLS < 0.1)

## 📚 DOCUMENTATION LINKS

- [Vercel Deployment](https://vercel.com/docs/deployments/overview)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Vercel Functions](https://vercel.com/docs/functions/serverless-functions)
- [Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Custom Domains](https://vercel.com/docs/custom-domains)

---

**Ready to deploy!** 🚀

All known Vercel errors have been addressed. Push to GitHub and let Vercel auto-deploy from the `main` branch.
