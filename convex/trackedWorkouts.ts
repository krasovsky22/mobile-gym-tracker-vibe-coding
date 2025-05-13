import { v } from 'convex/values';

import { mutation, query } from './_generated/server';
import { getUserId } from './users';

export const create = mutation({
  args: {
    workoutId: v.id('workouts'),
    exercises: v.array(
      v.object({
        exerciseId: v.id('exercises'),
        sets: v.array(
          v.object({
            weight: v.number(),
            reps: v.number(),
            isCompleted: v.boolean(),
          })
        ),
      })
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    const workout = await ctx.db.get(args.workoutId);
    if (!workout) {
      throw new Error('Workout not found');
    }

    // Create tracked workout first
    const trackedWorkout = await ctx.db.insert('trackedWorkouts', {
      workoutId: args.workoutId,
      userId,
      date: Date.now(),
    });

    // Then create tracked workout exercises and their sets
    await Promise.all(
      args.exercises.map(async (exercise) => {
        const trackedExercise = await ctx.db.insert('trackedWorkoutExercises', {
          trackedWorkoutId: trackedWorkout,
          exerciseId: exercise.exerciseId,
          userId,
        });

        // Create sets for this exercise
        await Promise.all(
          exercise.sets.map((set, index) =>
            ctx.db.insert('trackedWorkoutExerciseSets', {
              trackedWorkoutExerciseId: trackedExercise,
              userId,
              setNumber: index + 1,
              weight: set.weight ?? 0,
              reps: set.reps,
              isCompleted: set.isCompleted,
            })
          )
        );
      })
    );

    return trackedWorkout;
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

export const get = query({
  args: { id: v.id('trackedWorkouts') },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    const trackedWorkout = await ctx.db.get(args.id);

    if (!trackedWorkout || trackedWorkout.userId !== userId) {
      return null;
    }

    const exercises = await ctx.db
      .query('trackedWorkoutExercises')
      .filter((q) => q.eq(q.field('trackedWorkoutId'), args.id))
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
      ...trackedWorkout,
      exercises: exercisesWithSets,
    };
  },
});
