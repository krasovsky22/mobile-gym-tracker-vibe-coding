import { v } from 'convex/values';

import { mutation, query } from './_generated/server';
import { getUserId } from './users';

export const create = mutation({
  args: {
    trackedWorkoutExerciseId: v.id('trackedWorkoutExercises'),
    setNumber: v.number(),
    weight: v.number(),
    reps: v.number(),
    isCompleted: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx)!;

    return await ctx.db.insert('trackedWorkoutExerciseSets', {
      ...args,
      userId,
    });
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

export const update = mutation({
  args: {
    id: v.id('trackedWorkoutExerciseSets'),
    isCompleted: v.boolean(),
    weight: v.optional(v.number()),
    reps: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx)!;
    const { id, ...data } = args;

    // Verify ownership
    const existingSet = await ctx.db.get(id);
    if (!existingSet || existingSet.userId !== userId) {
      throw new Error('Set not found or unauthorized');
    }

    return await ctx.db.patch(id, data);
  },
});

export const remove = mutation({
  args: {
    id: v.id('trackedWorkoutExerciseSets'),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx)!;

    // Verify ownership
    const existingSet = await ctx.db.get(args.id);
    if (!existingSet || existingSet.userId !== userId) {
      throw new Error('Set not found or unauthorized');
    }

    return await ctx.db.delete(args.id);
  },
});
