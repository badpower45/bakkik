# Evolution Championship - Backend Deployment Guide

## نشر الباكاند على Vercel

### المتطلبات الأساسية
1. حساب على [Vercel](https://vercel.com)
2. حساب على [Supabase](https://supabase.com) مع المشروع معد بالكامل
3. Vercel CLI مثبت (اختياري للنشر من Terminal)

---

## خطوات النشر على Vercel

### الطريقة الأولى: من خلال Vercel Dashboard (موصى بها)

#### 1. تجهيز المشروع
```bash
cd backend
npm install
npm run build  # تأكد من عدم وجود أخطاء
```

#### 2. رفع على Vercel
1. اذهب إلى [Vercel Dashboard](https://vercel.com/dashboard)
2. اضغط على "Add New Project"
3. استورد المشروع من Git (GitHub/GitLab/Bitbucket)
4. اختر مجلد `backend` كـ Root Directory
5. Framework Preset: **Next.js**
6. اضغط Deploy

#### 3. إعداد Environment Variables
في Vercel Dashboard، اذهب إلى:
- **Settings** → **Environment Variables**

أضف المتغيرات التالية:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT Configuration
JWT_SECRET=your_jwt_secret_here

# Paymob Payment Gateway
PAYMOB_API_KEY=your_paymob_api_key
PAYMOB_INTEGRATION_ID=your_integration_id
PAYMOB_IFRAME_ID=your_iframe_id
PAYMOB_HMAC_SECRET=your_hmac_secret

# Streaming
STREAMING_SECRET_KEY=your_streaming_secret
```

⚠️ **مهم**: تأكد من إضافة المتغيرات في جميع البيئات:
- Production
- Preview
- Development

#### 4. إعادة النشر
بعد إضافة المتغيرات، اذهب إلى:
- **Deployments** → اختر آخر deployment → **Redeploy**

---

### الطريقة الثانية: من خلال Vercel CLI

#### 1. تثبيت Vercel CLI
```bash
npm install -g vercel
```

#### 2. تسجيل الدخول
```bash
vercel login
```

#### 3. النشر
```bash
cd backend
vercel --prod
```

#### 4. إضافة Environment Variables
```bash
# من مجلد backend
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add JWT_SECRET
vercel env add PAYMOB_API_KEY
vercel env add PAYMOB_INTEGRATION_ID
vercel env add PAYMOB_IFRAME_ID
vercel env add PAYMOB_HMAC_SECRET
vercel env add STREAMING_SECRET_KEY
```

---

## اختبار الـ API بعد النشر

### 1. Health Check
```bash
curl https://your-app.vercel.app/api/health
```

يجب أن يرجع:
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "message": "Evolution Championship API is running",
    "timestamp": "2026-01-16T..."
  }
}
```

### 2. اختبار Authentication
```bash
curl -X POST https://your-app.vercel.app/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. قائمة الـ API Endpoints المتاحة

#### Authentication
- `POST /api/auth/signup` - تسجيل مستخدم جديد
- `POST /api/auth/signin` - تسجيل دخول
- `POST /api/auth/logout` - تسجيل خروج
- `GET /api/auth/me` - بيانات المستخدم الحالي
- `POST /api/auth/reset-password` - إعادة تعيين كلمة المرور

#### Events (الفعاليات)
- `GET /api/events` - جميع الفعاليات
- `GET /api/events/:id` - فعالية محددة
- `GET /api/events/next` - الفعالية القادمة
- `GET /api/events/:id/ticket-types` - أنواع التذاكر

#### Fighters (المقاتلين)
- `GET /api/fighters` - جميع المقاتلين
- `GET /api/fighters/:id` - مقاتل محدد
- `GET /api/fighters/champions` - الأبطال
- `POST /api/fighters/register` - تسجيل مقاتل

#### Fights (المباريات)
- `GET /api/fights` - جميع المباريات
- `GET /api/fights/latest` - آخر المباريات

#### Tickets & Orders (التذاكر والطلبات)
- `GET /api/tickets` - تذاكر المستخدم
- `GET /api/tickets/:id` - تذكرة محددة
- `POST /api/checkout/tickets` - شراء تذاكر
- `POST /api/checkout/ppv` - شراء PPV
- `GET /api/orders` - طلبات المستخدم
- `GET /api/orders/:id` - طلب محدد

#### Streaming (البث المباشر)
- `POST /api/streaming/auth` - مصادقة البث
- `POST /api/streaming/verify` - التحقق من الوصول
- `POST /api/streaming/heartbeat` - نبضات القلب

#### Media & News
- `GET /api/media` - المحتوى الإعلامي
- `GET /api/news` - الأخبار
- `GET /api/news/:id` - خبر محدد
- `GET /api/banners` - البانرات

#### Manager (للمديرين)
- `POST /api/manager/check-in` - تسجيل دخول
- `POST /api/manager/scan` - مسح QR Code
- `GET /api/manager/event/:eventId` - بيانات الفعالية

#### Admin (للإداريين)
- `GET/POST /api/admin/events` - إدارة الفعاليات
- `GET/PUT/DELETE /api/admin/events/:id`
- `GET/POST /api/admin/fighters` - إدارة المقاتلين
- `GET/PUT/DELETE /api/admin/fighters/:id`
- `GET/POST /api/admin/fights` - إدارة المباريات
- `GET/PUT/DELETE /api/admin/fights/:id`
- `GET/POST /api/admin/news` - إدارة الأخبار
- `GET/POST /api/admin/banners` - إدارة البانرات

#### Webhooks
- `POST /api/webhooks/paymob` - Paymob payment webhook

---

## تحديث الـ Flutter App بعد النشر

بعد نشر الباكاند، حدّث الـ API URL في تطبيق Flutter:

### في ملف `lib/core/constants/api_constants.dart`:

```dart
class ApiConstants {
  // استبدل بـ URL الخاص بك من Vercel
  static const String baseUrl = 'https://your-app.vercel.app';
  
  static const String apiVersion = '/api';
  
  // ... باقي الكود
}
```

---

## استكشاف الأخطاء

### 1. خطأ CORS
إذا واجهت مشاكل CORS، تأكد من:
- ملف `next.config.js` يحتوي على headers صحيحة
- ملف `vercel.json` يحتوي على headers configuration

### 2. خطأ Environment Variables
- تأكد من إضافة جميع المتغيرات في Vercel Dashboard
- أعد نشر المشروع بعد إضافة/تعديل المتغيرات
- تحقق من اسم المتغيرات (case-sensitive)

### 3. خطأ Database Connection
- تأكد من Supabase URL و Keys صحيحة
- تحقق من RLS policies في Supabase
- راجع Database logs في Supabase Dashboard

### 4. عرض Logs
```bash
# من خلال CLI
vercel logs your-app.vercel.app

# أو من Dashboard
# Deployments → اختر deployment → Logs
```

---

## الأمان

### ✅ تأكد من:
1. **لا تشارك** Service Role Key أبداً
2. استخدم **JWT_SECRET** قوي
3. فعّل **RLS** في Supabase
4. راجع **CORS headers** بعناية
5. استخدم **HTTPS** فقط في الإنتاج

---

## الدعم

للمزيد من المساعدة:
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)

---

**تم بناء هذا البروجكت بواسطة Evolution Championship Team**
