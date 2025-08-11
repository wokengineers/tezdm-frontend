# TezDM Frontend - Production Deployment Guide

## 🚀 Vercel Deployment

This guide covers deploying the TezDM Frontend to Vercel for production use.

## 📋 Prerequisites

- [Vercel CLI](https://vercel.com/docs/cli) installed
- [Node.js](https://nodejs.org/) 18+ installed
- [Git](https://git-scm.com/) repository set up
- Production API endpoint ready

## 🔧 Environment Setup

### 1. Environment Variables

Set these environment variables in your Vercel project:

```bash
# API Configuration
REACT_APP_API_BASE_URL=https://api.stage.wokengineers.com/v1
REACT_APP_ENVIRONMENT=production

# Security Configuration
REACT_APP_ENABLE_SECURITY_LOGGING=false
REACT_APP_TOKEN_REFRESH_THRESHOLD=300000
REACT_APP_MAX_DATA_AGE=86400000

# Feature Flags
REACT_APP_ENABLE_DEBUG_MODE=false
REACT_APP_ENABLE_SECURITY_VALIDATION=true

# Performance Configuration
GENERATE_SOURCEMAP=false
REACT_APP_ENABLE_ANALYTICS=true
```

### 2. Vercel Configuration

The `vercel.json` file is already configured with:
- Static build configuration
- SPA routing (all routes serve index.html)
- Security headers
- Cache optimization for static assets

## 🛠️ Build Process

### Local Build Test

```bash
# Install dependencies
npm install

# Run type checking
npm run type-check

# Run linting
npm run lint

# Build for production
npm run build

# Test the build locally
npm run build:analyze
```

### Build Scripts

- `npm run build` - Production build with source maps disabled
- `npm run build:analyze` - Build and serve locally for testing
- `npm run test:ci` - Run tests in CI mode
- `npm run lint` - Lint code with auto-fix
- `npm run type-check` - TypeScript type checking

## 🚀 Deployment Steps

### Option 1: Vercel CLI

```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Or deploy to preview
vercel
```

### Option 2: GitHub Integration

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Push to main branch for automatic deployment

### Option 3: Manual Upload

```bash
# Build the project
npm run build

# Deploy build folder
vercel build/
```

## 🔒 Security Configuration

### Headers Applied

The `vercel.json` includes security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

### Environment Variables

- Debug logging disabled in production
- Security logging configurable
- Source maps disabled for security
- Token refresh threshold optimized

## 📊 Performance Optimizations

### Build Optimizations

- Source maps disabled (`GENERATE_SOURCEMAP=false`)
- Static asset caching (1 year for static files)
- SPA routing for better performance
- Environment-based logging levels

### Runtime Optimizations

- Conditional logging based on environment
- Token refresh optimization
- Data age validation
- Security validation enabled

## 🔍 Monitoring & Debugging

### Logging Levels

- **Production**: Only ERROR logs
- **Development**: INFO and above
- **Debug Mode**: All logs (when enabled)

### Security Logging

- Authentication events
- Token refresh events
- Data integrity checks
- API security events

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Check TypeScript errors
   npm run type-check
   
   # Check linting errors
   npm run lint
   ```

2. **Environment Variables**
   - Ensure all required env vars are set in Vercel
   - Check for typos in variable names
   - Verify API endpoints are accessible

3. **Routing Issues**
   - Verify `vercel.json` routing configuration
   - Check that all routes serve `index.html`

4. **API Connection Issues**
   - Verify `REACT_APP_API_BASE_URL` is correct
   - Check CORS configuration on backend
   - Test API endpoints directly

### Debug Commands

```bash
# Check build output
npm run build

# Test locally
npm run build:analyze

# Check environment
echo $REACT_APP_API_BASE_URL

# Verify TypeScript
npx tsc --noEmit
```

## 📈 Post-Deployment

### Verification Checklist

- [ ] Application loads without errors
- [ ] Authentication flow works
- [ ] OAuth connections function
- [ ] API calls succeed
- [ ] Security headers are applied
- [ ] Performance is acceptable
- [ ] Error logging works

### Monitoring

- Monitor Vercel analytics
- Check error logs in Vercel dashboard
- Monitor API response times
- Track user authentication success rates

## 🔄 Continuous Deployment

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run test:ci
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 📞 Support

For deployment issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test locally with production build
4. Check API connectivity
5. Review security configuration

---

**Note**: This deployment guide assumes you have access to the production API endpoint. Update the `REACT_APP_API_BASE_URL` to match your actual production API. 