import { Id } from './_generated/dataModel';
import { mutation } from './_generated/server';
import { getAuthUserId } from "@convex-dev/auth/server";

export const ensureUser = mutation({
  handler: async (ctx) => {
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

    return user._id;
  },
});
