import { v } from 'convex/values';

import type { Id } from './_generated/dataModel';
import { mutation, query } from './_generated/server';

// Default exercise categories for fitness tracking
const DEFAULT_CATEGORIES = [
  {
    name: 'Strength',
    description: 'Resistance training exercises using weights, machines, or bodyweight',
  },
  {
    name: 'Cardio',
    description: 'Cardiovascular exercises to improve heart health and endurance',
  },
  {
    name: 'Flexibility',
    description: 'Stretching and mobility exercises to improve range of motion',
  },
  {
    name: 'Functional',
    description: 'Multi-joint movements that mimic everyday activities',
  },
  {
    name: 'Olympic Lifting',
    description: 'Complex barbell movements focusing on power and technique',
  },
  {
    name: 'Powerlifting',
    description: 'Competition-based strength movements: squat, bench press, deadlift',
  },
  {
    name: 'Plyometric',
    description: 'Explosive movements to develop power and speed',
  },
  {
    name: 'Rehabilitation',
    description: 'Therapeutic exercises for injury recovery and prevention',
  },
  {
    name: 'Balance',
    description: 'Exercises to improve stability and proprioception',
  },
  {
    name: 'Core',
    description: 'Exercises targeting the abdominal and trunk muscles',
  },
];

// Default muscle groups for exercise targeting
const DEFAULT_MUSCLE_GROUPS = [
  {
    name: 'Chest',
    description: 'Pectoralis major and minor muscles',
  },
  {
    name: 'Back',
    description: 'Latissimus dorsi, rhomboids, trapezius, and erector spinae',
  },
  {
    name: 'Shoulders',
    description: 'Deltoids (anterior, lateral, posterior)',
  },
  {
    name: 'Arms',
    description: 'Biceps, triceps, and forearms',
  },
  {
    name: 'Legs',
    description: 'Quadriceps, hamstrings, glutes, and calves',
  },
  {
    name: 'Core',
    description: 'Abdominals, obliques, and lower back',
  },
  {
    name: 'Glutes',
    description: 'Gluteus maximus, medius, and minimus',
  },
  {
    name: 'Calves',
    description: 'Gastrocnemius and soleus muscles',
  },
  {
    name: 'Forearms',
    description: 'Wrist flexors and extensors',
  },
  {
    name: 'Traps',
    description: 'Upper, middle, and lower trapezius',
  },
  {
    name: 'Lats',
    description: 'Latissimus dorsi muscles',
  },
  {
    name: 'Hamstrings',
    description: 'Biceps femoris, semitendinosus, and semimembranosus',
  },
  {
    name: 'Quadriceps',
    description: 'Rectus femoris, vastus lateralis, medialis, and intermedius',
  },
  {
    name: 'Biceps',
    description: 'Biceps brachii and brachialis',
  },
  {
    name: 'Triceps',
    description: 'Triceps brachii (long, lateral, and medial heads)',
  },
];

// Default exercises to get users started
const DEFAULT_EXERCISES = [
  // Strength - Chest
  {
    name: 'Bench Press',
    categories: ['Strength'],
    muscleGroups: ['Chest', 'Triceps', 'Shoulders'],
  },
  {
    name: 'Push-ups',
    categories: ['Strength', 'Functional'],
    muscleGroups: ['Chest', 'Triceps', 'Core'],
  },
  {
    name: 'Incline Dumbbell Press',
    categories: ['Strength'],
    muscleGroups: ['Chest', 'Shoulders', 'Triceps'],
  },
  { name: 'Chest Flyes', categories: ['Strength'], muscleGroups: ['Chest'] },

  // Strength - Back
  {
    name: 'Pull-ups',
    categories: ['Strength', 'Functional'],
    muscleGroups: ['Lats', 'Back', 'Biceps'],
  },
  {
    name: 'Deadlift',
    categories: ['Strength', 'Powerlifting'],
    muscleGroups: ['Back', 'Legs', 'Glutes', 'Traps'],
  },
  { name: 'Bent-over Row', categories: ['Strength'], muscleGroups: ['Back', 'Lats', 'Biceps'] },
  { name: 'Lat Pulldown', categories: ['Strength'], muscleGroups: ['Lats', 'Back', 'Biceps'] },

  // Strength - Legs
  {
    name: 'Squat',
    categories: ['Strength', 'Powerlifting'],
    muscleGroups: ['Quadriceps', 'Glutes', 'Core'],
  },
  {
    name: 'Lunges',
    categories: ['Strength', 'Functional'],
    muscleGroups: ['Quadriceps', 'Glutes', 'Hamstrings'],
  },
  {
    name: 'Romanian Deadlift',
    categories: ['Strength'],
    muscleGroups: ['Hamstrings', 'Glutes', 'Back'],
  },
  { name: 'Calf Raises', categories: ['Strength'], muscleGroups: ['Calves'] },

  // Strength - Shoulders
  {
    name: 'Overhead Press',
    categories: ['Strength'],
    muscleGroups: ['Shoulders', 'Triceps', 'Core'],
  },
  { name: 'Lateral Raises', categories: ['Strength'], muscleGroups: ['Shoulders'] },
  { name: 'Rear Delt Flyes', categories: ['Strength'], muscleGroups: ['Shoulders', 'Back'] },

  // Strength - Arms
  { name: 'Bicep Curls', categories: ['Strength'], muscleGroups: ['Biceps'] },
  {
    name: 'Tricep Dips',
    categories: ['Strength', 'Functional'],
    muscleGroups: ['Triceps', 'Shoulders'],
  },
  { name: 'Hammer Curls', categories: ['Strength'], muscleGroups: ['Biceps', 'Forearms'] },

  // Core
  { name: 'Plank', categories: ['Core', 'Functional'], muscleGroups: ['Core'] },
  { name: 'Crunches', categories: ['Core'], muscleGroups: ['Core'] },
  { name: 'Russian Twists', categories: ['Core'], muscleGroups: ['Core'] },
  { name: 'Mountain Climbers', categories: ['Core', 'Cardio'], muscleGroups: ['Core', 'Legs'] },

  // Cardio
  { name: 'Running', categories: ['Cardio'], muscleGroups: ['Legs', 'Core'] },
  { name: 'Cycling', categories: ['Cardio'], muscleGroups: ['Legs'] },
  { name: 'Jumping Jacks', categories: ['Cardio', 'Plyometric'], muscleGroups: ['Legs', 'Arms'] },
  {
    name: 'Burpees',
    categories: ['Cardio', 'Functional', 'Plyometric'],
    muscleGroups: ['Legs', 'Arms', 'Core', 'Chest'],
  },

  // Olympic Lifting
  {
    name: 'Clean and Jerk',
    categories: ['Olympic Lifting'],
    muscleGroups: ['Legs', 'Back', 'Shoulders', 'Arms'],
  },
  {
    name: 'Snatch',
    categories: ['Olympic Lifting'],
    muscleGroups: ['Legs', 'Back', 'Shoulders', 'Arms'],
  },

  // Flexibility
  { name: 'Hamstring Stretch', categories: ['Flexibility'], muscleGroups: ['Hamstrings'] },
  { name: 'Shoulder Stretch', categories: ['Flexibility'], muscleGroups: ['Shoulders'] },
  { name: 'Hip Flexor Stretch', categories: ['Flexibility'], muscleGroups: ['Legs'] },

  // Plyometric
  { name: 'Box Jumps', categories: ['Plyometric'], muscleGroups: ['Legs', 'Glutes'] },
  { name: 'Jump Squats', categories: ['Plyometric', 'Strength'], muscleGroups: ['Legs', 'Glutes'] },

  // Balance
  { name: 'Single Leg Stand', categories: ['Balance'], muscleGroups: ['Legs', 'Core'] },
  {
    name: 'Bosu Ball Squats',
    categories: ['Balance', 'Functional'],
    muscleGroups: ['Legs', 'Core'],
  },
];

// Seed exercise categories
export const seedCategories = mutation({
  args: {},
  handler: async (
    ctx
  ): Promise<{ success: boolean; message: string; created: number; skipped: number }> => {
    const now = Date.now();
    let created = 0;
    let skipped = 0;

    for (const category of DEFAULT_CATEGORIES) {
      // Check if category already exists
      const existing = await ctx.db
        .query('categories')
        .withIndex('by_name', (q) => q.eq('name', category.name))
        .first();

      if (!existing) {
        await ctx.db.insert('categories', {
          name: category.name,
          description: category.description,
          createdAt: now,
          updatedAt: now,
        });
        created++;
      } else {
        skipped++;
      }
    }

    return {
      success: true,
      message: `Categories seeded: ${created} created, ${skipped} already existed`,
      created,
      skipped,
    };
  },
});

// Seed muscle groups
export const seedMuscleGroups = mutation({
  args: {},
  handler: async (
    ctx
  ): Promise<{ success: boolean; message: string; created: number; skipped: number }> => {
    const now = Date.now();
    let created = 0;
    let skipped = 0;

    for (const muscleGroup of DEFAULT_MUSCLE_GROUPS) {
      // Check if muscle group already exists
      const existing = await ctx.db
        .query('muscleGroups')
        .withIndex('by_name', (q) => q.eq('name', muscleGroup.name))
        .first();

      if (!existing) {
        await ctx.db.insert('muscleGroups', {
          name: muscleGroup.name,
          description: muscleGroup.description,
          createdAt: now,
          updatedAt: now,
        });
        created++;
      } else {
        skipped++;
      }
    }

    return {
      success: true,
      message: `Muscle groups seeded: ${created} created, ${skipped} already existed`,
      created,
      skipped,
    };
  },
});

// Seed default exercises
export const seedExercises = mutation({
  args: {},
  handler: async (
    ctx
  ): Promise<{
    success: boolean;
    message: string;
    created: number;
    skipped: number;
    errors: string[];
  }> => {
    const now = Date.now();
    let created = 0;
    let skipped = 0;
    const errors: string[] = [];

    // First, get all categories and muscle groups for ID mapping
    const allCategories = await ctx.db.query('categories').collect();
    const allMuscleGroups = await ctx.db.query('muscleGroups').collect();

    const categoryMap = new Map(allCategories.map((c) => [c.name, c._id]));
    const muscleGroupMap = new Map(allMuscleGroups.map((mg) => [mg.name, mg._id]));

    for (const exercise of DEFAULT_EXERCISES) {
      try {
        // Check if exercise already exists
        const existing = await ctx.db
          .query('exercises')
          .withIndex('by_name', (q) => q.eq('name', exercise.name))
          .first();

        if (!existing) {
          // Map category names to IDs
          const categoryIds = exercise.categories
            .map((catName) => categoryMap.get(catName))
            .filter((id) => id !== undefined) as Id<'categories'>[];

          // Map muscle group names to IDs
          const muscleGroupIds = exercise.muscleGroups
            .map((mgName) => muscleGroupMap.get(mgName))
            .filter((id) => id !== undefined) as Id<'muscleGroups'>[];

          // Only create if we found matching categories and muscle groups
          if (categoryIds.length > 0 && muscleGroupIds.length > 0) {
            await ctx.db.insert('exercises', {
              name: exercise.name,
              categoryIds,
              muscleGroupIds,
              createdAt: now,
              updatedAt: now,
            });
            created++;
          } else {
            errors.push(`${exercise.name}: Missing category or muscle group mappings`);
          }
        } else {
          skipped++;
        }
      } catch (error) {
        errors.push(
          `${exercise.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    return {
      success: errors.length === 0,
      message: `Exercises seeded: ${created} created, ${skipped} already existed${errors.length > 0 ? `, ${errors.length} errors` : ''}`,
      created,
      skipped,
      errors,
    };
  },
});

// Get seeding statistics
export const getStats = query({
  handler: async (ctx) => {
    const categoriesCount = await ctx.db
      .query('categories')
      .collect()
      .then((cats) => cats.length);
    const muscleGroupsCount = await ctx.db
      .query('muscleGroups')
      .collect()
      .then((mgs) => mgs.length);
    const exercisesCount = await ctx.db
      .query('exercises')
      .collect()
      .then((exs) => exs.length);

    return {
      categories: categoriesCount,
      muscleGroups: muscleGroupsCount,
      exercises: exercisesCount,
      expectedCategories: DEFAULT_CATEGORIES.length,
      expectedMuscleGroups: DEFAULT_MUSCLE_GROUPS.length,
      expectedExercises: DEFAULT_EXERCISES.length,
    };
  },
});

// Reset all seeded data (useful for development)
export const resetAll = mutation({
  args: {
    confirm: v.boolean(),
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    success: boolean;
    message: string;
    deleted: { categories: number; muscleGroups: number; exercises: number };
  }> => {
    if (!args.confirm) {
      throw new Error('Reset operation requires confirmation. Set confirm: true to proceed.');
    }

    // Delete all exercises first (to avoid foreign key issues)
    const exercises = await ctx.db.query('exercises').collect();
    for (const exercise of exercises) {
      await ctx.db.delete(exercise._id);
    }

    // Delete all categories
    const categories = await ctx.db.query('categories').collect();
    for (const category of categories) {
      await ctx.db.delete(category._id);
    }

    // Delete all muscle groups
    const muscleGroups = await ctx.db.query('muscleGroups').collect();
    for (const muscleGroup of muscleGroups) {
      await ctx.db.delete(muscleGroup._id);
    }

    return {
      success: true,
      message: `Reset completed: ${exercises.length} exercises, ${categories.length} categories, ${muscleGroups.length} muscle groups deleted`,
      deleted: {
        categories: categories.length,
        muscleGroups: muscleGroups.length,
        exercises: exercises.length,
      },
    };
  },
});

// Full migration - seed all data in proper order
export const fullMigration = mutation({
  args: {},
  handler: async (ctx): Promise<{ success: boolean; message: string; results: any[] }> => {
    const results = [];
    const now = Date.now();

    try {
      // Step 1: Seed categories
      let categoriesCreated = 0;
      let categoriesSkipped = 0;

      for (const category of DEFAULT_CATEGORIES) {
        const existing = await ctx.db
          .query('categories')
          .withIndex('by_name', (q: any) => q.eq('name', category.name))
          .first();

        if (!existing) {
          await ctx.db.insert('categories', {
            name: category.name,
            description: category.description,
            createdAt: now,
            updatedAt: now,
          });
          categoriesCreated++;
        } else {
          categoriesSkipped++;
        }
      }

      results.push({
        step: 'categories',
        success: true,
        message: `Categories seeded: ${categoriesCreated} created, ${categoriesSkipped} already existed`,
        created: categoriesCreated,
        skipped: categoriesSkipped,
      });

      // Step 2: Seed muscle groups
      let muscleGroupsCreated = 0;
      let muscleGroupsSkipped = 0;

      for (const muscleGroup of DEFAULT_MUSCLE_GROUPS) {
        const existing = await ctx.db
          .query('muscleGroups')
          .withIndex('by_name', (q: any) => q.eq('name', muscleGroup.name))
          .first();

        if (!existing) {
          await ctx.db.insert('muscleGroups', {
            name: muscleGroup.name,
            description: muscleGroup.description,
            createdAt: now,
            updatedAt: now,
          });
          muscleGroupsCreated++;
        } else {
          muscleGroupsSkipped++;
        }
      }

      results.push({
        step: 'muscleGroups',
        success: true,
        message: `Muscle groups seeded: ${muscleGroupsCreated} created, ${muscleGroupsSkipped} already existed`,
        created: muscleGroupsCreated,
        skipped: muscleGroupsSkipped,
      });

      // Step 3: Seed exercises
      let exercisesCreated = 0;
      let exercisesSkipped = 0;
      const exerciseErrors: string[] = [];

      // Get all categories and muscle groups for ID mapping
      const allCategories = await ctx.db.query('categories').collect();
      const allMuscleGroups = await ctx.db.query('muscleGroups').collect();

      const categoryMap = new Map(allCategories.map((c: any) => [c.name, c._id]));
      const muscleGroupMap = new Map(allMuscleGroups.map((mg: any) => [mg.name, mg._id]));

      for (const exercise of DEFAULT_EXERCISES) {
        try {
          const existing = await ctx.db
            .query('exercises')
            .withIndex('by_name', (q: any) => q.eq('name', exercise.name))
            .first();

          if (!existing) {
            const categoryIds = exercise.categories
              .map((catName) => categoryMap.get(catName))
              .filter((id) => id !== undefined);

            const muscleGroupIds = exercise.muscleGroups
              .map((mgName) => muscleGroupMap.get(mgName))
              .filter((id) => id !== undefined);

            if (categoryIds.length > 0 && muscleGroupIds.length > 0) {
              await ctx.db.insert('exercises', {
                name: exercise.name,
                categoryIds,
                muscleGroupIds,
                createdAt: now,
                updatedAt: now,
              });
              exercisesCreated++;
            } else {
              exerciseErrors.push(`${exercise.name}: Missing category or muscle group mappings`);
            }
          } else {
            exercisesSkipped++;
          }
        } catch (error) {
          exerciseErrors.push(
            `${exercise.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }

      results.push({
        step: 'exercises',
        success: exerciseErrors.length === 0,
        message: `Exercises seeded: ${exercisesCreated} created, ${exercisesSkipped} already existed${exerciseErrors.length > 0 ? `, ${exerciseErrors.length} errors` : ''}`,
        created: exercisesCreated,
        skipped: exercisesSkipped,
        errors: exerciseErrors,
      });

      const allSuccessful = results.every((r) => r.success);
      const totalCreated = results.reduce((sum, r) => sum + (r.created || 0), 0);

      return {
        success: allSuccessful,
        message: `Full migration completed: ${totalCreated} total items created`,
        results,
      };
    } catch (error) {
      return {
        success: false,
        message: `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        results,
      };
    }
  },
});
