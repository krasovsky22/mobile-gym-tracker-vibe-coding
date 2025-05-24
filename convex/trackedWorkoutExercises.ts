import { v } from 'convex/values';

import { Id } from './_generated/dataModel';
import { query, mutation, QueryCtx } from './_generated/server';
import { getUserId } from './users';

export type ExerciseSet = {
  weight: number;
  reps: number;
  isCompleted: boolean;
};

export const create = mutation({
  args: {
    trackedWorkoutId: v.id('trackedWorkouts'),
    exerciseId: v.id('exercises'),
    sets: v.array(
      v.object({
        weight: v.number(),
        reps: v.number(),
        isCompleted: v.boolean(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);

    // Create the tracked workout exercise first
    const trackedWorkoutExercise = await ctx.db.insert('trackedWorkoutExercises', {
      trackedWorkoutId: args.trackedWorkoutId,
      exerciseId: args.exerciseId,
      userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: 'started',
      completedAt: null,
    });

    // Then create all the sets for this exercise
    await Promise.all(
      args.sets.map((set, index) =>
        ctx.db.insert('trackedWorkoutExerciseSets', {
          trackedWorkoutExerciseId: trackedWorkoutExercise,
          setNumber: index + 1,
          ...set,
          userId,
        })
      )
    );

    return trackedWorkoutExercise;
  },
});

export const getWithSetsByTrackedWorkout = async (
  ctx: QueryCtx,
  { trackedWorkoutId }: { trackedWorkoutId: Id<'trackedWorkouts'> }
) => {
  const trackedWorkoutExercises = await ctx.db
    .query('trackedWorkoutExercises')
    .filter((q) => q.eq(q.field('trackedWorkoutId'), trackedWorkoutId))
    .collect();

  // For each exercise, get its sets
  return await Promise.all(
    trackedWorkoutExercises.map(async (trackedWorkoutExercise) => {
      const sets = await ctx.db
        .query('trackedWorkoutExerciseSets')
        .filter((q) => q.eq(q.field('trackedWorkoutExerciseId'), trackedWorkoutExercise._id))
        .collect();

      return {
        ...trackedWorkoutExercise,
        sets: sets.sort((a, b) => a.setNumber - b.setNumber),
      };
    })
  );
};
