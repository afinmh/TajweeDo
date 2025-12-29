/**
 * EXAMPLE: Refactored Component
 * Shows before & after comparison
 */

/* ============================================
   ❌ BEFORE - Mixed concerns, hard to test
   ============================================ */

/*
'use client';

import { useState, useEffect } from 'react';
import { supabaseClient } from '@/lib/supabase';

export function UserProgressBefore() {
  const [hearts, setHearts] = useState(0);
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ❌ Database access directly in component
    async function loadProgress() {
      const { data } = await supabaseClient
        .from('user_progress')
        .select('hearts, points')
        .single();
      
      setHearts(data?.hearts || 0);
      setPoints(data?.points || 0);
      setLoading(false);
    }
    loadProgress();
  }, []);

  const handleRefill = async () => {
    // ❌ Business logic in component
    if (hearts === 5) {
      alert('Hearts already full!');
      return;
    }
    
    if (points < 50) {
      alert('Not enough points!');
      return;
    }
    
    // ❌ Database mutation in component
    const { error } = await supabaseClient
      .from('user_progress')
      .update({ 
        hearts: 5, 
        points: points - 50 
      })
      .eq('user_id', 'current-user-id');
    
    if (!error) {
      setHearts(5);
      setPoints(points - 50);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <p>Hearts: {hearts}</p>
      <p>Points: {points}</p>
      <button onClick={handleRefill}>Refill Hearts (50 points)</button>
    </div>
  );
}
*/

/* ============================================
   ✅ AFTER - Clean, testable, maintainable
   ============================================ */

'use client';

import { useUserProgress } from '@/hooks';

export function UserProgressAfter() {
  // ✅ All logic encapsulated in custom hook
  const { hearts, points, isLoading, error, refillHearts } = useUserProgress();

  // ✅ Simple error handling
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  // ✅ Clean event handler - no business logic here
  const handleRefill = async () => {
    const result = await refillHearts();
    if (!result.success) {
      alert(result.error);
    }
  };

  return (
    <div>
      <p>Hearts: {hearts}</p>
      <p>Points: {points}</p>
      <button onClick={handleRefill}>Refill Hearts (50 points)</button>
    </div>
  );
}

/* ============================================
   📊 COMPARISON
   ============================================
   
   BEFORE:
   ❌ 45+ lines of code in component
   ❌ Database queries in component
   ❌ Business logic in component
   ❌ Hard to test
   ❌ Hard to reuse
   ❌ Error prone
   
   AFTER:
   ✅ 20 lines of code in component
   ✅ No database access
   ✅ No business logic
   ✅ Easy to test (mock the hook)
   ✅ Reusable hook
   ✅ Type safe
   ✅ Better error handling
   
   BENEFITS:
   🚀 50% less code in component
   🧪 Easy to unit test
   ♻️  Reusable across components
   🐛 Easier to debug
   📝 More readable
   🔧 Easier to maintain
   
   ============================================ */
