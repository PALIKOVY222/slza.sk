# Vercel Environment Variables Setup

Po deploymente na Vercel musíte nastaviť tieto environment variables v **Project Settings → Environment Variables**:

## 🔴 CRITICAL - Required Variables

### Database
```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
```

### Stripe Payment Gateway
```
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Resend Email API
```
RESEND_API_KEY=re_...
EMAIL_FROM=info@slza.sk
EMAIL_TO=kovac.jr@slza.sk
```

### OwnCloud File Storage
```
OWNCLOUD_URL=https://cloud.repro.sk/remote.php/dav/files/pajko
OWNCLOUD_USERNAME=pajko
OWNCLOUD_PASSWORD=***
```

### Site Configuration
```
NEXT_PUBLIC_BASE_URL=https://slza.sk
ENABLE_PASSWORD_PROTECTION=false
ENABLE_INVOICES=true
```

### Packeta Delivery
```
PACKETA_API_KEY=a88a0c1ffc3ba5fe
```

### Turnstile CAPTCHA
```
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAAAzL...
TURNSTILE_SECRET_KEY=0x4AAAAAAAzL...
```

## ⚠️ Vercel-Specific Issues Fixed

### 1. **Serverless Function Timeouts** ✅
- Default: 10s (Hobby), 60s (Pro)
- Fixed: Added `maxDuration: 300` for upload/order routes
- Solution: In [vercel.json](vercel.json) and route exports

### 2. **Build Size (760MB)** ✅
- Vercel limit: 250MB compressed
- Fixed: Webpack fallbacks for client-side fs/net/tls
- Solution: In [next.config.ts](next.config.ts)

### 3. **Prisma Client Generation** ✅
- Issue: Prisma needs to generate client during build
- Fixed: `buildCommand: "prisma generate && next build"`
- Solution: In [vercel.json](vercel.json)

### 4. **Database Connection Pooling** ✅
- Issue: Serverless functions create many connections
- Fixed: Using singleton pattern in [lib/prisma.ts](../lib/prisma.ts)
- Recommendation: Use connection pooling (PgBouncer or Supabase)

### 5. **File System Access** ✅
- Issue: API routes reading JSON files (sticker-price, banner-price, flyer-price)
- Status: Works on Vercel (read-only access to bundled files)
- Alternative: Move to database if issues occur

### 6. **Memory Limits** ✅
- Default: 1024MB
- Fixed: 3008MB for uploads/orders in [vercel.json](vercel.json)
- Critical for: Large file uploads, PDF generation

### 7. **Environment Variables** ✅
- Issue: Must be set in Vercel dashboard
- Fixed: Added `engines.node: ">=20.x"` to [package.json](package.json)
- Action Required: Copy all vars from .env.local to Vercel

## 🚀 Deployment Checklist

### Pre-Deploy
- [x] Build passes locally: `npm run build`
- [x] All env vars in .env.local documented
- [x] Prisma schema migrated
- [x] Stripe test keys working
- [x] vercel.json created with timeouts

### During Deploy
- [ ] Connect GitHub repository
- [ ] Set Framework Preset to "Next.js"
- [ ] Root Directory: `frontend`
- [ ] Build Command: `prisma generate && next build` (auto from vercel.json)
- [ ] Output Directory: `.next` (default)
- [ ] Install Command: `npm install`

### Post-Deploy
- [ ] Add all environment variables in Vercel dashboard
- [ ] Test: `https://slza.sk/api/orders/generate-number`
- [ ] Test: Stripe checkout flow
- [ ] Test: File upload via OwnCloud
- [ ] Configure Stripe webhook: `https://slza.sk/api/webhooks/stripe`
- [ ] Update DNS to point to Vercel
- [ ] Enable automatic deployments from `main` branch
- [ ] Test contact form + email delivery

## 🔧 Common Vercel Errors

### Error: "FUNCTION_INVOCATION_TIMEOUT"
```
Solution: Increase maxDuration in vercel.json or route export
```

### Error: "DEPLOYMENT_FAILED: Build exceeded maximum size"
```
Solution: 
1. Remove unused dependencies
2. Use dynamic imports
3. Check .next folder size: du -sh .next
```

### Error: "Prisma Client not found"
```
Solution: Ensure buildCommand includes "prisma generate"
```

### Error: "DATABASE_URL not defined"
```
Solution: Add env var in Vercel dashboard, not in vercel.json
```

### Error: "Module not found: Can't resolve 'fs'"
```
Solution: Already fixed in next.config.ts with webpack fallbacks
```

## 📊 Performance Monitoring

After deployment, monitor:
- **Function Duration**: Should be < 60s for most routes
- **Cold Start Time**: First request after idle period
- **Database Connection Pool**: Watch for "too many connections"
- **Memory Usage**: Should stay under 3GB for heavy routes
- **Error Rate**: Check Vercel dashboard for 5xx errors

## 🔐 Security Notes

1. **Never commit** env vars to git
2. **Rotate keys** after testing
3. **Use Vercel Secrets** for sensitive vars: `vercel env add SECRET_KEY`
4. **Enable Vercel Authentication** for /admin routes
5. **Set up Vercel Firewall** to block malicious IPs

## 📱 Contact

If deployment fails, check:
1. Vercel Dashboard → Deployments → Error logs
2. Function logs in real-time
3. Build logs for compilation errors

**Ready to deploy!** Push to GitHub and let Vercel auto-deploy.
