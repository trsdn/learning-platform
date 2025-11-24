# Vercel Deployment Troubleshooting

## Common Issues and Solutions

### 1. Environment Variables Not Set

**Symptoms:**
- Build fails with "Missing VITE_SUPABASE_URL" error
- Runtime errors about undefined environment variables

**Solution:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add the following variables:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon/public key
3. Ensure variables are set for the correct environments (Production, Preview, Development)
4. Redeploy after adding variables

### 2. Build Timeout

**Symptoms:**
- Build takes longer than expected
- "Build exceeded maximum duration" error

**Solution:**
- Function configuration set to 30 seconds max duration
- Memory limit set to 1024MB
- Using `npm ci` instead of `npm install` for faster, reproducible builds

### 3. Dependency Installation Issues

**Symptoms:**
- "npm install" fails during build
- Package version conflicts

**Solution:**
1. Ensure `package-lock.json` is committed to repository
2. Use `npm ci` instead of `npm install` (already configured in vercel.json)
3. Clear Vercel cache if needed: Settings → General → Clear Cache

### 4. Invalid Supabase URL

**Symptoms:**
- "Invalid VITE_SUPABASE_URL" error during build
- Malformed URL errors

**Solution:**
- Ensure VITE_SUPABASE_URL is a valid HTTPS URL
- Format should be: `https://[project-id].supabase.co`
- Check for trailing slashes or typos

### 5. Build Configuration Issues

**Symptoms:**
- Build command fails
- Output directory not found

**Solution:**
- Verify `vite.config.ts` build settings
- Ensure `outputDirectory` in vercel.json matches Vite output (should be `dist`)
- Check build command is `npm run build`

## Environment Variable Checklist

Before deploying, ensure all required environment variables are set in Vercel:

- [ ] `VITE_SUPABASE_URL`
- [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] All variables are set for Production environment
- [ ] All variables are set for Preview environment (if using PR previews)

## Build Optimization Tips

1. **Use npm ci**: Configured in vercel.json for faster, reproducible builds
2. **Cache node_modules**: Vercel automatically caches dependencies
3. **Minimize bundle size**: Use code splitting and lazy loading
4. **Optimize images**: Compress images before committing

## Monitoring Deployments

1. **Check Build Logs**: Vercel Dashboard → Deployments → Select deployment → Build Logs
2. **Function Logs**: Dashboard → Deployments → Select deployment → Functions
3. **Real-time Logs**: Use Vercel CLI `vercel logs`

## Quick Fixes

### Force Redeploy
```bash
# Using Vercel CLI
vercel --force

# Or trigger via Git
git commit --allow-empty -m "Force redeploy"
git push
```

### Clear Build Cache
1. Go to Project Settings → General
2. Scroll to "Build & Development Settings"
3. Click "Clear Cache"
4. Trigger new deployment

### Verify Environment Variables
```bash
# Using Vercel CLI
vercel env ls

# Pull environment variables locally
vercel env pull .env.local
```

## Configuration Files

### vercel.json
Key settings:
- `buildCommand`: npm run build
- `outputDirectory`: dist
- `installCommand`: npm ci (for reproducible builds)
- `framework`: vite
- `regions`: ["iad1"] (Washington DC for low latency)
- `functions.maxDuration`: 30 seconds
- `functions.memory`: 1024MB

### Security Headers
The following security headers are configured:
- Content-Security-Policy
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Cache-Control for static assets

## Contact Support

If issues persist after trying these solutions:
1. Check Vercel Status: https://www.vercel-status.com/
2. Review recent changes to `vercel.json` or `vite.config.ts`
3. Contact Vercel Support with deployment ID and error logs

## Related Files

- `/vercel.json` - Vercel configuration
- `/vite.config.ts` - Vite build configuration
- `/.env.example` - Environment variable template
- `/src/modules/storage/supabase-client.ts` - Supabase client with validation
