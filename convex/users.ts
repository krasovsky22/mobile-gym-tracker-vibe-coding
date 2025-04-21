import { getAuthUserId } from '@convex-dev/auth/server';

import { mutation, query } from './_generated/server';

async function getCurrentSignedInUser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error('Not authenticated');
  }

  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error('Not authenticated');
  }

  const user = await ctx.db.get(userId);
  if (!user) {
    throw new Error('User not found.');
  }

  return user;
}

export const getCurrentUser = query({
  handler: async (ctx) => {
    return getCurrentSignedInUser(ctx);
  },
});

export const ensureUser = mutation({
  handler: async (ctx) => {
    const user = await getCurrentSignedInUser(ctx);
    return user._id;
  },
});
