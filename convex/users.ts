import { Id } from './_generated/dataModel';
import { mutation } from './_generated/server';

export const ensureUser = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const userId = identity.subject.split('|')[0] as Id<'users'>;
    const user = await ctx.db
      .query('users')
      .withIndex('by_id', (q) => q.eq('_id', userId))
      .first();

    if (!user) {
      throw new Error('User not found.');
    }

    return user._id;
  },
});
