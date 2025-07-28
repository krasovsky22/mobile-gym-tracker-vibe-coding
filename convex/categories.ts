import { v } from 'convex/values';

import { api } from './_generated/api';
import { Id } from './_generated/dataModel';
import { mutation, query } from './_generated/server';

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<Id<'categories'>> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    // Check if category already exists
    const existingCategory = await ctx.db
      .query('categories')
      .withIndex('by_name', (q) => q.eq('name', args.name))
      .first();

    if (existingCategory) {
      throw new Error('Category already exists');
    }

    // Ensure user exists and get their ID
    const userId = await ctx.runMutation(api.users.ensureUser, {});
    const now = Date.now();

    return await ctx.db.insert('categories', {
      ...args,
      createdBy: userId,
      updatedBy: userId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const get = query({
  args: { id: v.id('categories') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    return await ctx.db.get(args.id);
  },
});

export const getByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    return await ctx.db
      .query('categories')
      .withIndex('by_name', (q) => q.eq('name', args.name))
      .first();
  },
});

export const update = mutation({
  args: {
    id: v.id('categories'),
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
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
  args: { id: v.id('categories') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    // Check if any exercises are using this category
    // We'll need to do a paginated check to avoid loading all exercises
    let hasExercisesUsingCategory = false;

    // Check in batches to avoid memory issues
    const PAGE_SIZE = 100;
    let cursor = null;

    while (true) {
      const exerciseBatch = await ctx.db
        .query('exercises')
        .paginate({ numItems: PAGE_SIZE, cursor });

      // Check this batch for the category
      const exerciseWithCategory = exerciseBatch.page.find((exercise) =>
        exercise.categoryIds?.includes(args.id)
      );

      if (exerciseWithCategory) {
        hasExercisesUsingCategory = true;
        break;
      }

      // If we've reached the end, break
      if (exerciseBatch.isDone) {
        break;
      }

      // Continue with next page
      cursor = exerciseBatch.continueCursor;
    }

    if (hasExercisesUsingCategory) {
      throw new Error('Cannot delete category that is being used by exercises');
    }

    await ctx.db.delete(args.id);
  },
});

export const list = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    return await ctx.db.query('categories').order('asc').collect();
  },
});

export const findOrCreate = mutation({
  args: { name: v.string() },
  handler: async (ctx, args): Promise<Id<'categories'>> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    // Try to find existing category
    const existingCategory = await ctx.db
      .query('categories')
      .withIndex('by_name', (q) => q.eq('name', args.name))
      .first();

    if (existingCategory) {
      return existingCategory._id;
    }

    // Create new category if it doesn't exist
    const userId = await ctx.runMutation(api.users.ensureUser, {});
    const now = Date.now();

    return await ctx.db.insert('categories', {
      name: args.name,
      createdBy: userId,
      updatedBy: userId,
      createdAt: now,
      updatedAt: now,
    });
  },
});
