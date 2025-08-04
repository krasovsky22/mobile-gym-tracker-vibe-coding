import { v } from 'convex/values';

import { api } from './_generated/api';
import { Id } from './_generated/dataModel';
import { mutation, query } from './_generated/server';
import { getUserId } from './users';

export const list = query({
  args: {},
  handler: async (ctx) => {
    try {
      // Get current user ID if authenticated
      const userId = await getUserId(ctx);

      // Fetch all workouts and filter for public and user's personal workouts
      const allWorkouts = await ctx.db.query('workouts').collect();

      return allWorkouts.filter(
        (workout) =>
          // Public workouts (createdBy is null/undefined) or user's own workouts
          !workout.createdBy || workout.createdBy === userId
      );
    } catch {
      // If not authenticated, only return public workouts
      const allWorkouts = await ctx.db.query('workouts').collect();
      return allWorkouts.filter((workout) => !workout.createdBy);
    }
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

    return {
      ...workout,
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
  handler: async (ctx, args): Promise<Id<'workouts'>> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const now = Date.now();

    // Ensure user exists and get their ID
    const userId = await ctx.runMutation(api.users.ensureUser, {});

    return await ctx.db.insert('workouts', {
      name: args.name,
      exercises: args.exercises,
      createdBy: userId,
      updatedBy: userId,
      createdAt: now,
      updatedAt: now,
    });
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
    const userId = await getUserId(ctx);

    // Get the workout to check ownership
    const workout = await ctx.db.get(id);
    if (!workout) {
      throw new Error('Workout not found');
    }

    // Prevent editing public workouts (createdBy is null/undefined)
    if (!workout.createdBy) {
      throw new Error('Cannot edit public workouts');
    }

    // Prevent editing workouts not owned by the user
    if (workout.createdBy !== userId) {
      throw new Error('You can only edit your own workouts');
    }

    const now = Date.now();

    return await ctx.db.patch(id, {
      ...data,
      updatedBy: userId,
      updatedAt: now,
    });
  },
});

export const remove = mutation({
  args: { id: v.id('workouts') },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);

    // Get the workout to check ownership
    const workout = await ctx.db.get(args.id);
    if (!workout) {
      throw new Error('Workout not found');
    }

    // Prevent deleting public workouts (createdBy is null/undefined)
    if (!workout.createdBy) {
      throw new Error('Cannot delete public workouts');
    }

    // Prevent deleting workouts not owned by the user
    if (workout.createdBy !== userId) {
      throw new Error('You can only delete your own workouts');
    }

    await ctx.db.delete(args.id);
  },
});
