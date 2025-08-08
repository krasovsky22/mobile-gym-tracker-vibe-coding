import { v } from 'convex/values';

import { api } from './_generated/api';
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

    // Resolve muscle groups and categories for each exercise
    const exercisesWithDetails = await Promise.all(
      exercises.map(async (exercise) => {
        if (!exercise) return null;

        // Get all muscle groups for this exercise
        const muscleGroups = await Promise.all(
          (exercise.muscleGroupIds || []).map((muscleGroupId) => ctx.db.get(muscleGroupId))
        );

        // Get all categories for this exercise
        const categories = await Promise.all(
          (exercise.categoryIds || []).map((categoryId) => ctx.db.get(categoryId))
        );

        const muscleGroupNames = muscleGroups.filter(Boolean).map((mg) => mg!.name);
        const categoryNames = categories.filter(Boolean).map((cat) => cat!.name);

        return {
          ...exercise,
          muscleGroups: muscleGroupNames,
          categories: categoryNames,
          // Backward compatibility: provide first muscle group as muscleGroup
          muscleGroup: muscleGroupNames[0] || 'Unknown',
          // Backward compatibility: provide first category as category
          category: categoryNames[0] || 'Unknown',
        } as any;
      })
    );

    // Combine workout with its exercises
    const workoutWithExercises = {
      ...workout,
      exercises: workoutExercises.map((ex, index) => ({
        ...ex,
        exercise: exercisesWithDetails[index],
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

        let exerciseWithDetails = exerciseDetails;
        if (exerciseDetails) {
          // Get all muscle groups for this exercise
          const muscleGroups = await Promise.all(
            (exerciseDetails.muscleGroupIds || []).map((muscleGroupId) => ctx.db.get(muscleGroupId))
          );

          // Get all categories for this exercise
          const categories = await Promise.all(
            (exerciseDetails.categoryIds || []).map((categoryId) => ctx.db.get(categoryId))
          );

          const muscleGroupNames = muscleGroups.filter(Boolean).map((mg) => mg!.name);
          const categoryNames = categories.filter(Boolean).map((cat) => cat!.name);

          exerciseWithDetails = {
            ...exerciseDetails,
            muscleGroups: muscleGroupNames,
            categories: categoryNames,
            // Backward compatibility: provide first muscle group as muscleGroup
            muscleGroup: muscleGroupNames[0] || 'Unknown',
            // Backward compatibility: provide first category as category
            category: categoryNames[0] || 'Unknown',
          } as any;
        }

        // Get all sets for this exercise
        const sets = await ctx.db
          .query('trackedWorkoutExerciseSets')
          .filter((q) => q.eq(q.field('trackedWorkoutExerciseId'), trackedExercise._id))
          .collect();

        return {
          ...trackedExercise,
          exercise: exerciseWithDetails,
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

export const getCurrentInProgress = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);

    // Find the most recent in-progress or started workout
    const inProgressWorkout = await ctx.db
      .query('trackedWorkouts')
      .filter((q) => q.eq(q.field('userId'), userId))
      .filter((q) =>
        q.or(q.eq(q.field('status'), 'started'), q.eq(q.field('status'), 'in_progress'))
      )
      .order('desc')
      .first();

    if (!inProgressWorkout) {
      return null;
    }

    // Get the original workout details
    const workout = await ctx.db.get(inProgressWorkout.workoutId);
    if (!workout) {
      return null;
    }

    // Get tracked exercises to calculate progress
    const trackedExercises = await ctx.db
      .query('trackedWorkoutExercises')
      .filter((q) => q.eq(q.field('trackedWorkoutId'), inProgressWorkout._id))
      .collect();

    // Calculate completion percentage
    const totalExercises = workout.exercises.length;
    const completedExercises = trackedExercises.filter((ex) => ex.status === 'completed').length;
    const completionPercentage =
      totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;

    // Find the current active exercise (last started but not completed)
    const currentExercise = trackedExercises
      .filter((ex) => ex.status !== 'completed')
      .sort((a, b) => b.createdAt - a.createdAt)[0];

    return {
      ...inProgressWorkout,
      workout,
      totalExercises,
      completedExercises,
      completionPercentage,
      currentExercise,
      startTime: inProgressWorkout.createdAt,
    };
  },
});

export const complete = mutation({
  args: {
    id: v.id('trackedWorkouts'),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);

    // Get the tracked workout and verify ownership
    const trackedWorkout = await ctx.db.get(args.id);
    if (!trackedWorkout) {
      throw new Error('Tracked workout not found');
    }

    if (trackedWorkout.userId !== userId) {
      throw new Error('Unauthorized');
    }

    // Verify that all exercises are completed
    const trackedExercises = await ctx.db
      .query('trackedWorkoutExercises')
      .filter((q) => q.eq(q.field('trackedWorkoutId'), args.id))
      .collect();

    await Promise.all(
      trackedExercises.map(async (exercise) => {
        return ctx.runMutation(api.trackedWorkoutExercises.updateStatus, {
          status: 'completed',
          id: exercise._id,
        });
      })
    );

    // Update the tracked workout status to completed
    await ctx.db.patch(args.id, {
      status: 'completed',
      completedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

// Delete a tracked workout and cascade delete its exercises and sets
export const remove = mutation({
  args: { id: v.id('trackedWorkouts') },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);

    const trackedWorkout = await ctx.db.get(args.id);
    if (!trackedWorkout) {
      throw new Error('Tracked workout not found');
    }
    if (trackedWorkout.userId !== userId) {
      throw new Error('Unauthorized');
    }

    // Fetch all tracked exercises for this workout
    const trackedExercises = await ctx.db
      .query('trackedWorkoutExercises')
      .filter((q) => q.eq(q.field('trackedWorkoutId'), args.id))
      .collect();

    // For each tracked exercise, delete its sets, then the exercise itself
    await Promise.all(
      trackedExercises.map(async (exercise) => {
        const sets = await ctx.db
          .query('trackedWorkoutExerciseSets')
          .filter((q) => q.eq(q.field('trackedWorkoutExerciseId'), exercise._id))
          .collect();

        await Promise.all(sets.map((set) => ctx.db.delete(set._id)));
        await ctx.db.delete(exercise._id);
      })
    );

    // Finally, delete the tracked workout
    await ctx.db.delete(args.id);
    return args.id;
  },
});
