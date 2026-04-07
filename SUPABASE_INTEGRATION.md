# Supabase Integration Documentation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Environment Setup](#environment-setup)
3. [Authentication Configuration](#authentication-configuration)
4. [Database Schema](#database-schema)
5. [Row Level Security (RLS)](#row-level-security-rls)
6. [Email Verification & Redirects](#email-verification--redirects)
7. [API Integration](#api-integration)
8. [Troubleshooting](#troubleshooting)
9. [Pending Setup Tasks](#pending-setup-tasks)
10. [Common Pitfalls](#common-pitfalls)

---

## Architecture Overview

This application uses Supabase as the backend-as-a-service (BaaS) provider for:
- **Authentication**: Email/password signup and login, with email verification
- **Database**: PostgreSQL for storing services, projects, packages, leads, and maintenance plans
- **Row Level Security**: Policies to control data access at the database level
- **Authorization**: Role-based access control (admin, team, client)

### Technology Stack
- **Frontend**: Next.js 16+ with TypeScript
- **Auth**: Supabase Auth with email verification
- **Database**: Supabase PostgreSQL
- **Client Library**: @supabase/supabase-js v2+

---

## Environment Setup

### 1. Development Environment

Create a `.env.local` file in the project root:

```bash
# Supabase credentials (from Supabase dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Application URL (for email redirects and OAuth callbacks)
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 2. Production Environment

For production deployment, set these environment variables in your hosting platform:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# CRITICAL: Set this to your production domain
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
```

### 3. Getting Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings → API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon Key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service Role Key** → `NEXT_SUPABASE_SERVICE_ROLE_KEY`

> **Security Note**: Never commit `.env.local` or expose the service role key in client-side code.

---

## Authentication Configuration

### 1. Enable Email/Password Authentication

1. Go to **Authentication → Providers** in Supabase dashboard
2. Enable **Email** provider (enabled by default)
3. Configure email settings:
   - **Email Confirmations**: Enabled
   - **Email Verification**: Enabled
   - **Autoconfirm Users**: Disabled (unless development)

### 2. Configure Redirect URLs

**This is critical for email verification links!**

1. Navigate to **Authentication → URL Configuration** in Supabase dashboard
2. Add **Redirect URLs**:

#### Development
```
http://localhost:3000/auth/callback
http://localhost:3000/login
http://localhost:3000/dashboard
```

#### Production
```
https://yourdomain.com/auth/callback
https://yourdomain.com/login
https://yourdomain.com/dashboard
```

### 3. Email Templates

Supabase provides default email templates. To customize:

1. Go to **Authentication → Email Templates**
2. Customize the "Confirm signup" template:
   - The `{{ .ConfirmationURL }}` placeholder must be preserved
   - Ensure it points to `{{ .SiteURL }}/auth/callback`
3. Test by sending a test email

### 4. User Metadata & Roles

When a user signs up, their role is stored in `user_metadata`:

```typescript
// In authService.ts signUp function
await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      role: 'client', // or 'admin', 'team'
    },
  },
});
```

Access user role in your app:
```typescript
const role = user?.user_metadata?.role || 'client';
```

---

## Database Schema

### Tables Overview

#### 1. **services**
- `id` (UUID, primary key)
- `name` (TEXT)
- `description` (TEXT)
- `price` (NUMERIC)
- `icon` (TEXT)
- `created_at` (TIMESTAMP)

#### 2. **projects**
- `id` (UUID, primary key)
- `title` (TEXT)
- `category` (TEXT)
- `image` (TEXT)
- `link` (TEXT)
- `client_id` (UUID, foreign key)
- `status` (TEXT, default: 'Active')
- `created_at` (TIMESTAMP)

#### 3. **packages**
- `id` (TEXT, primary key)
- `name` (TEXT)
- `price` (TEXT)
- `features` (JSONB)
- `highlighted` (BOOLEAN)
- `created_at` (TIMESTAMP)

#### 4. **maintenance_plans**
- `id` (TEXT, primary key)
- `name` (TEXT)
- `price` (TEXT)
- `features` (JSONB)
- `created_at` (TIMESTAMP)

#### 5. **leads**
- `id` (UUID, primary key)
- `name` (TEXT)
- `email` (TEXT)
- `service_id` (UUID, foreign key to services)
- `message` (TEXT)
- `status` (TEXT, default: 'new')
- `created_at` (TIMESTAMP)

### Quick Setup

Run this SQL in **Supabase Dashboard → SQL Editor**:

```sql
-- 1. Create Services Table
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Projects Table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    category TEXT,
    image TEXT,
    link TEXT,
    client_id UUID,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Packages Table
CREATE TABLE packages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price TEXT,
    features JSONB,
    highlighted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Maintenance Plans Table
CREATE TABLE maintenance_plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price TEXT,
    features JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Leads Table
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT,
    service_id UUID REFERENCES services(id),
    message TEXT,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

---

## Row Level Security (RLS)

RLS ensures data is accessed only by authorized users. **Enable RLS on all tables.**

### Public Read Access (for frontend visitors)

```sql
-- Allow public "Read" access for frontend visitors
CREATE POLICY "Public Read Access" ON services FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON projects FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON packages FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON maintenance_plans FOR SELECT USING (true);

-- Allow public viewers to submit "Leads" via the contact form
CREATE POLICY "Public Insert Leads" ON leads FOR INSERT WITH CHECK (true);
```

### Admin-Only Access

```sql
-- Only authenticated admins can update services
CREATE POLICY "Admin Update Services" ON services 
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL AND auth.jwt() ->> 'role' = 'admin');

-- Only authenticated admins can delete leads
CREATE POLICY "Admin Delete Leads" ON leads 
  FOR DELETE 
  USING (auth.uid() IS NOT NULL AND auth.jwt() ->> 'role' = 'admin');
```

### Verify RLS is Enabled

1. Go to **Database → Tables**
2. For each table, ensure **RLS Enabled** is toggled ON
3. Check policies under **Authentication → Policies**

---

## Email Verification & Redirects

### How Email Verification Works

1. User signs up → Supabase sends a confirmation email
2. Email contains a link to `{{ .SiteURL }}/auth/callback?code=...&type=signup`
3. Frontend calls `supabase.auth.exchangeCodeForSession(code)`
4. User session is established → redirect to dashboard

### Redirect URL Configuration

The **critical** environment variable is `NEXT_PUBLIC_APP_URL`:

```
Development: http://localhost:3000
Production: https://yourdomain.com
```

**Both the frontend code and Supabase dashboard must use the same base URL.**

### Testing Email Verification

1. Sign up on the app
2. Check email for confirmation link
3. Click link → should redirect to dashboard
4. If it redirects to `http://localhost:3000`, the URL configuration is misaligned

### Email Template Customization

1. Go to **Authentication → Email Templates**
2. Click **Confirm signup** template
3. Make sure the URL includes: `{{ .SiteURL }}/auth/callback`
4. Supabase will replace `{{ .SiteURL }}` with your configured site URL

---

## API Integration

### Submit Lead API

**Endpoint**: `POST /api/submit-lead`

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "I'm interested in your services",
  "service_id": "UUID-of-service"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "UUID",
    "name": "John Doe",
    "email": "john@example.com",
    "message": "...",
    "status": "new",
    "created_at": "2025-01-01T12:00:00Z"
  }
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Name, email, and message are required."
}
```

### Authentication API

**Sign Up**:
```typescript
const { data, error } = await authService.signUp(
  'user@example.com',
  'password123',
  'client' // role: 'admin' | 'team' | 'client'
);
```

**Sign In**:
```typescript
const { data, error } = await authService.signIn(
  'user@example.com',
  'password123'
);
```

**Sign Out**:
```typescript
const { error } = await authService.signOut();
```

**Get Current User**:
```typescript
const { user, session } = useAuth();
```

---

## Troubleshooting

### Email Verification Link is Broken

**Symptom**: Email link redirects to `http://localhost:3000` instead of your domain.

**Solutions**:
1. Verify `NEXT_PUBLIC_APP_URL` is set in `.env`
2. Check Supabase **Authentication → URL Configuration** has the correct redirect URLs
3. Ensure both the app and Supabase use the same base URL
4. Clear browser cache and try again

### Users Can't Sign Up

**Checks**:
- Is the Email provider enabled in **Authentication → Providers**?
- Are there RLS policies blocking the auth schema?
- Check browser console for error messages

### "Session not found" Error

**Cause**: Email token has expired or is invalid.

**Solutions**:
- Request a new sign-up link
- Check email client's spam folder
- Verify email forwarding rules

### RLS Policy Blocking Reads

**Symptom**: Frontend can't fetch data from tables.

**Solutions**:
1. Ensure RLS is enabled with proper policies
2. For public read access, use `USING (true)`
3. Test policies with `--` prefixed comments

```sql
-- Test: Should return data
SELECT * FROM services;

-- This runs as anon user, should work with RLS policy
```

### Service Role Key Not Working

**Issue**: `NEXT_SUPABASE_SERVICE_ROLE_KEY` causes 401/403 errors.

**Check**:
- key is properly copied from Supabase dashboard
- Never expose in frontend code (server-side only)
- Used only for admin operations via API routes

---

## Pending Setup Tasks

### ✅ Completed
- [x] Supabase project created
- [x] Environment variables configured
- [x] Database tables created
- [x] RLS policies for public read access
- [x] Email authentication enabled
- [x] Auth callback route implemented

### ⏳ Recommended for Later
- [ ] Custom email templates (branded confirmation emails)
- [ ] Social authentication (Google, GitHub OAuth)
- [ ] Advanced RLS policies (user-scoped data access)
- [ ] Database backups and disaster recovery
- [ ] Audit logging for security events
- [ ] Analytics integration (PostHog, Mixpanel)
- [ ] Testing email verification in production

---

## Common Pitfalls

### 1. Hardcoded URLs
❌ **Bad**: `const verifyUrl = 'http://localhost:3000/verify'`
✅ **Good**: `const verifyUrl = getEmailVerificationUrl()`

Use the `lib/appUrl.ts` utility for all URL generation.

### 2. Mixing Development & Production Credentials
❌ Don't use production DB credentials in development
✅ Create separate Supabase projects for dev & prod

### 3. Service Role Key in Browser
❌ Never use `NEXT_SUPABASE_SERVICE_ROLE_KEY` in client code
✅ Use only in `/app/api/` routes (server-side)

### 4. Missing RLS Policies
❌ Tables without RLS are vulnerable
✅ Always enable RLS with explicit policies

### 5. Forgetting to Update Redirect URLs
❌ Leaving Supabase with `localhost:3000` when deploying to production
✅ Update **Authentication → URL Configuration** for each environment

### 6. Email Template Issues
❌ Removing `{{ .ConfirmationURL }}` placeholder
✅ Keep the placeholder and customize only the styling/text

---

## Production Checklist

Before deploying to production:

- [ ] Update `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Update Supabase **URL Configuration** with production redirect URLs
- [ ] Review and test all RLS policies
- [ ] Enable email confirmations
- [ ] Test email verification end-to-end
- [ ] Set up custom email domain (optional, recommended)
- [ ] Enable HTTPS (required for production)
- [ ] Configure backup and recovery plan
- [ ] Set up monitoring and error tracking
- [ ] Document any custom configurations

---

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Next.js Supabase Integration](https://supabase.com/docs/guides/getting-started/nextjs)
- [RLS Policies Guide](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase API Reference](https://supabase.com/docs/reference/javascript/introduction)
