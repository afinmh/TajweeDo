# Clean Architecture Implementation

## 📋 Overview

Proyek ini telah direfactor menggunakan **Clean Architecture** dengan pemisahan layer yang jelas antara:
- **Presentation Layer** (UI Components)
- **Business Logic Layer** (Services)
- **Data Access Layer** (Repositories)
- **Domain Layer** (Types/Interfaces)

## 🏗️ Struktur Folder Baru

```
lib/
├── types/                 # TypeScript interfaces & types
│   └── index.ts          # Core entity types, enums, request/response types
├── repositories/          # Data access layer
│   ├── user.repository.ts
│   ├── user-progress.repository.ts
│   ├── course.repository.ts
│   ├── unit-lesson.repository.ts
│   ├── challenge.repository.ts
│   └── index.ts
├── services/             # Business logic layer
│   ├── auth.service.ts
│   ├── user-progress.service.ts
│   ├── course.service.ts
│   ├── challenge.service.ts
│   └── index.ts
└── validators/           # Input validation (untuk future)

hooks/                    # Custom React hooks
├── use-user-progress.ts
├── use-lesson.ts
├── use-courses.ts
├── use-quiz.ts
├── use-audio-player.ts
└── index.ts

db/
├── queries.ts            # Original (masih digunakan)
└── queries.refactored.ts # Versi refactored (gunakan ini untuk kode baru)

actions/
├── user-progress.ts      # Original
└── user-progress.refactored.ts # Versi refactored
```

## 🎯 Prinsip Clean Architecture

### 1. **Separation of Concerns**
Setiap layer memiliki tanggung jawab yang jelas:

#### **Repository Layer** (`lib/repositories/`)
- ✅ Hanya handle database operations
- ✅ CRUD operations murni
- ✅ Return raw data atau transformed data
- ❌ TIDAK ada business logic
- ❌ TIDAK ada authentication logic

```typescript
// ✅ GOOD - Repository hanya database operations
export class UserRepository {
  async findById(userId: string): Promise<User | null> {
    const { data } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    return data;
  }
}
```

#### **Service Layer** (`lib/services/`)
- ✅ Business logic & calculations
- ✅ Validation & error handling
- ✅ Orchestrate multiple repositories
- ✅ Transaction management
- ❌ TIDAK langsung akses database

```typescript
// ✅ GOOD - Service handle business logic
export class UserProgressService {
  async refillHearts(): Promise<ServiceResponse<{ hearts: number }>> {
    const userId = authService.requireAuth();
    const userProgress = await userProgressRepository.findByUserId(userId);
    
    if (userProgress.hearts === 5) {
      return { success: false, error: 'Hearts already full' };
    }
    
    if (userProgress.points < POINTS_TO_REFILL) {
      return { success: false, error: 'Not enough points' };
    }
    
    await userProgressRepository.updateHearts(userId, 5);
    return { success: true, data: { hearts: 5 } };
  }
}
```

#### **Custom Hooks** (`hooks/`)
- ✅ Client-side state management
- ✅ API calls dari client
- ✅ UI logic & interactions
- ❌ TIDAK ada database access langsung

```typescript
// ✅ GOOD - Hook untuk client-side logic
export const useUserProgress = () => {
  const [hearts, setHearts] = useState(0);
  
  const refillHearts = async () => {
    const response = await fetch('/api/user-progress', {
      method: 'PUT',
      body: JSON.stringify({ action: 'refill' }),
    });
    const data = await response.json();
    setHearts(data.hearts);
  };
  
  return { hearts, refillHearts };
};
```

### 2. **Dependency Flow**

```
┌─────────────────────────────────────────┐
│  Presentation Layer                     │
│  (Components, Pages, Hooks)             │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Application Layer                      │
│  (Server Actions, API Routes)           │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Business Logic Layer                   │
│  (Services)                             │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Data Access Layer                      │
│  (Repositories)                         │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Database (Supabase)                    │
└─────────────────────────────────────────┘
```

## 📝 Cara Menggunakan

### Contoh 1: Server Component (Next.js App Router)

```typescript
// app/(main)/learn/page.tsx
import { userProgressService } from '@/lib/services';

export default async function LearnPage() {
  // ✅ Gunakan service di server component
  const userProgress = await userProgressService.getCurrentUserProgress();
  
  if (!userProgress) {
    return <div>Please login</div>;
  }
  
  return (
    <div>
      <h1>Hearts: {userProgress.hearts}</h1>
      <h1>Points: {userProgress.points}</h1>
    </div>
  );
}
```

### Contoh 2: Server Actions

```typescript
// actions/user-progress.refactored.ts
"use server";

import { userProgressService } from '@/lib/services';
import { revalidatePath } from 'next/cache';

export async function refillHearts() {
  // ✅ Service handle semua logic
  const result = await userProgressService.refillHearts();
  
  if (!result.success) {
    throw new Error(result.error);
  }
  
  revalidatePath('/learn');
  return result.data;
}
```

### Contoh 3: API Routes

```typescript
// app/api/user-progress/route.ts
import { userProgressService } from '@/lib/services';
import { NextResponse } from 'next/server';

export async function GET() {
  const userProgress = await userProgressService.getCurrentUserProgress();
  
  if (!userProgress) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  
  return NextResponse.json({
    hearts: userProgress.hearts,
    points: userProgress.points,
  });
}
```

### Contoh 4: Client Component dengan Hooks

```typescript
// components/hearts-display.tsx
'use client';

import { useUserProgress } from '@/hooks';

export function HeartsDisplay() {
  const { hearts, points, refillHearts } = useUserProgress();
  
  return (
    <div>
      <p>Hearts: {hearts}</p>
      <p>Points: {points}</p>
      <button onClick={refillHearts}>Refill Hearts</button>
    </div>
  );
}
```

## 🔄 Migration Path

### File yang sudah direfactor:
1. ✅ `db/queries.refactored.ts` - Gunakan ini untuk kode baru
2. ✅ `actions/user-progress.refactored.ts` - Gunakan ini untuk kode baru

### File yang masih original:
- `db/queries.ts` - Masih bisa digunakan (backward compatible)
- `actions/user-progress.ts` - Masih bisa digunakan
- Semua component files - Bisa di-refactor bertahap

### Langkah Migration:
1. **Fase 1**: Gunakan file `.refactored.ts` untuk fitur baru
2. **Fase 2**: Refactor component yang sering diubah
3. **Fase 3**: Migrate semua ke architecture baru

## 🎓 Best Practices

### DO ✅

```typescript
// ✅ Service returns ServiceResponse with success/error
const result = await userProgressService.addPoints(10);
if (!result.success) {
  console.error(result.error);
  return;
}
console.log(result.data);

// ✅ Repository returns data atau null
const user = await userRepository.findById(userId);
if (!user) {
  throw new Error('User not found');
}

// ✅ Hooks manage client state
const { hearts, isLoading, error } = useUserProgress();
```

### DON'T ❌

```typescript
// ❌ Jangan akses database langsung dari component
const { data } = await supabaseAdmin.from('users').select('*');

// ❌ Jangan taruh business logic di repository
async findById(userId: string) {
  const user = await db.find(userId);
  if (user.hearts < 5) {  // ❌ Business logic!
    user.canRefill = true;
  }
  return user;
}

// ❌ Jangan taruh database query di service
async getUser(userId: string) {
  const { data } = await supabaseAdmin  // ❌ Direct DB access!
    .from('users')
    .select('*')
    .eq('id', userId);
}
```

## 📦 Benefits

### Maintainability
- ✅ Kode lebih terorganisir
- ✅ Mudah mencari bug
- ✅ Perubahan lebih cepat

### Testability
- ✅ Service bisa di-unit test tanpa database
- ✅ Repository bisa di-mock
- ✅ Component testing lebih mudah

### Reusability
- ✅ Service bisa dipakai di server action, API route, atau cron job
- ✅ Repository bisa dipakai di berbagai service
- ✅ Hooks bisa dipakai di berbagai component

### Scalability
- ✅ Mudah add fitur baru
- ✅ Mudah switch database provider
- ✅ Team bisa kerja parallel tanpa conflict

## 🔧 Tools & Extensions

Recommended VS Code extensions:
- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Path Intellisense

## 📚 Resources

- [Clean Architecture by Uncle Bob](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Next.js Best Practices](https://nextjs.org/docs/app/building-your-application)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

## 🤝 Contributing

Saat menambah fitur baru:
1. Buat types di `lib/types/`
2. Buat repository method di `lib/repositories/`
3. Buat service method di `lib/services/`
4. (Optional) Buat custom hook di `hooks/`
5. Gunakan di component/page

---

**Note**: File original tidak akan dihapus untuk menjaga backward compatibility. Gunakan file `.refactored.ts` untuk development baru.
