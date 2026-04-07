# SUPABASE_SETUP.md

## 📚 Important: Read These Guides First

Before you start, familiarize yourself with:
- **[SUPABASE_INTEGRATION.md](SUPABASE_INTEGRATION.md)** - Complete integration architecture and best practices
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Production deployment and configuration

This document covers the quick SQL setup. For detailed configuration, authentication, and RLS policies, see the guides above.

---

## 🧱 Project Setup

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create new project
3. Copy your project credentials:
   - **Project URL**
   - **Anon Public Key**
   - **Service Role Key**

---

## 🔐 Authentication Setup

### Email Verification (Critical!)

**Important**: Configure redirect URLs BEFORE testing email verification.

1. Go to **Authentication → URL Configuration**
2. Add your redirect URLs:
   - **Development**: `http://localhost:3000/auth/callback`
   - **Production**: `https://yourdomain.com/auth/callback`
3. Enable **Email** provider (enabled by default)
4. Ensure **Email Confirmations** is enabled

See [Email Verification Troubleshooting](SUPABASE_INTEGRATION.md#email-verification--redirects) for details.

---

## 🗄️ Database Tables (Quick SQL Setup)

Instead of manually creating columns through the Table Editor, the easiest way is to run a SQL script!

1. Go to your **Supabase dashboard** -> **SQL Editor** -> **New Query**.
2. Copy and paste the entire block below and hit **Run**.

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

-- ====== SEEDING MOCK DATA ====== --

-- Seed Services
INSERT INTO services (name, description, icon, price) VALUES 
('Graphics Design', 'Visual identities, branding, and high-end marketing materials.', 'Palette', 500),
('Video & Content', 'Engaging video production and content strategy for brands.', 'Video', 1200),
('IT Services', 'Custom software development, cloud solutions, and IT support.', 'Code2', 2500),
('Social Media', 'Strategy, management, and growth for your social presence.', 'Share2', 800);

-- Seed Projects
INSERT INTO projects (title, category, image, link) VALUES 
('Modern E-commerce', 'IT Services', 'https://images.unsplash.com/photo-1557821552-17105176677c?w=800&q=80', '#'),
('Brand Identity', 'Graphics Design', 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&q=80', '#'),
('Viral Marketing Campaign', 'Social Media', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80', '#'),
('Corporate Video', 'Video & Content', 'https://images.unsplash.com/photo-1492724441997-5dc865305da7?w=800&q=80', '#');

-- Seed Packages
INSERT INTO packages (id, name, price, features, highlighted) VALUES 
('starter', 'Starter', '$499', '["Basic Design", "Social Setup", "SEO Basics"]', false),
('growth', 'Growth', '$999', '["Full Branding", "Content Creation", "Advanced SEO", "IT Support"]', true),
('full-setup', 'Full Setup', '$1999', '["All-in-one", "Monthly Support", "Priority Updates", "Full IT Suite"]', false);

-- Seed Maintenance Plans
INSERT INTO maintenance_plans (id, name, price, features) VALUES 
('basic', 'Basic', '$99/mo', '["Security Updates", "Weekly Backups", "Bug Fixes"]'),
('standard', 'Standard', '$199/mo', '["Daily Backups", "Performance Tuning", "Monthly Report"]'),
('premium', 'Premium', '$399/mo', '["24/7 Support", "Zero Downtime", "Priority Dev Access"]');
```

---

## 🔐 ROW LEVEL SECURITY (IMPORTANT)

Enable RLS on all tables so unauthorized requests are securely handled. However, to let public visitors view your frontend services without logging in, run this in the SQL Editor to quickly bind read policies:

```sql
-- Allow public "Read" access for frontend visitors
CREATE POLICY "Public Read Access" ON services FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON projects FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON packages FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON maintenance_plans FOR SELECT USING (true);

-- Allow public viewers to submit "Leads" via the contact form
CREATE POLICY "Public Insert Leads" ON leads FOR INSERT WITH CHECK (true);
```
*(You can also configure this manually via **Dashboard -> Authentication -> Policies**)*

---

## 📦 Storage (Optional)

If your frontend eventually uses live image uploads:
1. Go to **Storage -> Create Bucket**
2. Name it `project-images`
3. Set **Public bucket** to enabled.

---

## 🔑 ENV VARIABLES

In the root of your Next.js project, create or update the `.env` or `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

---

## ✅ FINAL CHECKLIST

* [ ] Auth working (Users can sign up/login)
* [ ] All CRUD connected (Frontend renders Supabase data properly via `useData.ts`)
* [ ] No mock data left (We've removed the `lib/data.ts` mock arrays)
* [ ] RLS enabled (Tables are selectively secured, Leads allows form submissions)
* [ ] Env variables set (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
* [ ] Errors handled (`hooks/useData.ts` tracks any failure appropriately)
