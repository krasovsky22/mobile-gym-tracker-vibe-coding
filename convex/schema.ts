import { authTables } from '@convex-dev/auth/server';
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

const schema = defineSchema({
  ...authTables,
  categories: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    createdBy: v.optional(v.id('users')),
    updatedBy: v.optional(v.id('users')),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }).index('by_name', ['name']),
  muscleGroups: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    createdBy: v.optional(v.id('users')),
    updatedBy: v.optional(v.id('users')),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }).index('by_name', ['name']),
  exercises: defineTable({
    name: v.string(),
    categoryIds: v.optional(v.array(v.id('categories'))),
    muscleGroupIds: v.optional(v.array(v.id('muscleGroups'))),
    createdBy: v.optional(v.id('users')),
    updatedBy: v.optional(v.id('users')),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index('by_name', ['name'])
    .index('by_created_at', ['createdAt']),
  workouts: defineTable({
    name: v.string(),
    exercises: v.array(
      v.object({
        exerciseId: v.id('exercises'),
        sets: v.number(),
      })
    ),
    createdBy: v.optional(v.id('users')),
    updatedBy: v.optional(v.id('users')),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }),

  // Tracking workout
  trackedWorkouts: defineTable({
    workoutId: v.id('workouts'),
    userId: v.id('users'),
    status: v.union(v.literal('started'), v.literal('in_progress'), v.literal('completed')),
    updatedAt: v.number(),
    createdAt: v.number(),
    completedAt: v.union(v.number(), v.null()),
  }).index('by_user', ['userId']),

  trackedWorkoutExercises: defineTable({
    trackedWorkoutId: v.id('trackedWorkouts'),
    exerciseId: v.id('exercises'),
    userId: v.id('users'),
    status: v.union(v.literal('started'), v.literal('in_progress'), v.literal('completed')),
    updatedAt: v.number(),
    createdAt: v.number(),
    completedAt: v.union(v.number(), v.null()),
  })
    .index('by_tracked_workout', ['trackedWorkoutId'])
    .index('by_user', ['userId']),

  trackedWorkoutExerciseSets: defineTable({
    trackedWorkoutExerciseId: v.id('trackedWorkoutExercises'),
    userId: v.id('users'),
    setNumber: v.number(),
    weight: v.number(),
    reps: v.number(),
    isCompleted: v.boolean(),
  })
    .index('by_tracked_workout_exercise', ['trackedWorkoutExerciseId'])
    .index('by_user', ['userId']),
  userPreferences: defineTable({
    userId: v.id('users'),
    isDarkMode: v.boolean(),
    notifications: v.boolean(),
    soundEffects: v.boolean(),
    updatedAt: v.number(),
  }).index('by_user', ['userId']),
});

export default schema;
