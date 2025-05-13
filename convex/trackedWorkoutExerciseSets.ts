import { v } from 'convex/values';

import { mutation, query } from './_generated/server';

export const create = mutation({
  args: {
    trackedWorkoutExerciseId: v.id('trackedWorkoutExercises'),
    setNumber: v.number(),
    weight: v.number(),
    reps: v.number(),
    isCompleted: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('trackedWorkoutExerciseSets', args);
  },
});

export const getByTrackedWorkoutExercise = query({
  args: { trackedWorkoutExerciseId: v.id('trackedWorkoutExercises') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('trackedWorkoutExerciseSets')
      .filter((q) => q.eq(q.field('trackedWorkoutExerciseId'), args.trackedWorkoutExerciseId))
      .collect();
  },
});
