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
  // Your other tables...
});

export default schema;
