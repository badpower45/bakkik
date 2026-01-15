# Evolution Championship Backend API

🥊 Backend API for Evolution Championship MMA App - Built with Next.js 14, TypeScript, and Supabase.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-green)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://vercel.com/)

## 🚀 Quick Start

### For Deployment (Vercel)
```bash
# Quick setup and deploy
./setup-vercel.sh

# Or manually
npm install
npm run build
vercel --prod
```

📖 **Full deployment guide:** See [QUICK_DEPLOY.md](./QUICK_DEPLOY.md)

### For Local Development
```bash
npm install
cp .env.example .env.local
# Edit .env.local with your credentials
npm run dev
```

---

## 🏗️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Next.js 14** | App Router Framework |
| **TypeScript** | Type-safe Development |
| **Supabase** | PostgreSQL Database + Auth |
| **Vercel** | Serverless Deployment |
| **Zod** | Input Validation |
| **JWT** | Token-based Auth |
| **Paymob** | Payment Gateway |
| **QRCode** | Ticket Generation |

---

## 📊 API Overview

### Total Endpoints: **46 APIs**

#### Authentication (5 endpoints)
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/reset-password` - Reset password

#### Events (5 endpoints)
- `GET /api/events` - List all events
- `GET /api/events/:id` - Get event details
- `GET /api/events/next` - Get next event
- `GET /api/events/:id/ticket-types` - Get ticket types
- `GET /api/events/:id/registrations` - Get registrations

#### Fighters (4 endpoints)
- `GET /api/fighters` - List all fighters
- `GET /api/fighters/:id` - Get fighter details
- `GET /api/fighters/champions` - Get champions
- `POST /api/fighters/register` - Register as fighter

#### Fights (2 endpoints)
- `GET /api/fights` - List all fights
- `GET /api/fights/latest` - Get latest fights

#### Tickets & Orders (6 endpoints)
- `GET /api/tickets` - User's tickets
- `GET /api/tickets/:id` - Ticket details
- `POST /api/checkout/tickets` - Purchase tickets
- `POST /api/checkout/ppv` - Purchase PPV
- `GET /api/orders` - User's orders
- `GET /api/orders/:id` - Order details

#### Streaming (3 endpoints)
- `POST /api/streaming/auth` - Streaming authentication
- `POST /api/streaming/verify` - Verify access
- `POST /api/streaming/heartbeat` - Keep-alive

#### Media & Content (5 endpoints)
- `GET /api/media` - Media content
- `GET /api/news` - News articles
- `GET /api/news/:id` - News details
- `GET /api/banners` - Banners
- `GET /api/weight-classes` - Weight classes

#### Manager (3 endpoints)
- `POST /api/manager/check-in` - Manager check-in
- `POST /api/manager/scan` - Scan QR code
- `GET /api/manager/event/:eventId` - Event data

#### Admin Panel (12 endpoints)
Events, Fighters, Fights, News, Banners management

#### Webhooks & Utility (2 endpoints)
- `POST /api/webhooks/paymob` - Payment webhook
- `GET /api/health` - Health check

---

## 📁 Project Structure

```
backend/
├── app/
│   ├── api/                      # API Routes (46 endpoints)
│   │   ├── auth/                 # Authentication
│   │   ├── events/               # Events management
│   │   ├── fighters/             # Fighters management
│   │   ├── fights/               # Fights data
│   │   ├── tickets/              # Ticketing system
│   │   ├── orders/               # Order management
│   │   ├── checkout/             # Payment checkout
│   │   ├── streaming/            # Live streaming
│   │   ├── media/                # Media content
│   │   ├── news/                 # News articles
│   │   ├── banners/              # Banners
│   │   ├── manager/              # Manager portal
│   │   ├── admin/                # Admin panel
│   │   ├── webhooks/             # Payment webhooks
│   │   ├── weight-classes/       # Weight classes
│   │   └── health/               # Health check
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── lib/
│   ├── supabase/                 # Supabase clients
│   ├── services/                 # Business logic
│   │   ├── payment.service.ts
│   │   ├── order.service.ts
│   │   ├── streaming.service.ts
│   │   └── qr.service.ts
│   ├── middleware/               # Middleware
│   │   ├── auth.ts
│   │   ├── admin.ts
│   │   └── error.ts
│   ├── validators/               # Input validators
│   ├── utils/                    # Utilities
│   ├── auth.ts                   # Auth helpers
│   └── response.ts               # API responses
├── .env.example                  # Environment template
├── .gitignore                    # Git ignore
├── .vercelignore                 # Vercel ignore
├── next.config.ts                # Next.js config
├── tsconfig.json                 # TypeScript config
├── vercel.json                   # Vercel config
├── package.json                  # Dependencies
├── QUICK_DEPLOY.md              # Deployment guide
├── DEPLOYMENT.md                # Detailed deployment
└── setup-vercel.sh              # Setup script

---

## 🔧 Environment Variables

Required variables (see [.env.example](./.env.example)):

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# JWT (Required)
JWT_SECRET=your_jwt_secret

# Paymob (Optional - for payments)
PAYMOB_API_KEY=your_api_key
PAYMOB_INTEGRATION_ID=your_integration_id
PAYMOB_IFRAME_ID=your_iframe_id
PAYMOB_HMAC_SECRET=your_hmac_secret

# Streaming (Optional)
STREAMING_SECRET_KEY=your_streaming_secret
```

---

## 🌐 Deployment

### Vercel (Production) - Recommended

1. **Via Dashboard**
   - Visit [vercel.com/new](https://vercel.com/new)
   - Import repository
   - Set Root Directory: `backend`
   - Add environment variables (see below)
   - Deploy!

2. **Via CLI**
   ```bash
   ./setup-vercel.sh
   # Or manually
   vercel --prod
   ```

**Environment Variables to add in Vercel:**
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
JWT_SECRET
PAYMOB_API_KEY (optional)
PAYMOB_INTEGRATION_ID (optional)
PAYMOB_IFRAME_ID (optional)
PAYMOB_HMAC_SECRET (optional)
STREAMING_SECRET_KEY (optional)
```

📖 **Detailed guide:** [QUICK_DEPLOY.md](./QUICK_DEPLOY.md)

---

## 🛠️ Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Set up Environment
```bash
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
```

### 3. Run Development Server
```bash
npm run dev
```

API will be available at: `http://localhost:3000`

---

## 🧪 Testing the API

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Test Authentication
```bash
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## 📡 Complete API Documentation

### Authentication Endpoints

#### POST `/api/auth/signup`
Register new user
```json
{
  "name": "Ahmed Mohamed",
  "email": "ahmed@example.com",
  "password": "password123",
  "phone": "+201234567890",
  "userType": "fan"
}
```

#### POST `/api/auth/signin`
Sign in
```json
{
  "email": "ahmed@example.com",
  "password": "password123"
}
```

#### POST `/api/auth/reset-password`
Reset password
```json
{
  "email": "ahmed@example.com"
}
```

#### GET `/api/auth/me`
Get current user (requires auth header)
```
Authorization: Bearer <token>
```

---

### Events

#### GET `/api/events`
Get all events
- Query params: `status`, `limit`, `offset`

#### GET `/api/events/next`
Get next upcoming event

#### GET `/api/events/[id]`
Get event details with fights, tickets, sponsors

---

### Fighters

#### GET `/api/fighters`
Get all fighters
- Query params: `weightClassId`, `status`, `limit`, `offset`

#### GET `/api/fighters/champions`
Get current champions for all weight classes

#### GET `/api/fighters/[id]`
Get fighter profile with fight history and media

---

### Media

#### GET `/api/media`
Get media (photos/videos)
- Query params: `type` (photo/video), `featured`, `limit`, `offset`

---

### Weight Classes

#### GET `/api/weight-classes`
Get all weight classes

---

## 🔐 Authentication

All protected endpoints require JWT token in header:

```
Authorization: Bearer <your-token>
```

Token is returned from `/api/auth/signup` and `/api/auth/signin`

## 🚢 Deploy to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial backend setup"
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [Vercel](https://vercel.com)
2. Click **New Project**
3. Import your GitHub repository
4. Set **Root Directory** to `backend`
5. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `JWT_SECRET`
6. Click **Deploy**

### 3. Get API URL

After deployment, your API will be available at:
```
https://your-project.vercel.app
```

Update Flutter app to use this URL.

## 🧪 Testing

Test health endpoint:
```bash
curl https://your-api.vercel.app/api/health
```

Expected response:
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "message": "Evolution Championship API is running",
    "timestamp": "2026-01-12T..."
  }
}
```

## 📊 Database Schema

### Main Tables
- `users` - User accounts
- `fighters` - Fighter profiles
- `events` - MMA events
- `fights` - Individual fights
- `weight_classes` - 9 weight divisions
- `tickets` - Ticket purchases
- `ppv_purchases` - PPV stream purchases
- `media` - Photos and videos
- `news` - News articles

### Views
- `upcoming_events_summary` - Events with fight count
- `fighter_rankings` - Fighters ranked by wins
- `current_champions` - Champions for each weight class

## 🔒 Security Features

- Row Level Security (RLS) enabled on all tables
- JWT authentication
- API input validation with Zod
- CORS configuration
- Secure password hashing (Supabase Auth)
- Role-based access control (fan/fighter/admin)

## 📝 Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": { ... }
}
```

## 🌍 CORS Configuration

API accepts requests from any origin (configured in `next.config.js`). For production, update to allow only your Flutter app domain.

## 📞 Support

For issues or questions, contact the development team.

---

**Last Updated:** January 12, 2026  
**Version:** 1.0.0
