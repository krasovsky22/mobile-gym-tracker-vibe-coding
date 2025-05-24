import { v } from 'convex/values';

import { Id } from './_generated/dataModel';
import { query, mutation, QueryCtx } from './_generated/server';
import * as Exercises from './exercises';

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('workouts').collect();
  },
});

export const get = query({
  args: { id: v.id('workouts') },
  handler: async (ctx, args) => {
    const { id } = args;
    const workout = await ctx.db.get(id);

    if (!workout) {
      return null;
    }

    const exercises = await Exercises.findByIds(ctx, {
      ids: workout.exercises.map((e) => e.exerciseId),
    });

    return {
      ...workout,
      exercises,
    };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    exercises: v.array(
      v.object({
        exerciseId: v.id('exercises'),
        sets: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('workouts', args);
  },
});

export const update = mutation({
  args: {
    id: v.id('workouts'),
    name: v.string(),
    exercises: v.array(
      v.object({
        exerciseId: v.id('exercises'),
        sets: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    return await ctx.db.patch(id, data);
  },
});

export const remove = mutation({
  args: { id: v.id('workouts') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
