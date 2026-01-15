# Evolution Championship - Complete API List

## Total: 46 API Endpoints

---

## 🔐 Authentication (5 endpoints)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/signup` | Register new user | No |
| POST | `/api/auth/signin` | Login user | No |
| POST | `/api/auth/logout` | Logout user | Yes |
| GET | `/api/auth/me` | Get current user | Yes |
| POST | `/api/auth/reset-password` | Reset password | No |

---

## 🎪 Events (5 endpoints)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/events` | List all events | No |
| GET | `/api/events/:id` | Get event details | No |
| GET | `/api/events/next` | Get next event | No |
| GET | `/api/events/:id/ticket-types` | Get ticket types | No |
| GET | `/api/events/:id/registrations` | Get event registrations | No |

---

## 🥊 Fighters (4 endpoints)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/fighters` | List all fighters | No |
| GET | `/api/fighters/:id` | Get fighter details | No |
| GET | `/api/fighters/champions` | Get champions | No |
| POST | `/api/fighters/register` | Register as fighter | Yes |

---

## 💥 Fights (2 endpoints)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/fights` | List all fights | No |
| GET | `/api/fights/latest` | Get latest fights | No |

---

## 🎫 Tickets (3 endpoints)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/tickets` | Get user's tickets | Yes |
| GET | `/api/tickets/:id` | Get ticket details | Yes |
| POST | `/api/checkout/tickets` | Purchase tickets | Yes |

---

## 📦 Orders (3 endpoints)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/orders` | Get user's orders | Yes |
| GET | `/api/orders/:id` | Get order details | Yes |
| POST | `/api/checkout/ppv` | Purchase PPV | Yes |

---

## 📺 Streaming (3 endpoints)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/streaming/auth` | Streaming authentication | Yes |
| POST | `/api/streaming/verify` | Verify streaming access | Yes |
| POST | `/api/streaming/heartbeat` | Keep-alive heartbeat | Yes |

---

## 📰 Media & Content (5 endpoints)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/media` | Get media content | No |
| GET | `/api/news` | Get news articles | No |
| GET | `/api/news/:id` | Get news details | No |
| GET | `/api/banners` | Get banners | No |
| GET | `/api/weight-classes` | Get weight classes | No |

---

## 👨‍💼 Manager (3 endpoints)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/manager/check-in` | Manager check-in | Manager |
| POST | `/api/manager/scan` | Scan QR code | Manager |
| GET | `/api/manager/event/:eventId` | Get event data | Manager |

---

## 👑 Admin - Events (4 endpoints)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/events` | List all events | Admin |
| POST | `/api/admin/events` | Create event | Admin |
| GET | `/api/admin/events/:id` | Get event | Admin |
| PUT | `/api/admin/events/:id` | Update event | Admin |
| DELETE | `/api/admin/events/:id` | Delete event | Admin |
| GET | `/api/admin/events/:id/registrations` | Get registrations | Admin |

---

## 👑 Admin - Fighters (3 endpoints)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/fighters` | List all fighters | Admin |
| POST | `/api/admin/fighters` | Create fighter | Admin |
| GET | `/api/admin/fighters/:id` | Get fighter | Admin |
| PUT | `/api/admin/fighters/:id` | Update fighter | Admin |
| DELETE | `/api/admin/fighters/:id` | Delete fighter | Admin |

---

## 👑 Admin - Fights (3 endpoints)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/fights` | List all fights | Admin |
| POST | `/api/admin/fights` | Create fight | Admin |
| GET | `/api/admin/fights/:id` | Get fight | Admin |
| PUT | `/api/admin/fights/:id` | Update fight | Admin |
| DELETE | `/api/admin/fights/:id` | Delete fight | Admin |

---

## 👑 Admin - News (3 endpoints)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/news` | List all news | Admin |
| POST | `/api/admin/news` | Create news | Admin |
| GET | `/api/admin/news/:id` | Get news | Admin |
| PUT | `/api/admin/news/:id` | Update news | Admin |
| DELETE | `/api/admin/news/:id` | Delete news | Admin |

---

## 👑 Admin - Banners (3 endpoints)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/banners` | List all banners | Admin |
| POST | `/api/admin/banners` | Create banner | Admin |
| GET | `/api/admin/banners/:id` | Get banner | Admin |
| PUT | `/api/admin/banners/:id` | Update banner | Admin |
| DELETE | `/api/admin/banners/:id` | Delete banner | Admin |

---

## 🔗 Webhooks (1 endpoint)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/webhooks/paymob` | Paymob payment webhook | No (Signature) |

---

## 🏥 Utility (1 endpoint)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/health` | Health check | No |

---

## 📝 Notes

- **Auth Required**: Requires Bearer token in Authorization header
- **Admin**: Requires admin user
- **Manager**: Requires manager user
- **Signature**: Webhook requires HMAC signature verification

---

## 🔑 Authentication Header Format

```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 📊 Summary by Category

| Category | Count |
|----------|-------|
| Authentication | 5 |
| Events | 5 |
| Fighters | 4 |
| Fights | 2 |
| Tickets | 3 |
| Orders | 3 |
| Streaming | 3 |
| Media & Content | 5 |
| Manager | 3 |
| Admin | 12 |
| Webhooks | 1 |
| Utility | 1 |
| **TOTAL** | **46** |

---

**Last Updated:** January 16, 2026
