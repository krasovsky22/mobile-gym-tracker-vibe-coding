import { v } from 'convex/values';

import { query, mutation } from './_generated/server';
import { getUserId } from './users';

export const getUserPreferences = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const userId = await getUserId(ctx);
    const userPrefs = await ctx.db
      .query('userPreferences')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    return userPrefs;
  },
});

export const updatePreferences = mutation({
  args: {
    isDarkMode: v.boolean(),
    notifications: v.boolean(),
    soundEffects: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const userId = await getUserId(ctx);
    const existingPrefs = await ctx.db
      .query('userPreferences')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    if (existingPrefs) {
      await ctx.db.patch(existingPrefs._id, {
        ...args,
        updatedAt: Date.now(),
      });
      return existingPrefs._id;
    }

    const prefsId = await ctx.db.insert('userPreferences', {
      userId,
      ...args,
      updatedAt: Date.now(),
    });

    return prefsId;
  },
});
