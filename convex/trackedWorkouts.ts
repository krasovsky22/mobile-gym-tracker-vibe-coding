import { v } from 'convex/values';

import { Id } from './_generated/dataModel';
import { mutation, query } from './_generated/server';
import { getUserId } from './users';

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

    // Get the original workout details
    const workout = await ctx.db.get(trackedWorkout.workoutId);
    if (!workout) {
      throw new Error('Workout not found');
    }

    type WorkoutExercise = {
      exerciseId: Id<'exercises'>;
      sets: number;
    };

    // Get all exercises for the workout
    const workoutExercises = workout.exercises as WorkoutExercise[];
    const workoutExerciseIds = workoutExercises.map((ex) => ex.exerciseId);
    const exercises = await Promise.all(workoutExerciseIds.map((id) => ctx.db.get(id)));

    // Combine workout with its exercises
    const workoutWithExercises = {
      ...workout,
      exercises: workoutExercises.map((ex, index) => ({
        ...ex,
        exercise: exercises[index],
      })),
    };

    // Get all tracked exercises for this workout
    const trackedExercises = await ctx.db
      .query('trackedWorkoutExercises')
      .filter((q) => q.eq(q.field('trackedWorkoutId'), args.id))
      .collect();

    // Get exercise details and sets for each tracked exercise
    const trackedExercisesWithDetails = await Promise.all(
      trackedExercises.map(async (trackedExercise) => {
        // Get the exercise details
        const exerciseDetails = await ctx.db.get(trackedExercise.exerciseId);

        // Get all sets for this exercise
        const sets = await ctx.db
          .query('trackedWorkoutExerciseSets')
          .filter((q) => q.eq(q.field('trackedWorkoutExerciseId'), trackedExercise._id))
          .collect();

        return {
          ...trackedExercise,
          exercise: exerciseDetails,
          sets: sets.sort((a, b) => a.setNumber - b.setNumber),
        };
      })
    );

    return {
      ...trackedWorkout,
      workout: workoutWithExercises,
      trackedExercises: trackedExercisesWithDetails,
    };
  },
});
