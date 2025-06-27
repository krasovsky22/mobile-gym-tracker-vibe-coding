# Exercise Database Migration Script

This document explains how to populate the exercises table in your Convex database with a comprehensive set of gym exercises.

## Overview

The migration provides **130+ exercises** covering all major muscle groups and exercise categories:

- **Chest**: 15 exercises (Bench Press variants, Flyes, Dips, Push-ups, etc.)
- **Back**: 20 exercises (Deadlifts, Pull-ups, Rows, Lat Pulldowns, etc.)
- **Shoulders**: 15 exercises (Presses, Raises, Rear Delt work, etc.)
- **Arms**: 17 exercises (Bicep Curls, Tricep Extensions, etc.)
- **Legs**: 20 exercises (Squats, Lunges, Leg Press, Calf Raises, etc.)
- **Core**: 14 exercises (Planks, Crunches, Russian Twists, etc.)
- **Cardio**: 12 exercises (Treadmill, Elliptical, HIIT movements, etc.)
- **Flexibility**: 12 exercises (Stretches, Yoga poses, etc.)
- **Functional**: 9 exercises (Kettlebell Swings, Turkish Get-ups, etc.)

## Migration Options

You have **two approaches** to populate the exercises table:

### Option 1: Convex CLI Import ⚠️ (Limited - Schema Incompatible)

**❌ This option is currently NOT COMPATIBLE with this project's schema.**

The CLI import would use:

```bash
# This WILL FAIL due to schema requirements
npx convex import --replace --table exercises seedExercises.jsonl
```

**Why it fails:**

- Schema requires `createdBy`, `updatedBy`, `createdAt`, `updatedAt` fields
- JSONL file only contains basic exercise data (name, category, muscleGroup)
- Cannot associate exercises with authenticated users
- Results in validation error: "Object is missing the required field `createdAt`"

**Use Option 2 instead** for this project.

### Option 2: Mutation-Based Seeding ⭐ (RECOMMENDED - Only Working Option)

Use the custom mutation functions that include full user ownership and validation:

```bash
# Start your Convex dev server
npx convex dev

# In your application, call the mutation
# This can be done through your frontend or via CLI
```

**Available Mutations:**

#### `seedExercises`

Seeds the database with exercises if it's empty:

```typescript
// Call from your frontend
const result = await convex.mutation(api.seedExercises.seedExercises, {});
```

**Features:**

- ✅ Requires authentication
- ✅ Includes user ownership (createdBy, updatedBy)
- ✅ Includes audit timestamps
- ✅ Prevents duplicate seeding
- ✅ Atomic transaction (all or nothing)

#### `clearAndSeedExercises`

Clears all existing exercises and re-seeds with fresh data:

```typescript
// Call from your frontend (use with caution)
const result = await convex.mutation(api.seedExercises.clearAndSeedExercises, {});
```

**Features:**

- ⚠️ **Destructive**: Deletes ALL existing exercises
- ✅ Requires authentication
- ✅ Includes full audit trail
- ✅ Atomic transaction

#### `getExerciseStats`

Get statistics about the current exercises in the database:

```typescript
// Call from your frontend
const stats = await convex.query(api.seedExercises.getExerciseStats, {});
```

**Returns:**

```json
{
  "total": 130,
  "byCategory": {
    "Strength": 95,
    "Cardio": 12,
    "Flexibility": 12,
    "Functional": 9
  },
  "byMuscleGroup": {
    "Chest": 15,
    "Back": 20,
    "Shoulders": 15,
    "Arms": 17,
    "Legs": 20,
    "Core": 14,
    "Full Body": 33
  }
}
```

## Database Schema

The exercises are inserted with the following structure:

```typescript
{
  name: string; // Exercise name (e.g., "Barbell Bench Press")
  category: string; // "Strength" | "Cardio" | "Flexibility" | "Functional"
  muscleGroup: string; // "Chest" | "Back" | "Shoulders" | "Arms" | "Legs" | "Core" | "Full Body"
  createdBy: Id<'users'>; // User who created the exercise (only with mutations)
  updatedBy: Id<'users'>; // User who last updated the exercise (only with mutations)
  createdAt: number; // Timestamp when created (only with mutations)
  updatedAt: number; // Timestamp when last updated (only with mutations)
}
```

## How to Use

### For Development Environment

1. **Start your Convex development server:**

   ```bash
   npx convex dev
   ```

2. **Choose your migration approach:**

   **Option A: CLI Import (Quick Setup)**

   ```bash
   npx convex import --table exercises seedExercises.jsonl
   ```

   **Option B: Authenticated Mutation (Recommended)**

   - Ensure you're logged into your app
   - Call the mutation from your frontend:

   ```typescript
   const result = await convex.mutation(api.seedExercises.seedExercises, {});
   console.log(result.message); // "Successfully seeded 130 exercises"
   ```

### For Production Environment

1. **Deploy your Convex functions:**

   ```bash
   npx convex deploy
   ```

2. **Use the authenticated mutation approach:**

   ```bash
   # Import to production (if using CLI approach)
   npx convex import --prod --table exercises seedExercises.jsonl

   # OR use the mutation approach through your deployed app
   ```

### Frontend Integration Example

```typescript
// In your React component
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

function ExerciseSeeder() {
  const seedExercises = useMutation(api.seedExercises.seedExercises);
  const exerciseStats = useQuery(api.seedExercises.getExerciseStats);

  const handleSeed = async () => {
    try {
      const result = await seedExercises({});
      alert(result.message);
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div>
      <h2>Exercise Database</h2>
      {exerciseStats && (
        <p>Current exercises: {exerciseStats.total}</p>
      )}
      <button onClick={handleSeed}>
        Seed Exercises
      </button>
    </div>
  );
}
```

## File Structure

```
/
├── convex/
│   ├── seedExercises.ts    # Migration mutations and exercise data
│   ├── exercises.ts        # Existing exercise CRUD operations
│   └── schema.ts           # Database schema
├── seedExercises.jsonl     # JSON Lines file for CLI import
└── MIGRATION_README.md     # This documentation
```

## Exercise Categories Breakdown

### Strength Training (95 exercises)

- **Chest** (15): Bench Press variations, Flyes, Dips, Push-ups
- **Back** (20): Deadlifts, Pull-ups, Rows, Lat Pulldowns
- **Shoulders** (15): Military Press, Lateral Raises, Front Raises
- **Arms** (17): Bicep Curls, Tricep Extensions, Hammer Curls
- **Legs** (20): Squats, Lunges, Leg Press, Calf Raises
- **Core** (14): Planks, Crunches, Russian Twists, Leg Raises

### Cardio (12 exercises)

- Treadmill Running/Walking
- Elliptical, Stationary Bike
- Rowing Machine, StairMaster
- HIIT movements (Burpees, Jump Rope, etc.)

### Flexibility (12 exercises)

- Yoga poses (Downward Dog, Child's Pose)
- Muscle-specific stretches
- Mobility work

### Functional (9 exercises)

- Kettlebell movements
- Turkish Get-ups
- Carry variations
- Crawling patterns

## Best Practices

1. **Use the mutation approach** for production environments to maintain data integrity
2. **Check existing data** before seeding to prevent duplicates
3. **Backup your database** before using `clearAndSeedExercises`
4. **Test on development** environment first
5. **Monitor the seeding process** using `getExerciseStats`

## Troubleshooting

### Common Issues

**"Database already contains X exercises"**

- Use `clearAndSeedExercises` to reset, or
- Manually delete existing exercises first

**"Not authenticated"**

- Ensure you're logged in before calling mutations
- Check your authentication setup

**Import fails with CLI**

- Verify your Convex project is properly configured
- Check that the JSONL file exists and is properly formatted

### Verification

After seeding, verify the import worked correctly:

```typescript
// Check total count
const stats = await convex.query(api.seedExercises.getExerciseStats, {});
console.log(`Total exercises: ${stats.total}`);

// List some exercises
const exercises = await convex.query(api.exercises.list, {});
console.log(`First 5 exercises:`, exercises.slice(0, 5));
```

## Support

If you encounter issues:

1. Check the Convex dashboard for error logs
2. Verify your authentication is working
3. Ensure your schema matches the expected structure
4. Check that all required Convex functions are deployed

For development questions, refer to the [Convex documentation](https://docs.convex.dev/).
