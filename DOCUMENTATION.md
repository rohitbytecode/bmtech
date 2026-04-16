# 📖 Documentation Index

This folder contains comprehensive guides for the BMTech Supabase integration. **Start here!**

## Quick Navigation

### For Developers

1. **[SUPABASE_INTEGRATION.md](SUPABASE_INTEGRATION.md)** - Complete technical architecture
   - Authentication flow
   - Database schema
   - RLS policies
   - Email verification
   - API integration

2. **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Production setup
   - Environment configuration
   - Email redirect URLs
   - Database permissions
   - Monitoring

3. **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Quick problem solver
   - Common issues
   - Debugging techniques
   - Error messages explained

4. **[SUPABASE_SETUP.md](SUPABASE_SETUP.md)** - Initial setup
   - Quick SQL table creation
   - Auth provider setup
   - Database seeding

### For Operations/DevOps

- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Production checklist
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Debugging procedures
- Emergency contacts & escalation

---

## Architecture Overview

```
User's Browser
     ↓
Next.js Frontend (login, signup, dashboard)
     ↓
Supabase Auth (email/password verification)
     ↓
PostgreSQL Database (RLS protected)
     ↓
Supabase API
```

### Key Components

| Component                 | Purpose                                | Config Location                                 |
| ------------------------- | -------------------------------------- | ----------------------------------------------- |
| **Auth**                  | User signup, login, email verification | Supabase Dashboard                              |
| **Database**              | Services, projects, packages, leads    | `SUPABASE_SETUP.md`                             |
| **RLS Policies**          | Data access control                    | Supabase Dashboard                              |
| **Environment Variables** | App configuration                      | `.env.local`, `.env`                            |
| **Email Verification**    | Confirmation links                     | [Email Verification Guide](#email-verification) |

---

## Getting Started (5 Minutes)

### 1. Setup Environment

```bash
# Copy template
cp .env.example .env.local

# Fill in your Supabase credentials
# Get them from Supabase Dashboard → Settings → API
```

### 2. Initialize Database

```bash
# Go to Supabase Dashboard → SQL Editor
# Run SQL from: SUPABASE_SETUP.md
# Creates tables: services, projects, packages, leads, maintenance_plans
```

### 3. Enable Authentication

```bash
# In Supabase Dashboard → Authentication → URL Configuration
# Add redirect URL: http://localhost:3000/auth/callback
```

### 4. Test the App

```bash
npm install
npm run dev
# Visit http://localhost:3000
# Try signing up!
```

---

## Email Verification Setup

### Critical Configuration

**This is the most common issue!** Follow exactly:

1. **Set Environment Variable** (.env.local):

   ```
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

2. **Update Supabase** (Supabase Dashboard):
   - Go to **Authentication → URL Configuration**
   - Add: `http://localhost:3000/auth/callback`

3. **Test End-to-End**:
   - Sign up with email
   - Check inbox for confirmation
   - Click link → should go to `http://localhost:3000` domain
   - Should be logged in

### For Production

Update when deploying:

1. Change `NEXT_PUBLIC_APP_URL=https://yourdomain.com`
2. Add to Supabase URL Configuration:
   ```
   https://yourdomain.com/auth/callback
   https://yourdomain.com/login
   https://yourdomain.com/dashboard
   ```
3. Redeploy

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md#email-verification-configuration) for details.

---

## Project Structure

```
app/
├── page.tsx                    # Homepage
├── signup/
│   └── page.tsx               # Signup form (email verification)
├── login/
│   └── LoginForm.tsx           # Login form
├── dashboard/
│   └── page.tsx               # Protected: authenticated users only
├── unauthorized/
│   └── page.tsx               # Access denied page
└── api/
    ├── submit-lead/route.ts   # Lead submission API
    └── auth/callback/route.ts # Email verification callback

components/
├── AuthGuard.tsx              # Protect routes with auth
├── services/
│   └── authService.ts         # Supabase auth methods
hooks/
├── useAuth.ts                 # Auth state management
lib/
├── supabaseClient.ts          # Supabase configuration
├── appUrl.ts                  # URL utilities
└── utils.ts
```

---

## Common Tasks

### Add a Protected Page

```typescript
// app/admin/page.tsx
import AuthGuard from '@/components/AuthGuard';

export default function AdminPage() {
  return (
    <AuthGuard allowedRoles={['admin']}>
      <h1>Admin Dashboard</h1>
    </AuthGuard>
  );
}
```

### Check User Authentication

```typescript
// In any component
import { useAuth } from '@/hooks/useAuth';

export default function MyComponent() {
  const { user, isAuthenticated, role } = useAuth();

  if (!isAuthenticated) return <p>Please log in</p>;
  return <p>Welcome {user?.email}!</p>;
}
```

### Submit Data with API

```typescript
// In form handler
const response = await fetch('/api/submit-lead', {
  method: 'POST',
  body: JSON.stringify({
    name: 'John',
    email: 'john@example.com',
    message: 'Hello',
    service_id: 'uuid-here',
  }),
});
```

---

## Environment Variables Explained

| Variable                         | Where                    | Purpose                   |
| -------------------------------- | ------------------------ | ------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`       | Supabase Dashboard → API | Supabase project URL      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`  | Supabase Dashboard → API | Public API key            |
| `NEXT_SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → API | **SECRET** - server only  |
| `NEXT_PUBLIC_APP_URL`            | .env.local               | Your app's domain         |
| `NODE_ENV`                       | .env                     | development or production |

**⚠️ Security**: Never commit `.env` file or expose service role key.

---

## Testing Checklist

Before deploying:

- [ ] User can sign up with email
- [ ] Verification email is received
- [ ] Email link redirects to correct domain
- [ ] User can log in after verification
- [ ] Protected pages require authentication
- [ ] Can submit contact form
- [ ] Data appears in Supabase dashboard
- [ ] Session persists after page reload
- [ ] Logout clears session

---

## Performance Tips

1. **Enable RLS indexes**:

   ```sql
   CREATE INDEX idx_leads_service ON leads(service_id);
   ```

2. **Use select() efficiently**:

   ```typescript
   // Good: fetch only needed columns
   supabase.from('services').select('id, name, price').limit(10);
   ```

3. **Enable caching**:
   ```typescript
   // Supabase automatically caches with proper headers
   ```

---

## Security Checklist

- [ ] `.env` files in `.gitignore`
- [ ] No hardcoded URLs (use `NEXT_PUBLIC_APP_URL`)
- [ ] Service role key never in frontend
- [ ] RLS policies enabled on all tables
- [ ] HTTPS enforced in production
- [ ] Secrets rotated after deployment
- [ ] Regular backups configured

---

## Troubleshooting Quick Links

| Issue                          | Guide                                                                            |
| ------------------------------ | -------------------------------------------------------------------------------- |
| Email verification not working | [TROUBLESHOOTING.md](TROUBLESHOOTING.md#email-verification-link-not-working)     |
| Can't sign up                  | [TROUBLESHOOTING.md](TROUBLESHOOTING.md#cant-sign-up---email-already-registered) |
| Data access denied             | [TROUBLESHOOTING.md](TROUBLESHOOTING.md#cant-see-data-from-tables)               |
| API returns 500                | [TROUBLESHOOTING.md](TROUBLESHOOTING.md#submit-lead-api-returns-500-error)       |
| Deployment issues              | [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md#rollback-procedure)                    |

---

## Useful Links

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Tutorial for Next.js](https://supabase.com/docs/guides/getting-started/nextjs)
- [Auth Best Practices](https://supabase.com/docs/guides/auth)

---

## Getting Help

1. **Check documentation**: Start with guides in this folder
2. **Search issues**: GitHub, Discord, Stack Overflow
3. **Check logs**: Supabase Dashboard → Settings → Logs
4. **Contact support**: Through Supabase dashboard

---

## Updates & Maintenance

| Task                | Frequency | Owner         |
| ------------------- | --------- | ------------- |
| Review error logs   | Daily     | DevOps        |
| Database backups    | Automatic | Supabase      |
| Update dependencies | Monthly   | Dev team      |
| Security audit      | Quarterly | Security team |
| Performance review  | Monthly   | DevOps        |

---

## Documentation Versions

| Version | Date     | Changes                           |
| ------- | -------- | --------------------------------- |
| 1.0     | Jan 2025 | Initial release - complete guides |

---

**Need updates?** This documentation should be kept current as features change. Last updated: January 2025
