import { v } from 'convex/values';

import { api } from './_generated/api';
import { Id } from './_generated/dataModel';
import { mutation, query } from './_generated/server';

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<Id<'muscleGroups'>> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    // Ensure user exists and get their ID
    const userId = await ctx.runMutation(api.users.ensureUser, {});

    const now = Date.now();

    return await ctx.db.insert('muscleGroups', {
      name: args.name,
      description: args.description,
      createdBy: userId,
      updatedBy: userId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const findOrCreate = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<Id<'muscleGroups'>> => {
    // First try to find existing muscle group
    const existingMuscleGroup = await ctx.db
      .query('muscleGroups')
      .withIndex('by_name', (q) => q.eq('name', args.name))
      .first();

    if (existingMuscleGroup) {
      return existingMuscleGroup._id;
    }

    // If not found, create new one
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    // Ensure user exists and get their ID
    const userId = await ctx.runMutation(api.users.ensureUser, {});

    const now = Date.now();

    return await ctx.db.insert('muscleGroups', {
      name: args.name,
      description: args.description,
      createdBy: userId,
      updatedBy: userId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const list = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    return await ctx.db.query('muscleGroups').withIndex('by_name').collect();
  },
});

export const get = query({
  args: { id: v.id('muscleGroups') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    return await ctx.db.get(args.id);
  },
});

export const update = mutation({
  args: {
    id: v.id('muscleGroups'),
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<void> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const userId = await ctx.runMutation(api.users.ensureUser, {});

    const now = Date.now();

    await ctx.db.patch(args.id, {
      name: args.name,
      description: args.description,
      updatedBy: userId,
      updatedAt: now,
    });
  },
});

export const remove = mutation({
  args: { id: v.id('muscleGroups') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    await ctx.db.delete(args.id);
  },
});

export const searchByName = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const allMuscleGroups = await ctx.db.query('muscleGroups').withIndex('by_name').collect();

    const searchTermLower = args.searchTerm.toLowerCase();
    return allMuscleGroups.filter((muscleGroup) =>
      muscleGroup.name.toLowerCase().includes(searchTermLower)
    );
  },
});
