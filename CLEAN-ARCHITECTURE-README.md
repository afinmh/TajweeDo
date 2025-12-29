# 🚀 Quick Start Guide - Clean Architecture

## 🎯 Untuk Developer Baru

Baca file ini untuk mulai menggunakan Clean Architecture yang baru saja diimplementasikan.

## 📚 File Penting untuk Dibaca

1. **START HERE** → [IMPLEMENTATION-SUMMARY.md](./IMPLEMENTATION-SUMMARY.md) - Overview lengkap
2. **ARCHITECTURE** → [ARCHITECTURE.md](./ARCHITECTURE.md) - Detail arsitektur & best practices
3. **PERFORMANCE** → [PERFORMANCE-ANALYSIS.md](./PERFORMANCE-ANALYSIS.md) - Analisis performa

## 🏃 Quick Start (5 Minutes)

### 1. Understand the Layers

```
┌─────────────────────┐
│   Components/Pages  │  ← You work here mostly
├─────────────────────┤
│   Hooks (Client)    │  ← Use these for UI logic
├─────────────────────┤
│   Services          │  ← Business logic goes here
├─────────────────────┤
│   Repositories      │  ← Database access only
└─────────────────────┘
```

### 2. Basic Usage Examples

#### ✅ Server Component (Page)
```typescript
// app/(main)/learn/page.tsx
import { userProgressService } from '@/lib/services';

export default async function LearnPage() {
  const userProgress = await userProgressService.getCurrentUserProgress();
  
  return <div>Hearts: {userProgress?.hearts}</div>;
}
```

#### ✅ Client Component (Interactive)
```typescript
// components/hearts-display.tsx
'use client';
import { useUserProgress } from '@/hooks';

export function HeartsDisplay() {
  const { hearts, refillHearts } = useUserProgress();
  
  return (
    <div>
      <p>Hearts: {hearts}</p>
      <button onClick={refillHearts}>Refill</button>
    </div>
  );
}
```

#### ✅ Server Action
```typescript
// actions/some-action.ts
"use server";
import { userProgressService } from '@/lib/services';

export async function addPoints(points: number) {
  const result = await userProgressService.addPoints(points);
  if (!result.success) throw new Error(result.error);
  return result.data;
}
```

### 3. Common Patterns

#### Pattern 1: Fetch & Display Data
```typescript
// Server Component
import { courseService } from '@/lib/services';

async function CoursesPage() {
  const userProgress = await userProgressService.getCurrentUserProgress();
  const units = await courseService.getUnitsWithProgress(
    userProgress!.activeCourseId!
  );
  
  return <UnitList units={units} />;
}
```

#### Pattern 2: User Interaction
```typescript
// Client Component
'use client';
import { useLesson } from '@/hooks';

function LessonPage({ lessonId }: { lessonId: number }) {
  const { 
    currentChallengeIndex,
    hearts,
    completeChallenge 
  } = useLesson(lessonId);
  
  const handleAnswer = async (challengeId: number) => {
    await completeChallenge(challengeId);
  };
  
  return <Challenge onAnswer={handleAnswer} />;
}
```

#### Pattern 3: API Route
```typescript
// app/api/hearts/route.ts
import { userProgressService } from '@/lib/services';
import { NextResponse } from 'next/server';

export async function POST() {
  const result = await userProgressService.refillHearts();
  
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  
  return NextResponse.json(result.data);
}
```

## 📖 Cheat Sheet

### Import Services
```typescript
import { 
  authService,           // Authentication
  userProgressService,   // User progress operations
  courseService,         // Course & lesson operations
  challengeService,      // Challenge operations
} from '@/lib/services';
```

### Import Repositories (Advanced)
```typescript
import { 
  userRepository,
  userProgressRepository,
  courseRepository,
  lessonRepository,
  challengeRepository,
} from '@/lib/repositories';
```

### Import Hooks (Client Components)
```typescript
import { 
  useUserProgress,   // User progress state
  useLesson,         // Lesson progression
  useCourses,        // Course management
  useQuiz,           // Quiz state
  useAudioPlayer,    // Audio playback
} from '@/hooks';
```

### Import Types
```typescript
import type { 
  User,
  UserProgress,
  Course,
  Unit,
  Lesson,
  Challenge,
  ServiceResponse,
} from '@/lib/types';
```

## 🎓 Learning Path

### Day 1: Basics
- [ ] Read [IMPLEMENTATION-SUMMARY.md](./IMPLEMENTATION-SUMMARY.md)
- [ ] Look at [examples/refactored-component-example.tsx](./examples/refactored-component-example.tsx)
- [ ] Try using one service in a page

### Day 2: Practice
- [ ] Read [ARCHITECTURE.md](./ARCHITECTURE.md)
- [ ] Create a new feature using services
- [ ] Use a custom hook in a component

### Day 3: Advanced
- [ ] Read [PERFORMANCE-ANALYSIS.md](./PERFORMANCE-ANALYSIS.md)
- [ ] Refactor one existing component
- [ ] Review best practices

## 🚫 Common Mistakes to Avoid

### ❌ DON'T: Access database directly in component
```typescript
// ❌ BAD
const { data } = await supabase.from('users').select('*');
```

### ✅ DO: Use service instead
```typescript
// ✅ GOOD
const userProgress = await userProgressService.getCurrentUserProgress();
```

### ❌ DON'T: Put business logic in repository
```typescript
// ❌ BAD
async findById(userId: string) {
  const user = await db.find(userId);
  if (user.hearts < 5) {  // Business logic!
    user.canRefill = true;
  }
  return user;
}
```

### ✅ DO: Put business logic in service
```typescript
// ✅ GOOD - Repository
async findById(userId: string) {
  return await db.find(userId);
}

// ✅ GOOD - Service
async canRefillHearts(userId: string) {
  const user = await userRepository.findById(userId);
  return user.hearts < 5;
}
```

### ❌ DON'T: Mix client & server code
```typescript
// ❌ BAD
'use client';
import { supabaseAdmin } from '@/lib/supabase';  // Server-only!
```

### ✅ DO: Use hooks for client, services for server
```typescript
// ✅ GOOD - Client
'use client';
import { useUserProgress } from '@/hooks';

// ✅ GOOD - Server
import { userProgressService } from '@/lib/services';
```

## 🔧 Tools & Tips

### VS Code Extensions
- ESLint - Catch errors early
- Prettier - Auto-format code
- TypeScript - Better IntelliSense
- Path Intellisense - Auto-complete imports

### Keyboard Shortcuts
- `Ctrl/Cmd + Click` on import → Go to definition
- `F12` → Go to definition
- `Shift + F12` → Find all references
- `Ctrl/Cmd + P` → Quick file search

### Tips
1. **Use IntelliSense**: Type `userProgressService.` and see all methods
2. **Read JSDoc**: Hover over method to see documentation
3. **Check types**: Hover over variable to see type
4. **Use examples**: Copy-paste from example files

## 📞 Help & Support

### Need Help?
1. Check [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed docs
2. Look at example files in `examples/`
3. Search for similar code in `.refactored.ts` files

### Found a Bug?
1. Check which layer has the issue (service/repository/hook)
2. Write a unit test to reproduce
3. Fix and verify with test

### Want to Add a Feature?
1. Add types in `lib/types/`
2. Add repository method if needed
3. Add service method
4. Use in component/page
5. Add custom hook if it's client-side

## 🎯 Your First Task

Try this simple exercise:

### Task: Display User XP
1. Import the service:
   ```typescript
   import { userProgressService } from '@/lib/services';
   ```

2. Get user progress:
   ```typescript
   const progress = await userProgressService.getCurrentUserProgress();
   ```

3. Display XP:
   ```typescript
   return <div>XP: {progress?.xp}</div>;
   ```

Done! You just used the new architecture! 🎉

## 📊 Progress Checklist

- [ ] Read IMPLEMENTATION-SUMMARY.md
- [ ] Read ARCHITECTURE.md
- [ ] Try using a service
- [ ] Try using a hook
- [ ] Create a new feature
- [ ] Refactor an existing component
- [ ] Read PERFORMANCE-ANALYSIS.md

## 🎉 Congratulations!

You're now ready to use Clean Architecture! Remember:

1. **Keep it simple** - Don't over-engineer
2. **Follow the layers** - Don't skip layers
3. **Read the docs** - When in doubt, check ARCHITECTURE.md
4. **Ask questions** - Better to ask than to guess

**Happy coding!** 🚀

---

**Next Steps**: Open [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed documentation.
