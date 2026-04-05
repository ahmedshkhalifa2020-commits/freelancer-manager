# Project Architecture

هذا الملف يوضح البنية الهيكلية للمشروع ويشرح مسؤولية كل جزء، مع تطبيق:

> **Feature-Based Architecture + Clean Architecture (Use Cases Layer)**
>
> - **Schema-Based Validation (Single Source of Truth)**

---

# 🏗️ الهيكل العام (Project Structure)

```bash
src/
│
├── dal/                        // 🗄️ Data Access Layer: مسؤول عن التعامل المباشر مع قاعدة البيانات فقط
│   ├── database/              // ⚙️ إعدادات الاتصال بالـ DB (Prisma / ORM Config)
│   ├── entities/              // 🧱 تعريف الـ Models / Tables (Schema Representation)
│   ├── repositories/          // 📦 تنفيذ عمليات الـ CRUD + Queries
│   │   ├── base.repository.ts  // 🔁 Base Generic Repository (Reusable CRUD)
│   │   └── (other repositories...) // 📌 Repositories خاصة بكل Feature
│   ├── extend/                // 🧩 Extensions / Custom DB logic (مثلاً Prisma Extensions)
│   ├── seed/                  // 🌱 Seed Data (Initial Data for DB)
│   └── types/                 // 🧾 Types خاصة بالـ DAL
│       ├── common/            // 📌 Types مشتركة (Pagination, Filters...)
│       └── enums/             // 🔢 Enums عامة للـ DAL
│
├── features/                  // 🧠 Core Business Layer (Feature-Based Modules)
│   ├── task/                  // 📌 Feature Module (مثال: Task)
│   │   ├── contracts/         // 📑 تعريف Interfaces للـ Use Cases (Abstraction)
│   │   ├── useCases/          // 🎯 Application Logic (Flow Control / Orchestration)
│   │   ├── services/          // ⚙️ Business Logic (Rules + Processing)
│   │   ├── schemas/           // 🔥 Validation + DTO (Single Source of Truth باستخدام Zod)
│   │   ├── enums/             // 🔢 Enums خاصة بالـ Feature
│   │   ├── components/        // 🎨 UI Components خاصة بالـ Feature (اختياري)
│   │   └── index.ts           // 🚪 Public API للـ Feature (export useCases فقط)
│   │
│   └── (other features...)    // 📦 باقي الـ Modules (Users, Auth, Orders...)
│
├── app/                       // 🖥️ Presentation Layer (Next.js App Router)
│   ├── api/                  // 🔌 API Routes (Entry Point للـ Backend)
│   ├── (auth)/               // 🔐 صفحات Authentication (Login, Register)
│   ├── (public)/             // 🌍 صفحات عامة (Landing, About...)
│   ├── (dashboard)/          // 📊 صفحات المستخدم (User Dashboard)
│   ├── (admin)/              // 🛠️ صفحات الإدارة (Admin Panel)
│   ├── layout.tsx            // 🧩 Root Layout للتطبيق
│   ├── page.tsx              // 🏠 الصفحة الرئيسية
│   ├── globals.css           // 🎨 Global Styles
│   └── favicon.ico           // 🔖 أيقونة الموقع
│
├── integrations/              // 🌐 External Services Integration
│   └── external-api/         // 🔗 التعامل مع APIs خارجية (Payments, Emails...)
│
├── lib/                       // 🧰 Utilities & Shared Logic
│   ├── httpClient.ts         // 🌍 HTTP Client Wrapper (Fetch / Axios)
│   ├── logger.ts             // 🪵 Logging System (Errors, Info...)
│   ├── formatDate.ts         // 📅 Date Formatting Helpers
│   ├── constants.ts          // 📌 Constants عامة في المشروع
│   └── errors/               // ❌ Error Handling System
│       └── AppError.ts       // 🚨 Custom Error Class
│
├── middleware/                // 🛡️ Middleware (Auth, Logging, Rate Limit...)
│
├── tests/                     // 🧪 Testing Layer
│   ├── dal/                  // 🔍 Tests للـ DAL
│   ├── features/             // 🔍 Tests للـ Business Logic
│   └── app/                  // 🔍 Tests للـ API / UI
│
└── md/                        // 📚 Documentation
    └── ProjectArchitecture.md // 📄 شرح Architecture بالكامل
```

---

# 🧠 شرح الطبقات (Layers Explanation)

---

## 🗄️ dal/ (Data Access Layer)

- مسؤولة فقط عن التعامل مع قاعدة البيانات
- لا تحتوي على Business Logic

### تحتوي على:

- Entities (تعريف الجداول)
- Repositories (التعامل مع DB)

---

# 🧩 Repository Layer

## 🎯 الهدف

عمل abstraction بين:

> Database ↔ Application

---

## 1️⃣ Base Repository (Generic)

```ts
export abstract class BaseRepository<T> {
  abstract create(data: Partial<T>): Promise<T>;
  abstract findById(id: string): Promise<T | null>;
  abstract findAll(): Promise<T[]>;
  abstract update(id: string, data: Partial<T>): Promise<T>;
  abstract delete(id: string): Promise<void>;
}
```

---

## 2️⃣ Feature Repository

```ts
export class TaskRepository extends BaseRepository<Task> {
  async create(data: Partial<Task>) {
    return db.task.create({ data });
  }

  async findById(id: string) {
    return db.task.findUnique({ where: { id } });
  }

  async findAll() {
    return db.task.findMany();
  }

  async update(id: string, data: Partial<Task>) {
    return db.task.update({ where: { id }, data });
  }

  async delete(id: string) {
    await db.task.delete({ where: { id } });
  }

  // Custom Queries
  async findTasksByUser(userId: string) {
    return db.task.findMany({ where: { userId } });
  }
}
```

---

## ⚠️ قواعد Repository

| النوع          | المكان             |
| -------------- | ------------------ |
| CRUD           | BaseRepository     |
| Custom Queries | Feature Repository |
| Business Logic | Service            |

---

# 🔥 features/ (Core Layer)

- كل Feature عبارة عن Module مستقل
- يحتوي على Business Logic + Use Cases

---

# 🧩 داخل كل Feature

---

## 1. contracts/

تعريف Use Cases (Interfaces)

---

## 2. useCases/ (Application Layer)

- مسؤولة عن:
  - orchestration
  - التحكم في flow

---

## 3. services/

- تحتوي على Business Logic
- تتعامل مع repositories

---

## 4. schemas/ (🔥 مهم جداً)

> مصدر واحد للحقيقة (Validation + DTO)

---

### مثال:

```ts
import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
});

export type CreateTaskDTO = z.infer<typeof createTaskSchema>;
```

---

## 🎯 مميزات Schema Approach

- ✅ Validation + DTO في مكان واحد
- ✅ منع mismatch بين types و validation
- ✅ تقليل التكرار
- ✅ أسهل في الصيانة

---

## 5. enums/

Enums خاصة بالـ Feature

---

## 6. components/

UI خاص بالـ Feature (اختياري)

---

## 7. index.ts

Public API (exports useCases فقط)

---

# 🧩 app/ (Presentation Layer)

- مسؤولة عن UI + API
- تعتمد فقط على Use Cases

---

## 📌 Areas

```bash
app/
├── api/
├── (auth)/
├── (public)/
├── (dashboard)/
├── (admin)/
```

---

## 🔌 API Layer

```ts
import { createTask } from "@/features/task";

export async function POST(req: Request) {
  const data = await req.json();
  return createTask.execute(data);
}
```

---

# 🧰 lib/ (Shared Utilities)

---

## constants.ts

```ts
export const APP_NAME = "Freelancer Manager";
```

---

## errors/

```ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
  ) {
    super(message);
  }
}
```

---

## middleware handling

```ts
export function errorHandler(err) {
  return {
    message: err.message,
    status: err.statusCode || 500,
  };
}
```

---

# 🔁 Execution Flow

```text
UI
 ↓
API
 ↓
Use Case
 ↓
Service
 ↓
Repository
 ↓
Database
```

---

# 🎯 سيناريو كامل (Create Task)

---

1. Entity → dal/entities/task.ts
2. Repository → dal/repositories/task.repository.ts
3. Schema → features/task/schemas
4. Use Case → features/task/useCases
5. Service → features/task/services
6. API → app/api/tasks
7. UI → app/dashboard/tasks

---

# ⚠️ قواعد أساسية

---

## 1. UI يتعامل مع Use Cases فقط

---

## 2. Services لا يتم استدعاؤها مباشرة

---

## 3. Use Case مسؤول عن Flow

---

## 4. Repository بدون Business Logic

---

## 5. Use Cases هي Public API

---

## 6. Dependency Direction

```text
app → features → dal
```

---

## 7. Feature لا تعتمد على Feature أخرى

---

# 🧠 ملاحظات

- Architecture نظيف وقابل للتوسع
- مناسب لـ SaaS
- يقلل duplication
- سهل الاختبار

---

# 🚀 تطوير مستقبلي

- Dependency Injection
- Caching
- Event-Driven Architecture
- Message Queue
- Multi-Tenancy

---

> هذه الوثيقة تمثل النسخة الاحترافية النهائية للاعتماد في المشروع.
