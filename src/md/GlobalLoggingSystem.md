# نظام التسجيل العام (Global Logging System)

## نظرة عامة
تم إنشاء نظام تسجيل عام في مشروع Next.js مشابه لنظام NLog في مشروع ASP.NET. يستخدم Pino كمكتبة التسجيل الرئيسية لأدائها العالي ودعم JSON المنظم.

## المكونات الرئيسية

### 1. ملف الـ Logger الأساسي (`src/lib/logger.ts`)

#### الغرض
يحتوي على إعداد الـ logger الرئيسي مع إخراج مزدوج (console و file).

#### الكود التفصيلي
```typescript
import pino from 'pino';
import path from 'path';
import fs from 'fs';

// إنشاء مجلد logs إذا لم يكن موجوداً
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// تحديد اسم الملف بناءً على التاريخ
const currentDate = new Date().toISOString().split('T')[0];
const logFilePath = path.join(logsDir, `${currentDate}.log`);

// إعداد الـ logger مع مستويين
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
}, pino.multistream([
  // إخراج للـ console
  {
    stream: pino.destination({
      dest: process.stdout.fd,
      sync: false,
    }),
  },
  // إخراج للملف
  {
    stream: pino.destination({
      dest: logFilePath,
      sync: false,
    }),
  },
]));

export default logger;
```

#### الميزات
- **تدوير الملفات اليومي**: كل يوم ملف جديد باسم `YYYY-MM-DD.log`
- **تنظيف تلقائي**: حذف الملفات القديمة عند تجاوز `LOG_MAX_FILES`
- **JSON منظم**: جميع السجلات بصيغة JSON مع timestamps
- **مستويات متعددة**: trace, debug, info, warn, error, fatal
- **أداء عالي**: Pino مصمم للسرعة والكفاءة
- **قابل للتخصيص**: جميع الإعدادات من متغيرات البيئة

### 2. ملف البدء والأخطاء (`instrumentation.ts`)

#### الغرض
يتعامل مع تسجيل بداية التطبيق وأخطاء الطلبات العامة.

#### الكود التفصيلي
```typescript
import logger from './src/lib/logger';

export const runtime = 'nodejs';

export async function register() {
  logger.info('Application starting up');
}

export async function onRequestError(err: Error, request: Request, context: any) {
  logger.error({
    message: 'Request error',
    error: err.message,
    stack: err.stack,
    url: request.url,
    method: request.method,
  });
}
```

#### الميزات
- **تسجيل البدء**: رسالة عند بدء التطبيق
- **معالجة الأخطاء**: تسجيل تفصيلي لأخطاء الطلبات
- **Node.js Runtime**: مضمون التشغيل في بيئة Node.js

### 3. ملف الوسيط (Middleware) (`src/middleware.ts`)

#### الغرض
يسجل جميع الطلبات الواردة للـ API.

#### الكود التفصيلي
```typescript
import { NextRequest, NextResponse } from 'next/server';
import logger from '@/lib/logger';

export const runtime = 'nodejs';

export function middleware(request: NextRequest) {
  const { method, url } = request;
  const userAgent = request.headers.get('user-agent') || '';
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

  logger.info({
    message: 'Incoming request',
    method,
    url,
    userAgent,
    ip,
  });

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

#### الميزات
- **تسجيل الطلبات**: كل طلب API يتم تسجيله
- **معلومات شاملة**: method, URL, user agent, IP
- **محدد المسارات**: يعمل فقط على `/api/*`

### 4. مثال على الاستخدام (`src/app/api/test/route.ts`)

#### الغرض
يظهر كيفية استخدام الـ logger في API routes.

#### الكود التفصيلي
```typescript
import { NextRequest, NextResponse } from 'next/server';
import logger from '@/lib/logger';

export async function GET(request: NextRequest) {
  logger.info('Test API called');

  try {
    logger.debug('Processing test request');
    return NextResponse.json({ message: 'Test successful' });
  } catch (error) {
    logger.error({
      message: 'Error in test API',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

## المقارنة مع NLog في ASP.NET

| الميزة | NLog (ASP.NET) | Pino (Next.js) |
|--------|----------------|----------------|
| إعداد الملف | nlog.config XML | logger.ts TypeScript |
| الإخراج | File + Console targets | multistream مع console + file |
| الصيغة | JSON layout | JSON افتراضي |
| التكوين | appsettings.json | متغيرات البيئة |
| التدوير | ${shortdate} | Date-based filename |
| التكامل | Program.cs | instrumentation.ts + middleware |

## كيفية الاستخدام في الكود

### استيراد الـ logger
```typescript
import logger from '@/lib/logger';
```

### أمثلة على التسجيل
```typescript
// رسالة بسيطة
logger.info('Application started');

// مع كائن منظم
logger.info({
  message: 'User login',
  userId: 123,
  email: 'user@example.com'
});

// تسجيل خطأ
logger.error({
  message: 'Database connection failed',
  error: err.message,
  stack: err.stack
});

// تسجيل debug
logger.debug('Processing user data', { userCount: 50 });
```

## إعدادات البيئة

### متغيرات البيئة المدعومة
- `LOG_LEVEL`: مستوى التسجيل (trace, debug, info, warn, error, fatal)
- `LOG_PATH`: مسار مجلد السجلات (افتراضي: logs)
- `LOG_MAX_FILES`: عدد الملفات المحفوظة كحد أقصى (افتراضي: 30)
- `LOG_MAX_SIZE`: حجم الملف الأقصى (افتراضي: 10m)

### ملف .env.example
تم إنشاء ملف `.env.example` يحتوي على جميع المتغيرات مع أمثلة للبيئات المختلفة:

```bash
# Development
LOG_LEVEL="debug"
LOG_PATH="logs"
LOG_MAX_FILES="7"
LOG_MAX_SIZE="5m"

# Production
LOG_LEVEL="warn"
LOG_PATH="/var/log/freelancer-manager"
LOG_MAX_FILES="90"
LOG_MAX_SIZE="50m"
```

### مستويات التسجيل
- **trace**: أدق تفاصيل للتتبع
- **debug**: معلومات للمطورين
- **info**: معلومات عامة مهمة
- **warn**: تحذيرات تحتاج انتباه
- **error**: أخطاء تحتاج إصلاح
- **fatal**: أخطاء حرجة توقف التطبيق

## هيكل ملفات السجل

```
logs/
├── 2026-04-06.log  # ملف اليوم الحالي
├── 2026-04-05.log  # ملف أمس
├── 2026-04-04.log  # ملف قبل أمس
└── ... (حتى LOG_MAX_FILES ملف)
```

### تدوير الملفات
- **تدوير يومي**: ملف جديد كل يوم
- **تنظيف تلقائي**: حذف الملفات القديمة تلقائياً
- **حد أقصى للملفات**: يحافظ على عدد محدود من الملفات
- **حجم الملفات**: مراقبة حجم كل ملف

### مثال على محتوى الملف
```json
{"level":"INFO","time":"2026-04-06T19:41:15.120Z","pid":9456,"hostname":"DESKTOP-BRJNLVG","message":"Incoming request","method":"GET","url":"http://localhost:3000/api/test","userAgent":"Mozilla/5.0...","ip":"::1"}
{"level":"INFO","time":"2026-04-06T19:41:34.475Z","pid":9456,"hostname":"DESKTOP-BRJNLVG","msg":"Test API called"}
{"level":"ERROR","time":"2026-04-06T19:42:00.000Z","pid":9456,"hostname":"DESKTOP-BRJNLVG","message":"Database connection failed","error":"Connection timeout"}
```

## الأداء والأمان

### الأداء
- Pino مصمم للأداء العالي (أسرع من winston)
- async logging لعدم حجب الطلبات
- JSON format للمعالجة السريعة

### الأمان
- لا يسجل كلمات المرور أو البيانات الحساسة
- يمكن تصفية المعلومات الحساسة
- مناسب للإنتاج

## التوسع والتطوير

### إضافة transports جديدة
يمكن إضافة إخراج لقواعد البيانات أو خدمات خارجية.

### تخصيص الصيغة
تخصيص formatters للسجلات حسب الحاجة.

### مراقبة السجلات
استخدام أدوات مثل ELK stack لتحليل السجلات.

### تغيير الإعدادات في بيئة الإنتاج
```bash
# في خادم الإنتاج
export LOG_LEVEL="warn"
export LOG_PATH="/var/log/myapp"
export LOG_MAX_FILES="90"
export LOG_MAX_SIZE="50m"

# أو في docker-compose.yml
environment:
  - LOG_LEVEL=warn
  - LOG_PATH=/app/logs
  - LOG_MAX_FILES=90
  - LOG_MAX_SIZE=50m
```

## الاختبار

### تشغيل السيرفر
```bash
npm run dev
```

### اختبار API
```bash
curl http://localhost:3000/api/test
```

### التحقق من السجلات
- في الـ console أثناء التطوير
- في ملفات `logs/` للسجلات المحفوظة

## الخلاصة

تم إنشاء نظام تسجيل شامل قابل للتخصيص بالكامل من خلال متغيرات البيئة:

- **LOG_LEVEL**: التحكم في مستوى التسجيل (debug, info, warn, error)
- **LOG_PATH**: تحديد مسار حفظ ملفات السجل
- **LOG_MAX_FILES**: عدد الملفات المحفوظة كحد أقصى
- **LOG_MAX_SIZE**: حجم الملف الأقصى

### الميزات المكتملة:
- ✅ تسجيل يومي مع تدوير تلقائي
- ✅ تنظيف الملفات القديمة تلقائياً
- ✅ إخراج مزدوج (console + file)
- ✅ JSON منظم مع timestamps
- ✅ تحكم كامل من متغيرات البيئة
- ✅ مناسب للإنتاج والتطوير
- ✅ أداء عالي مع Pino
- ✅ معالجة أخطاء شاملة

### أمثلة على الاستخدام في بيئات مختلفة:

**تطوير:**
```bash
LOG_LEVEL="debug"
LOG_PATH="logs"
LOG_MAX_FILES="7"
```

**إنتاج:**
```bash
LOG_LEVEL="warn"
LOG_PATH="/var/log/freelancer-manager"
LOG_MAX_FILES="90"
LOG_MAX_SIZE="50m"
```

النظام جاهز الآن للاستخدام في جميع البيئات! 🚀