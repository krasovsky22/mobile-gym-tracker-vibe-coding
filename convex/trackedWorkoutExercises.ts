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

    // Get all categories for this exercise
    const categories = await Promise.all(
      (exercise.categoryIds || []).map((categoryId) => ctx.db.get(categoryId))
    );

    // Get all muscle groups for this exercise
    const muscleGroups = await Promise.all(
      (exercise.muscleGroupIds || []).map((muscleGroupId) => ctx.db.get(muscleGroupId))
    );

    const categoryNames = categories.filter(Boolean).map((cat) => cat!.name);
    const muscleGroupNames = muscleGroups.filter(Boolean).map((mg) => mg!.name);

    // Enrich exercise with resolved names for backward compatibility
    const enrichedExercise = {
      ...exercise,
      categories: categoryNames,
      category: categoryNames[0] || 'Unknown', // For backward compatibility
      muscleGroups: muscleGroupNames,
      muscleGroup: muscleGroupNames[0] || 'Unknown', // For backward compatibility
    };

    // Get all sets for this tracked workout exercise
    const sets = await ctx.db
      .query('trackedWorkoutExerciseSets')
      .filter((q) => q.eq(q.field('trackedWorkoutExerciseId'), args.id))
      .collect();
    return {
      ...trackedWorkoutExercise,
      exercise: enrichedExercise,
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

// mark tracked workout exercise as completed
export const updateStatus = mutation({
  args: {
    id: v.id('trackedWorkoutExercises'),
    status: v.union(v.literal('started'), v.literal('in_progress'), v.literal('completed')),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);

    const trackedWorkoutExercise = await ctx.db.get(args.id);
    if (!trackedWorkoutExercise || trackedWorkoutExercise.userId !== userId) {
      throw new Error('Tracked workout exercise not found or unauthorized');
    }

    const updateData: any = {
      status: args.status,
      updatedAt: Date.now(),
    };

    // If marking as completed, set the completion timestamp
    if (args.status === 'completed') {
      updateData.completedAt = Date.now();
    }

    await ctx.db.patch(args.id, updateData);

    return args.id;
  },
});

type TrackedWorkoutType = Doc<'trackedWorkouts'> & {
  workout: Doc<'workouts'>;
};

type ExerciseConfig = {
  exerciseId: Id<'exercises'>;
  sets: number;
};

export const moveToNextExercise = mutation({
  args: {
    trackedWorkoutId: v.id('trackedWorkouts'),
    selectedExerciseId: v.optional(v.id('exercises')),
    currentExerciseId: v.optional(v.id('trackedWorkoutExercises')),
  },
  handler: async (ctx, args): Promise<Id<'trackedWorkoutExercises'> | null> => {
    const { trackedWorkoutId, selectedExerciseId, currentExerciseId } = args;

    const trackedWorkout: TrackedWorkoutType | null = await ctx.runQuery(api.trackedWorkouts.get, {
      id: trackedWorkoutId,
    });
    if (!trackedWorkout) {
      throw new Error('Unable to find tracked workout');
    }

    // If a specific exercise is selected, use that
    if (selectedExerciseId) {
      const exerciseConfig: ExerciseConfig | undefined = trackedWorkout.workout.exercises.find(
        (ex: ExerciseConfig) => ex.exerciseId === selectedExerciseId
      );
      if (!exerciseConfig) {
        throw new Error('Selected exercise not found in workout');
      }
      return await createTrackedExercise(ctx, trackedWorkoutId, exerciseConfig);
    }

    // If currentExerciseId is provided, find the next exercise in sequence
    if (currentExerciseId) {
      const currentTrackedExercise = await ctx.db.get(currentExerciseId);
      if (!currentTrackedExercise) {
        throw new Error('Current exercise not found');
      }

      // Find the current exercise's position in the workout
      const currentExerciseIndex = trackedWorkout.workout.exercises.findIndex(
        (ex: ExerciseConfig) => ex.exerciseId === currentTrackedExercise.exerciseId
      );

      if (currentExerciseIndex === -1) {
        throw new Error('Current exercise not found in workout');
      }

      // Get the next exercise in the sequence
      const nextExerciseIndex = currentExerciseIndex + 1;
      if (nextExerciseIndex >= trackedWorkout.workout.exercises.length) {
        return null;
      }

      const exerciseConfig: ExerciseConfig = trackedWorkout.workout.exercises[nextExerciseIndex];
      return await createTrackedExercise(ctx, trackedWorkoutId, exerciseConfig);
    }

    // Default case: get the first exercise in the workout
    const firstExerciseConfig: ExerciseConfig | undefined = trackedWorkout.workout.exercises[0];
    if (!firstExerciseConfig) {
      throw new Error('No exercises found in workout');
    }

    return await createTrackedExercise(ctx, trackedWorkoutId, firstExerciseConfig);
  },
});

// Helper function to create a tracked exercise with empty sets
async function createTrackedExercise(
  ctx: any,
  trackedWorkoutId: Id<'trackedWorkouts'>,
  exerciseConfig: ExerciseConfig
): Promise<Id<'trackedWorkoutExercises'>> {
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
}

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
