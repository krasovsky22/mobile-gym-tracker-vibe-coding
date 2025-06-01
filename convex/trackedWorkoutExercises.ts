import { v } from 'convex/values';

import { api } from './_generated/api';
import { Doc, Id } from './_generated/dataModel';
import { query, mutation, QueryCtx } from './_generated/server';
import { getUserId } from './users';

export type ExerciseSet = {
  weight: number;
  reps: number;
  isCompleted: boolean;
};

export const get = query({
  args: { id: v.id('trackedWorkoutExercises') },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    const trackedWorkoutExercise = await ctx.db.get(args.id);
    if (!trackedWorkoutExercise || trackedWorkoutExercise.userId !== userId) {
      throw new Error('Tracked workout exercise not found or unauthorized');
    }

    const exercise = await ctx.db
      .query('exercises')
      .filter((q) => q.eq(q.field('_id'), trackedWorkoutExercise.exerciseId))
      .first();
    if (!exercise) {
      throw new Error('Exercise not found');
    }
    // Get all sets for this tracked workout exercise
    const sets = await ctx.db
      .query('trackedWorkoutExerciseSets')
      .filter((q) => q.eq(q.field('trackedWorkoutExerciseId'), args.id))
      .collect();
    return {
      ...trackedWorkoutExercise,
      exercise,
      sets: sets.sort((a, b) => a.setNumber - b.setNumber),
    };
  },
});

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

type TrackedWorkoutType = Doc<'trackedWorkouts'> & {
  workout: Doc<'workouts'>;
};

export const moveToNextExercise = mutation({
  args: {
    trackedWorkoutId: v.id('trackedWorkouts'),
    selectedExerciseId: v.optional(v.id('exercises')),
    currentExerciseId: v.optional(v.id('trackedWorkoutExercises')),
  },
  handler: async (ctx, args) => {
    const { trackedWorkoutId, currentExerciseId, selectedExerciseId } = args;

    const trackedWorkout: TrackedWorkoutType | null = await ctx.runQuery(api.trackedWorkouts.get, {
      id: trackedWorkoutId,
    });
    if (!trackedWorkout) {
      throw new Error('Unable to find tracked workout');
    }

    let exerciseConfig;

    if (selectedExerciseId) {
      exerciseConfig = trackedWorkout.workout.exercises.find(
        (ex) => ex.exerciseId === selectedExerciseId
      );
    }

    if (!exerciseConfig) {
      throw new Error('Exercise configuration not found');
    }

    if (!exerciseConfig) {
      throw new Error('Exercise configuration not found');
    }

    // Create empty sets based on the workout configuration
    const emptySets = Array(exerciseConfig.sets)
      .fill(null)
      .map(() => ({
        weight: 0,
        reps: 0,
        isCompleted: false,
      }));

    const result: Id<'trackedWorkoutExercises'> = await ctx.runMutation(
      api.trackedWorkoutExercises.create,
      {
        trackedWorkoutId,
        exerciseId: exerciseConfig.exerciseId,
        sets: emptySets,
      }
    );

    return result;
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
