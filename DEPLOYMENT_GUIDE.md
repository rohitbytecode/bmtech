# Deployment & Production Setup Guide

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Supabase Production Configuration](#supabase-production-configuration)
3. [Environment Variables Setup](#environment-variables-setup)
4. [Email Verification Configuration](#email-verification-configuration)
5. [Database Permissions & RLS](#database-permissions--rls)
6. [Monitoring & Debugging](#monitoring--debugging)

---

## Pre-Deployment Checklist

Before deploying to production, ensure:

### Code Quality

- [ ] All environment variables properly set
- [ ] No hardcoded URLs (should use `NEXT_PUBLIC_APP_URL`)
- [ ] Error handling implemented for all API calls
- [ ] Console logs removed or set to production mode
- [ ] Build completes without errors: `npm run build`

### Authentication

- [ ] Email verification tested end-to-end
- [ ] Auth redirect URLs configured in Supabase
- [ ] Signup and login flows work correctly
- [ ] Session persistence works after page reload
- [ ] Logout clears session properly

### Database

- [ ] RLS policies enabled on all tables
- [ ] Public read/write policies tested
- [ ] Admin-only operations protected
- [ ] Database backups configured
- [ ] Migration rollback plan documented

### Security

- [ ] Service role key never exposed in frontend
- [ ] .env files excluded from git (.gitignore updated)
- [ ] HTTPS enforced on production
- [ ] CORS properly configured if needed
- [ ] Rate limiting considered for APIs

---

## Supabase Production Configuration

### 1. Separate Project for Production

**Recommended**: Create a separate Supabase project for production.

**Steps**:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Select your region (choose closest to users)
4. Copy credentials to production `.env`

### 2. Database Initialization

Run the same SQL schema in your production project:

```sql
-- Copy from SUPABASE_SETUP.md and run in SQL Editor
-- Create all tables: services, projects, packages, leads, maintenance_plans
```

### 3. Enable RLS on All Tables

```sql
-- For each table
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Then apply your policies
CREATE POLICY "Public Read" ON table_name FOR SELECT USING (true);
```

### 4. Backup & Recovery

1. Go to **Settings → Backups**
2. Enable automated daily backups
3. Test restore procedure on staging environment
4. Document recovery process

---

## Environment Variables Setup

### Local Development

**File**: `.env.local`

```bash
# Supabase (development)
NEXT_PUBLIC_SUPABASE_URL=https://dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dev-anon-key
NEXT_SUPABASE_SERVICE_ROLE_KEY=dev-service-role-key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Production Environment

Set these in your hosting platform (Vercel, Netlify, etc.):

```bash
# Supabase (production)
NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod-anon-key
NEXT_SUPABASE_SERVICE_ROLE_KEY=prod-service-role-key

# CRITICAL: Must match your production domain
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
```

### Staging Environment (Optional)

Create a staging project for testing before production:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://staging-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=staging-anon-key
NEXT_SUPABASE_SERVICE_ROLE_KEY=staging-service-role-key

NEXT_PUBLIC_APP_URL=https://staging.yourdomain.com
NODE_ENV=production
```

---

## Email Verification Configuration

### Critical: Redirect URL Alignment

The redirect URL must match your deployment domain.

#### Step 1: Get Your App URL

For Vercel deployment, visit your project settings to find the domain.

#### Step 2: Set Redirect URLs in Supabase

1. Go to **Authentication → URL Configuration**
2. Add all possible redirect URLs:

**Production**:

```
https://yourdomain.com/auth/callback
https://yourdomain.com/login
https://yourdomain.com/dashboard
```

**Staging** (if applicable):

```
https://staging.yourdomain.com/auth/callback
https://staging.yourdomain.com/login
https://staging.yourdomain.com/dashboard
```

**Local Development** (for testing):

```
http://localhost:3000/auth/callback
http://localhost:3000/login
http://localhost:3000/dashboard
```

#### Step 3: Configure Email Template

1. Go to **Authentication → Email Templates**
2. Click "Confirm signup" template
3. Verify the URL contains: `{{ .ConfirmationURL }}`
4. The template should reference: `{{ .SiteURL }}/auth/callback`

Supabase will automatically replace `{{ .SiteURL }}` with the correct base URL.

#### Step 4: Test Email Verification

1. Sign up with a test email
2. Check email verification link
3. Verify it redirects to the correct domain, not localhost

---

## Database Permissions & RLS

### Public Access Setup

```sql
-- Services: Public can read
CREATE POLICY "allow_public_read" ON services
  FOR SELECT
  USING (true);

-- Projects: Public can read
CREATE POLICY "allow_public_read" ON projects
  FOR SELECT
  USING (true);

-- Leads: Public can insert (form submissions)
CREATE POLICY "allow_public_insert" ON leads
  FOR INSERT
  WITH CHECK (true);
```

### Admin-Only Operations

```sql
-- Packages: Only admins can modify
CREATE POLICY "admin_only_write" ON packages
  FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin');

-- Only admins can delete leads
CREATE POLICY "admin_delete_leads" ON leads
  FOR DELETE
  USING (auth.jwt() ->> 'role' = 'admin');
```

### Verify RLS is Active

Run this query to check:

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

All should show `rowsecurity = true`.

---

## Monitoring & Debugging

### Production Error Tracking

#### Using Supabase Logs

1. Go to **Settings → Logs**
2. Check for auth errors, API errors
3. Filter by error level

#### Common Production Errors

| Error                         | Cause                | Fix                                      |
| ----------------------------- | -------------------- | ---------------------------------------- |
| `Invalid email or password`   | Wrong credentials    | User needs to verify email first         |
| `Email not verified`          | Sign-up incomplete   | Resend verification email                |
| `Redirect URL not recognized` | Domain mismatch      | Update URL Configuration in Supabase     |
| `RLS policy violation`        | Policy blocks access | Check RLS policies match your data model |

### Monitoring Checklist

- [ ] Set up error tracking (e.g., Sentry)
- [ ] Monitor authentication failures
- [ ] Track API response times
- [ ] Alert on database errors
- [ ] Review logs weekly

### Test Production Configuration

Before going live:

1. **Test Email Verification**:
   - Sign up with a real email
   - Verify the link works
   - Confirm redirect is correct

2. **Test Login Flow**:
   - Login with verified account
   - Logout and re-login
   - Verify session persists

3. **Test Data Access**:
   - Load homepage (public data)
   - Access authenticated pages
   - Check admin features

---

## Hosting Platform Specifics

### Vercel Deployment

1. Go to **Settings → Environment Variables**
2. Add for Production:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL=https://your-project.vercel.app`
3. Deploy (automatic on main branch push)

### Netlify Deployment

1. Go to **Site Settings → Build & Deploy → Environment**
2. Add production environment variables
3. Update domain in Supabase redirect URLs

### Custom Domain

If using a custom domain:

1. Update `NEXT_PUBLIC_APP_URL=https://yourdomain.com`
2. Add to Supabase URL Configuration:
   ```
   https://yourdomain.com/auth/callback
   https://yourdomain.com/login
   https://yourdomain.com/dashboard
   ```
3. Update email template if customizing

---

## Rollback Procedure

If something goes wrong in production:

1. **Revert Code**:

   ```bash
   git revert <commit-hash>
   git push origin main
   # Hosting will auto-deploy or manually trigger deploy
   ```

2. **Rollback Environment Variables**:
   - Switch to previous Supabase project credentials
   - Update hosting platform env vars
   - Verify domain/redirect URLs

3. **Database Rollback**:
   - Restore from backup in Supabase
   - Test on staging first
   - Minimal data loss if daily backups enabled

---

## Post-Deployment Tasks

- [ ] Verify email verification works
- [ ] Test signup → email → verification → login flow
- [ ] Monitor error logs for 24 hours
- [ ] Conduct smoke testing on all major features
- [ ] Get user feedback on authentication flow
- [ ] Document any issues found
- [ ] Update runbooks for operations team

---

## Support & Troubleshooting

If users report issues:

1. **Check Supabase Logs**:
   - Go to **Settings → Logs** in Supabase dashboard
   - Search for user email or error message

2. **Common User Issues**:
   - "I didn't get the email" → Check spam, resend
   - "Link expired" → Send new verification email
   - "Can't login" → Check account verified

3. **Escalation**:
   - Enable debug mode: set `NODE_ENV=development` temporarily
   - Check browser dev console for detailed errors
   - Contact Supabase support if database issue

---

## Resources

- [Vercel + Supabase Integration](https://vercel.com/marketplace/integrations/supabase)
- [Supabase Pricing & Limits](https://supabase.com/pricing)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Production Readiness Checklist](https://supabase.com/docs/guides/platform/going-into-production)
