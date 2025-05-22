import { v } from 'convex/values';

import { api } from './_generated/api';
import { internalQuery, mutation, query } from './_generated/server';
import { getUserId } from './users';
import * as Workout from './workouts';
import * as TrackedWorkoutExercise from './trackedWorkoutExercises';

export const create = mutation({
  args: {
    workoutId: v.id('workouts'),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    const workout = await ctx.db.get(args.workoutId);

    if (!workout) {
      throw new Error('Workout not found');
    }

    // Create tracked workout first
    const trackedWorkoutId = await ctx.db.insert('trackedWorkouts', {
      workoutId: args.workoutId,
      userId,
      status: 'started',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      completedAt: null,
    });

    return trackedWorkoutId;
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    const trackedWorkouts = await ctx.db
      .query('trackedWorkouts')
      .filter((q) => q.eq(q.field('userId'), userId))
      .collect();

    // For each tracked workout, get its exercises and their sets
    return await Promise.all(
      trackedWorkouts.map(async (workout) => {
        const exercises = await ctx.db
          .query('trackedWorkoutExercises')
          .filter((q) => q.eq(q.field('trackedWorkoutId'), workout._id))
          .collect();

        const exercisesWithSets = await Promise.all(
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

        return {
          ...workout,
          exercises: exercisesWithSets,
        };
      })
    );
  },
});

/**
 * load tracked workout
 * load exercises
 * load tracked exercises
 * lod workout exercise sets
 */
export const get = query({
  args: { id: v.id('trackedWorkouts') },
  handler: async (ctx, args) => {
    const trackedWorkout = await ctx.db.get(args.id);

    if (!trackedWorkout) {
      return null;
    }

    const workout = await Workout.get(ctx, { id: trackedWorkout.workoutId });

    if (!workout) {
      throw new Error('Workout not found');
    }

    const trackedWorkoutExercises = await TrackedWorkoutExercise.getWithSetsByTrackedWorkout(ctx, {
      trackedWorkoutId: args.id,
    });

    return {
      ...trackedWorkout,
      workout,
      trackedWorkoutExercises,
    };
  },
});
