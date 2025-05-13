import { v } from 'convex/values';

import { mutation, query } from './_generated/server';
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

export const getByTrackedWorkout = query({
  args: { trackedWorkoutId: v.id('trackedWorkouts') },
  handler: async (ctx, args) => {
    const exercises = await ctx.db
      .query('trackedWorkoutExercises')
      .filter((q) => q.eq(q.field('trackedWorkoutId'), args.trackedWorkoutId))
      .collect();

    // For each exercise, get its sets
    return await Promise.all(
      exercises.map(async (exercise) => {
        const sets = await ctx.db
          .query('trackedWorkoutExerciseSets')
          .filter((q) => q.eq(q.field('trackedWorkoutExerciseId'), exercise._id))
          .collect();

        return {
          ...exercise,
          sets: sets.sort((a, b) => a.setNumber - b.setNumber),
        };
      })
    );
  },
});
