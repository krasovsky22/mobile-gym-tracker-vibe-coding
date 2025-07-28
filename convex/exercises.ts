import { v } from 'convex/values';

import { api } from './_generated/api';
import { Id } from './_generated/dataModel';
import { mutation, query } from './_generated/server';

export const create = mutation({
  args: {
    name: v.string(),
    categories: v.union(v.string(), v.array(v.string())),
    muscleGroups: v.union(v.string(), v.array(v.string())),
  },
  handler: async (ctx, args): Promise<Id<'exercises'>> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    // Ensure user exists and get their ID
    const userId = await ctx.runMutation(api.users.ensureUser, {});

    // Normalize categories to array
    const categoryNames = Array.isArray(args.categories) ? args.categories : [args.categories];
    const muscleGroupNames = Array.isArray(args.muscleGroups)
      ? args.muscleGroups
      : [args.muscleGroups];

    // Find or create all categories
    const categoryIds = await Promise.all(
      categoryNames.map((categoryName) =>
        ctx.runMutation(api.categories.findOrCreate, { name: categoryName })
      )
    );

    // Find or create all muscle groups
    const muscleGroupIds = await Promise.all(
      muscleGroupNames.map((muscleGroupName) =>
        ctx.runMutation(api.muscleGroups.findOrCreate, { name: muscleGroupName })
      )
    );

    const now = Date.now();

    return await ctx.db.insert('exercises', {
      name: args.name,
      categoryIds,
      muscleGroupIds,
      createdBy: userId,
      updatedBy: userId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Backward compatibility: create with single category and muscle group
export const createWithCategory = mutation({
  args: {
    name: v.string(),
    category: v.string(),
    muscleGroup: v.string(),
  },
  handler: async (ctx, args): Promise<Id<'exercises'>> => {
    return await ctx.runMutation(api.exercises.create, {
      name: args.name,
      categories: args.category,
      muscleGroups: args.muscleGroup,
    });
  },
});

export const get = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const exercise = await ctx.db.get(args.id as Id<'exercises'>);
    if (!exercise) {
      return null;
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

    return {
      ...exercise,
      categories: categoryNames,
      category: categoryNames[0] || 'Unknown', // For backward compatibility
      muscleGroups: muscleGroupNames,
      muscleGroup: muscleGroupNames[0] || 'Unknown', // For backward compatibility
    };
  },
});

export const update = mutation({
  args: {
    id: v.string(),
    name: v.string(),
    categories: v.union(v.string(), v.array(v.string())),
    muscleGroups: v.union(v.string(), v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const userId = await ctx.runMutation(api.users.ensureUser, {});

    // Normalize categories to array
    const categoryNames = Array.isArray(args.categories) ? args.categories : [args.categories];
    const muscleGroupNames = Array.isArray(args.muscleGroups)
      ? args.muscleGroups
      : [args.muscleGroups];

    // Find or create all categories
    const categoryIds = await Promise.all(
      categoryNames.map((categoryName) =>
        ctx.runMutation(api.categories.findOrCreate, { name: categoryName })
      )
    );

    // Find or create all muscle groups
    const muscleGroupIds = await Promise.all(
      muscleGroupNames.map((muscleGroupName) =>
        ctx.runMutation(api.muscleGroups.findOrCreate, { name: muscleGroupName })
      )
    );

    const now = Date.now();

    await ctx.db.patch(args.id as Id<'exercises'>, {
      name: args.name,
      categoryIds,
      muscleGroupIds,
      updatedBy: userId,
      updatedAt: now,
    });
  },
});

// Backward compatibility: update with single category and muscle group
export const updateWithCategory = mutation({
  args: {
    id: v.string(),
    name: v.string(),
    category: v.string(),
    muscleGroup: v.string(),
  },
  handler: async (ctx, args): Promise<void> => {
    await ctx.runMutation(api.exercises.update, {
      id: args.id,
      name: args.name,
      categories: args.category,
      muscleGroups: args.muscleGroup,
    });
  },
});

export const remove = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    await ctx.db.delete(args.id as Id<'exercises'>);
  },
});

export const findByIds = query({
  args: { ids: v.array(v.id('exercises')) },
  handler: async (ctx, args) => {
    const exercises = await Promise.all(args.ids.map((id) => ctx.db.get(id)));

    // Populate category and muscle group information for each exercise
    const exercisesWithDetails = await Promise.all(
      exercises.map(async (exercise) => {
        if (!exercise) return null;

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

        return {
          ...exercise,
          categories: categoryNames,
          category: categoryNames[0] || 'Unknown', // For backward compatibility
          muscleGroups: muscleGroupNames,
          muscleGroup: muscleGroupNames[0] || 'Unknown', // For backward compatibility
        };
      })
    );

    return exercisesWithDetails;
  },
});

export const list = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const exercises = await ctx.db.query('exercises').withIndex('by_name').collect();

    // Populate category and muscle group information for each exercise
    const exercisesWithDetails = await Promise.all(
      exercises.map(async (exercise) => {
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

        return {
          ...exercise,
          categories: categoryNames,
          category: categoryNames[0] || 'Unknown', // For backward compatibility
          muscleGroups: muscleGroupNames,
          muscleGroup: muscleGroupNames[0] || 'Unknown', // For backward compatibility
        };
      })
    );

    return exercisesWithDetails;
  },
});

export const listWithCategoryDetails = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const exercises = await ctx.db.query('exercises').withIndex('by_name').collect();

    // Populate full category and muscle group information for each exercise
    const exercisesWithDetails = await Promise.all(
      exercises.map(async (exercise) => {
        // Get all categories for this exercise
        const categories = await Promise.all(
          (exercise.categoryIds || []).map((categoryId) => ctx.db.get(categoryId))
        );

        // Get all muscle groups for this exercise
        const muscleGroups = await Promise.all(
          (exercise.muscleGroupIds || []).map((muscleGroupId) => ctx.db.get(muscleGroupId))
        );

        const categoryDetails = categories.filter(Boolean);
        const muscleGroupDetails = muscleGroups.filter(Boolean);

        return {
          ...exercise,
          categoryDetails,
          muscleGroupDetails,
        };
      })
    );

    return exercisesWithDetails;
  },
});

export const getByCategory = query({
  args: { categoryId: v.id('categories') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    // Since we now have arrays of categoryIds, we need to filter manually
    const allExercises = await ctx.db.query('exercises').withIndex('by_name').collect();

    const exercisesWithCategory = allExercises.filter((exercise) =>
      (exercise.categoryIds || []).includes(args.categoryId)
    );

    // Populate category and muscle group information for each exercise
    const exercisesWithDetails = await Promise.all(
      exercisesWithCategory.map(async (exercise) => {
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

        return {
          ...exercise,
          categories: categoryNames,
          category: categoryNames[0] || 'Unknown', // For backward compatibility
          muscleGroups: muscleGroupNames,
          muscleGroup: muscleGroupNames[0] || 'Unknown', // For backward compatibility
        };
      })
    );

    return exercisesWithDetails;
  },
});

export const searchByCategory = query({
  args: { categoryName: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    // First, find the category by name
    const category = await ctx.db
      .query('categories')
      .withIndex('by_name', (q) => q.eq('name', args.categoryName))
      .first();

    if (!category) {
      return []; // No category found, return empty array
    }

    // Then find exercises that include this category
    const allExercises = await ctx.db.query('exercises').withIndex('by_name').collect();

    const exercisesWithCategory = allExercises.filter((exercise) =>
      (exercise.categoryIds || []).includes(category._id)
    );

    // Populate category and muscle group information for each exercise
    const exercisesWithDetails = await Promise.all(
      exercisesWithCategory.map(async (exercise) => {
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

        return {
          ...exercise,
          categories: categoryNames,
          category: categoryNames[0] || 'Unknown', // For backward compatibility
          muscleGroups: muscleGroupNames,
          muscleGroup: muscleGroupNames[0] || 'Unknown', // For backward compatibility
        };
      })
    );

    return exercisesWithDetails;
  },
});

export const searchByName = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    // Search exercises by name (case-insensitive partial match)
    const allExercises = await ctx.db.query('exercises').withIndex('by_name').collect();

    const searchTermLower = args.searchTerm.toLowerCase();
    const matchingExercises = allExercises.filter((exercise) =>
      exercise.name.toLowerCase().includes(searchTermLower)
    );

    // Populate category and muscle group information for each exercise
    const exercisesWithDetails = await Promise.all(
      matchingExercises.map(async (exercise) => {
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

        return {
          ...exercise,
          categories: categoryNames,
          category: categoryNames[0] || 'Unknown', // For backward compatibility
          muscleGroups: muscleGroupNames,
          muscleGroup: muscleGroupNames[0] || 'Unknown', // For backward compatibility
        };
      })
    );

    return exercisesWithDetails;
  },
});

export const searchByMuscleGroup = query({
  args: { muscleGroup: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    // First, find the muscle group by name
    const muscleGroup = await ctx.db
      .query('muscleGroups')
      .withIndex('by_name', (q) => q.eq('name', args.muscleGroup))
      .first();

    if (!muscleGroup) {
      return []; // No muscle group found, return empty array
    }

    // Then find exercises that include this muscle group
    const allExercises = await ctx.db.query('exercises').withIndex('by_name').collect();

    const exercisesWithMuscleGroup = allExercises.filter((exercise) =>
      (exercise.muscleGroupIds || []).includes(muscleGroup._id)
    );

    // Populate category and muscle group information for each exercise
    const exercisesWithDetails = await Promise.all(
      exercisesWithMuscleGroup.map(async (exercise) => {
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

        return {
          ...exercise,
          categories: categoryNames,
          category: categoryNames[0] || 'Unknown', // For backward compatibility
          muscleGroups: muscleGroupNames,
          muscleGroup: muscleGroupNames[0] || 'Unknown', // For backward compatibility
        };
      })
    );

    return exercisesWithDetails;
  },
});
