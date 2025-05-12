import { v } from 'convex/values';

import { mutation, query } from './_generated/server';
import { getUserId } from './users';

export const create = mutation({
  args: {
    workoutId: v.id('workouts'),
    exercises: v.array(
      v.object({
        exerciseId: v.id('exercises'),
        sets: v.array(
          v.object({
            weight: v.number(),
            reps: v.number(),
            isCompleted: v.boolean(),
          })
        ),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const workout = await ctx.db.get(args.workoutId);
    if (!workout) {
      throw new Error('Workout not found');
    }

    const userId = await getUserId(ctx);

    return await ctx.db.insert('trackedWorkouts', {
      workoutId: args.workoutId,
      userId,
      date: Date.now(),
      exercises: args.exercises,
    });
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    return await ctx.db
      .query('trackedWorkouts')
      .filter((q) => q.eq(q.field('userId'), identity.subject))
      .collect();
  },
});

export const get = query({
  args: { id: v.id('trackedWorkouts') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
