// ============================================
// Core Entity Types
// ============================================

export interface User {
  id: string;
  email: string;
  name?: string;
  imageSrc?: string;
  createdAt?: Date;
}

export interface UserProgress {
  userId: string;
  userName: string | null;
  userImageSrc: string | null;
  activeCourseId: number | null;
  hearts: number;
  points: number;
  xp: number;
  activeCourse: Course | null;
}

export interface Course {
  id: number;
  title: string;
  image_src: string;
  units?: Unit[];
}

export interface Unit {
  id: number;
  title: string;
  description: string;
  order: number;
  courseId: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: number;
  title: string;
  order: number;
  unitId: number;
  completed?: boolean;
  challenges?: Challenge[];
}

export interface Challenge {
  id: number;
  lessonId: number;
  type: ChallengeType;
  question: string;
  order: number;
  challengeOptions?: ChallengeOption[];
  completed?: boolean;
}

export interface ChallengeOption {
  id: number;
  challengeId: number;
  text: string;
  correct: boolean;
  imageSrc?: string | null;
  audioSrc?: string | null;
}

export interface ChallengeProgress {
  userId: string;
  challengeId: number;
  completed: boolean;
}

export interface LessonProgress {
  userId: string;
  lessonId: number;
  completed: boolean;
}

export interface StoreItem {
  id: number;
  name: string;
  description: string;
  cost: number;
  imageSrc: string;
  type: StoreItemType;
}

// ============================================
// Enums
// ============================================

export enum ChallengeType {
  SELECT = 'SELECT',
  ASSIST = 'ASSIST',
  SOUND = 'SOUND',
}

export enum StoreItemType {
  HEARTS = 'HEARTS',
  PREMIUM = 'PREMIUM',
}

// ============================================
// Request/Response Types
// ============================================

export interface UpdateUserProgressRequest {
  courseId: number;
}

export interface ReduceHeartsRequest {
  challengeId: number;
}

export interface RefillHeartsRequest {
  points: number;
}

export interface CompleteLessonRequest {
  lessonId: number;
}

export interface PurchaseStoreItemRequest {
  itemId: number;
}

// ============================================
// Query Context Types
// ============================================

export interface QueryContext {
  userId: string;
  activeCourseId?: number;
}

// ============================================
// Service Response Types
// ============================================

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CourseProgress {
  activeLesson: Lesson | null;
}

// ============================================
// Business Logic Types
// ============================================

export interface XPCalculation {
  baseXP: number;
  bonusXP: number;
  totalXP: number;
}

export interface HeartCalculation {
  currentHearts: number;
  maxHearts: number;
  canRefill: boolean;
  refillCost: number;
}
