import { v } from 'convex/values';

import { api } from './_generated/api';
import { Id } from './_generated/dataModel';
import { mutation, query, QueryCtx } from './_generated/server';

export const create = mutation({
  args: {
    name: v.string(),
    category: v.string(),
    muscleGroup: v.string(),
  },
  handler: async (ctx, args): Promise<Id<'exercises'>> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    // Ensure user exists and get their ID
    const userId = await ctx.runMutation(api.users.ensureUser, {});
    const now = Date.now();

    return await ctx.db.insert('exercises', {
      ...args,
      createdBy: userId,
      updatedBy: userId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const get = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    return await ctx.db.get(args.id as Id<'exercises'>);
  },
});

export const update = mutation({
  args: {
    id: v.string(),
    name: v.string(),
    category: v.string(),
    muscleGroup: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const userId = await ctx.runMutation(api.users.ensureUser, {});
    const now = Date.now();

    await ctx.db.patch(args.id as Id<'exercises'>, {
      name: args.name,
      category: args.category,
      muscleGroup: args.muscleGroup,
      updatedBy: userId,
      updatedAt: now,
    });
  },
});

export const remove = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    await ctx.db.delete(args.id as Id<'exercises'>);
  },
});

export const findByIds = async (ctx: QueryCtx, { ids }: { ids: Id<'exercises'>[] }) => {
  return await ctx.db
    .query('exercises')
    .filter((q) => ids.some((id) => q.eq(q.field('_id'), id)))
    .collect();
};

export const list = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    return await ctx.db.query('exercises').order('desc').collect();
  },
});
