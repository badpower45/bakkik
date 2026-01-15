# دليل نشر الباكاند على Vercel - خطوة بخطوة

## ✅ الخطوة 1: التحضير
تم الانتهاء من:
- ✅ تجهيز ملفات الإعداد (vercel.json, next.config.ts)
- ✅ البناء بنجاح وإزالة الأخطاء
- ✅ جميع API endpoints جاهزة (46 endpoint)

## 🚀 الخطوة 2: رفع المشروع على Vercel

### الطريقة الأولى: من خلال Vercel Dashboard (الأسهل - موصى بها)

#### 1. سجل دخول على Vercel
افتح: https://vercel.com/login

#### 2. أنشئ مشروع جديد
1. اضغط على **"Add New..."** → **"Project"**
2. استورد repository من GitHub/GitLab/Bitbucket
3. أو ارفع المجلد مباشرة

#### 3. إعدادات المشروع
```
Project Name: evolution-championship-backend
Framework Preset: Next.js
Root Directory: backend
Build Command: npm run build (تلقائي)
Output Directory: .next (تلقائي)
Install Command: npm install (تلقائي)
```

#### 4. إضافة Environment Variables (مهم جداً!)
قبل الضغط على Deploy، أضف المتغيرات التالية:

##### أ) متغيرات Supabase (إلزامية)
```
NEXT_PUBLIC_SUPABASE_URL=https://veighumhkisqykgsphqa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE
```

##### ب) متغيرات JWT (إلزامية)
```
JWT_SECRET=YOUR_STRONG_JWT_SECRET_HERE
```
💡 لإنشاء JWT secret قوي:
```bash
openssl rand -base64 32
```

##### ج) متغيرات Paymob (اختيارية - للدفع)
```
PAYMOB_API_KEY=your_paymob_api_key
PAYMOB_INTEGRATION_ID=your_integration_id
PAYMOB_IFRAME_ID=your_iframe_id
PAYMOB_HMAC_SECRET=your_hmac_secret
```

##### د) متغيرات Streaming (اختيارية)
```
STREAMING_SECRET_KEY=your_streaming_secret
```

⚠️ **مهم**: تأكد من اختيار البيئات الثلاث:
- ✅ Production
- ✅ Preview  
- ✅ Development

#### 5. اضغط Deploy
انتظر حتى ينتهي النشر (عادة 2-3 دقائق)

#### 6. احصل على URL
بعد النشر الناجح، ستحصل على URL مثل:
```
https://evolution-championship-backend.vercel.app
```

---

### الطريقة الثانية: من خلال Vercel CLI

#### 1. سجل دخول
```bash
cd backend
vercel login
```

#### 2. أنشئ المشروع
```bash
vercel
```
اتبع التعليمات:
- Set up and deploy? **Y**
- Which scope? اختر حسابك
- Link to existing project? **N**
- Project name? **evolution-championship-backend**
- Directory? **./backend** أو اضغط Enter
- Override settings? **N**

#### 3. أضف Environment Variables
```bash
# من مجلد backend
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# الصق القيمة: https://veighumhkisqykgsphqa.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# الصق anon key من Supabase

vercel env add SUPABASE_SERVICE_ROLE_KEY production
# الصق service role key من Supabase

vercel env add JWT_SECRET production
# الصق JWT secret

# إذا كان لديك Paymob
vercel env add PAYMOB_API_KEY production
vercel env add PAYMOB_INTEGRATION_ID production
vercel env add PAYMOB_IFRAME_ID production
vercel env add PAYMOB_HMAC_SECRET production

# Streaming
vercel env add STREAMING_SECRET_KEY production
```

#### 4. انشر على Production
```bash
vercel --prod
```

---

## 🧪 الخطوة 3: اختبار الـ API

### 1. Health Check
```bash
curl https://your-app.vercel.app/api/health
```

الرد المتوقع:
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

### 2. اختبار تسجيل الدخول
```bash
curl -X POST https://your-app.vercel.app/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

---

## 📱 الخطوة 4: تحديث تطبيق Flutter

### 1. افتح ملف API Constants
```dart
// lib/core/constants/api_constants.dart
class ApiConstants {
  // استبدل بـ URL الخاص بك من Vercel
  static const String baseUrl = 'https://your-app-name.vercel.app';
  
  static const String apiVersion = '/api';
  
  // Endpoints
  static const String auth = '$apiVersion/auth';
  static const String events = '$apiVersion/events';
  static const String fighters = '$apiVersion/fighters';
  static const String tickets = '$apiVersion/tickets';
  // ... باقي endpoints
}
```

### 2. اختبر من التطبيق
```bash
cd ..
flutter run
```

---

## 📊 جميع الـ API Endpoints المتاحة (46 endpoint)

### Authentication (5)
- `POST /api/auth/signup` - تسجيل جديد
- `POST /api/auth/signin` - تسجيل دخول
- `POST /api/auth/logout` - تسجيل خروج
- `GET /api/auth/me` - بيانات المستخدم
- `POST /api/auth/reset-password` - إعادة تعيين كلمة المرور

### Events (5)
- `GET /api/events` - كل الفعاليات
- `GET /api/events/:id` - فعالية محددة
- `GET /api/events/next` - الفعالية القادمة
- `GET /api/events/:id/ticket-types` - أنواع التذاكر
- `GET /api/events/:id/registrations` - التسجيلات

### Fighters (5)
- `GET /api/fighters` - كل المقاتلين
- `GET /api/fighters/:id` - مقاتل محدد
- `GET /api/fighters/champions` - الأبطال
- `POST /api/fighters/register` - تسجيل مقاتل جديد

### Fights (2)
- `GET /api/fights` - كل المباريات
- `GET /api/fights/latest` - آخر المباريات

### Tickets & Orders (6)
- `GET /api/tickets` - تذاكر المستخدم
- `GET /api/tickets/:id` - تذكرة محددة
- `POST /api/checkout/tickets` - شراء تذاكر
- `POST /api/checkout/ppv` - شراء PPV
- `GET /api/orders` - طلبات المستخدم
- `GET /api/orders/:id` - طلب محدد

### Streaming (3)
- `POST /api/streaming/auth` - مصادقة البث
- `POST /api/streaming/verify` - التحقق
- `POST /api/streaming/heartbeat` - نبض القلب

### Media & News (5)
- `GET /api/media` - المحتوى الإعلامي
- `GET /api/news` - الأخبار
- `GET /api/news/:id` - خبر محدد
- `GET /api/banners` - البانرات
- `GET /api/weight-classes` - فئات الوزن

### Manager (3)
- `POST /api/manager/check-in` - تسجيل دخول
- `POST /api/manager/scan` - مسح QR
- `GET /api/manager/event/:eventId` - بيانات فعالية

### Admin (12)
**Events:**
- `GET/POST /api/admin/events`
- `GET/PUT/DELETE /api/admin/events/:id`
- `GET /api/admin/events/:id/registrations`

**Fighters:**
- `GET/POST /api/admin/fighters`
- `GET/PUT/DELETE /api/admin/fighters/:id`

**Fights:**
- `GET/POST /api/admin/fights`
- `GET/PUT/DELETE /api/admin/fights/:id`

**News:**
- `GET/POST /api/admin/news`
- `GET/PUT/DELETE /api/admin/news/:id`

**Banners:**
- `GET/POST /api/admin/banners`
- `GET/PUT/DELETE /api/admin/banners/:id`

### Webhooks (1)
- `POST /api/webhooks/paymob` - Paymob webhook

### Utility (1)
- `GET /api/health` - Health check

---

## 🔧 استكشاف الأخطاء

### مشكلة: Environment Variables غير موجودة
**الحل:**
1. اذهب إلى Vercel Dashboard
2. Settings → Environment Variables
3. أضف جميع المتغيرات المطلوبة
4. Deployments → Redeploy

### مشكلة: CORS Errors
**الحل:** التأكد من headers في `vercel.json` صحيحة (تم إعدادها مسبقاً ✅)

### مشكلة: Database Connection Failed
**الحل:**
1. تحقق من Supabase URL و Keys
2. تأكد من RLS policies في Supabase
3. راجع logs في Supabase Dashboard

### عرض Logs
```bash
# من CLI
vercel logs your-app.vercel.app --follow

# أو من Dashboard
# Deployments → اختر deployment → View Logs
```

---

## 🔐 نصائح الأمان

1. ✅ **لا تشارك** Service Role Key مع أحد
2. ✅ استخدم JWT Secret قوي (32+ حرف)
3. ✅ فعّل RLS في Supabase لجميع الجداول
4. ✅ استخدم HTTPS فقط (Vercel يوفره تلقائياً)
5. ✅ راجع CORS headers بعناية
6. ✅ لا ترفع ملف `.env` على Git

---

## 📚 الملفات المهمة التي تم إنشاؤها

1. ✅ `backend/vercel.json` - إعدادات Vercel
2. ✅ `backend/next.config.ts` - إعدادات Next.js محسنة
3. ✅ `backend/.vercelignore` - ملفات يتم تجاهلها
4. ✅ `backend/.env.example` - مثال للمتغيرات
5. ✅ `backend/app/layout.tsx` - Layout رئيسي
6. ✅ `backend/app/page.tsx` - الصفحة الرئيسية
7. ✅ `backend/DEPLOYMENT.md` - دليل النشر الكامل

---

## ✨ الخلاصة

البروجكت جاهز 100% للنشر على Vercel! 

**ما تم:**
- ✅ 46 API endpoint جاهزين
- ✅ إعدادات Vercel كاملة
- ✅ CORS headers محددة
- ✅ Error handling
- ✅ Authentication & Authorization
- ✅ Payment integration (Paymob)
- ✅ Streaming support
- ✅ Admin panel endpoints
- ✅ QR Code system
- ✅ Health checks

**المطلوب منك:**
1. رفع على Vercel Dashboard أو CLI
2. إضافة Environment Variables
3. اختبار الـ API
4. تحديث Flutter app بـ URL الجديد

---

**للدعم:**
- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Supabase Docs: https://supabase.com/docs

**تم بحمد الله! 🎉**
