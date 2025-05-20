import { v } from 'convex/values';

import { query, mutation } from './_generated/server';

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('workouts').collect();
  },
});

export const get = query({
  args: { id: v.id('workouts') },
  handler: async (ctx, args) => {
    console.log('get in workouts');
    return await ctx.db.get(args.id);
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
