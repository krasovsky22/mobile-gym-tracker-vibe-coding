import { authTables } from '@convex-dev/auth/server';
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

const schema = defineSchema({
  ...authTables,
  exercises: defineTable({
    name: v.string(),
    category: v.string(),
    muscleGroup: v.string(),
    createdBy: v.id('users'),
    updatedBy: v.id('users'),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
  workouts: defineTable({
    name: v.string(),
    exercises: v.array(
      v.object({
        exerciseId: v.id('exercises'),
        sets: v.number(),
      })
    ),
  }),
  trackedWorkouts: defineTable({
    workoutId: v.id('workouts'),
    userId: v.id('users'),
    date: v.number(),
  }).index('by_user', ['userId']),
  trackedWorkoutExercises: defineTable({
    trackedWorkoutId: v.id('trackedWorkouts'),
    exerciseId: v.id('exercises'),
    userId: v.id('users'),
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
