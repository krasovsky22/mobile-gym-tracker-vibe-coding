import { query } from './_generated/server';

/**
 * Development helper query to validate the exercise migration
 * This query doesn't require authentication for testing purposes
 */
export const validateMigration = query({
  handler: async (ctx) => {
    try {
      // Get all exercises
      const exercises = await ctx.db.query('exercises').collect();

      // Basic validation
      const validation = {
        totalCount: exercises.length,
        hasData: exercises.length > 0,
        sampleExercise: exercises[0] || null,
        categories: [...new Set(exercises.map((e) => e.category))],
        muscleGroups: [...new Set(exercises.map((e) => e.muscleGroup))],
        fieldValidation: {
          hasName: exercises.every((e) => e.name && e.name.length > 0),
          hasCategory: exercises.every((e) => e.category && e.category.length > 0),
          hasMuscleGroup: exercises.every((e) => e.muscleGroup && e.muscleGroup.length > 0),
          hasCreatedBy: exercises.every((e) => e.createdBy),
          hasTimestamps: exercises.every((e) => e.createdAt && e.updatedAt),
        },
        categoryBreakdown: exercises.reduce(
          (acc, exercise) => {
            acc[exercise.category] = (acc[exercise.category] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        ),
        muscleGroupBreakdown: exercises.reduce(
          (acc, exercise) => {
            acc[exercise.muscleGroup] = (acc[exercise.muscleGroup] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        ),
      };

      return {
        success: true,
        validation,
        message:
          exercises.length > 0
            ? `Migration validation complete: ${exercises.length} exercises found`
            : 'No exercises found in database',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to validate migration',
      };
    }
  },
});

/**
 * Development helper to check the schema compatibility
 */
export const checkSchema = query({
  handler: async (ctx) => {
    try {
      // Try to query exercises with expected fields
      const exercises = await ctx.db.query('exercises').first();

      if (!exercises) {
        return {
          success: true,
          message: 'No exercises found, but schema appears compatible',
          schemaCheck: 'empty_table',
        };
      }

      // Check if the exercise has the expected fields
      const expectedFields = ['name', 'category', 'muscleGroup'];
      const optionalFields = ['createdBy', 'updatedBy', 'createdAt', 'updatedAt'];

      const fieldCheck = {
        required: expectedFields.every((field) => field in exercises),
        optional: optionalFields.map((field) => ({ field, present: field in exercises })),
        extraFields: Object.keys(exercises).filter(
          (key) =>
            !expectedFields.includes(key) && !optionalFields.includes(key) && !key.startsWith('_')
        ),
      };

      return {
        success: true,
        message: 'Schema check complete',
        schemaCheck: fieldCheck,
        sampleRecord: exercises,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Schema check failed',
      };
    }
  },
});
