# Exercise Migration Test Commands

This file contains example commands to test the exercise migration functionality.

## Quick Test Commands

### 1. Validate Current Schema

```bash
# Start Convex dev server (if not already running)
npx convex dev

# In another terminal, test the schema validation
# You can use the Convex dashboard or call these from your frontend
```

### 2. CLI Import Test (Fast Method)

```bash
# Import exercises using CLI
./migrate-exercises.sh import-cli

# OR manually:
npx convex import --table exercises seedExercises.jsonl
```

### 3. Deploy and Test Mutations

```bash
# Deploy the migration functions
./migrate-exercises.sh deploy

# OR manually:
npx convex deploy
```

### 4. Frontend Testing

Once deployed, test these mutations in your React app:

```typescript
// Test the validation queries (no auth required)
const validation = await convex.query(api.validateMigration.validateMigration, {});
console.log('Validation result:', validation);

const schemaCheck = await convex.query(api.validateMigration.checkSchema, {});
console.log('Schema check:', schemaCheck);

// Test authenticated seeding (requires login)
const seedResult = await convex.mutation(api.seedExercises.seedExercises, {});
console.log('Seed result:', seedResult);

// Get statistics
const stats = await convex.query(api.seedExercises.getExerciseStats, {});
console.log('Exercise stats:', stats);
```

### 5. Production Deployment

```bash
# Deploy to production
npx convex deploy --prod

# Import via CLI to production (if preferred)
npx convex import --prod --table exercises seedExercises.jsonl
```

## Expected Results

### Successful CLI Import

```json
{
  "imported": 130,
  "table": "exercises"
}
```

### Successful Mutation Seeding

```json
{
  "success": true,
  "message": "Successfully seeded 130 exercises",
  "insertedCount": 130,
  "insertedIds": ["id1", "id2", "..."]
}
```

### Exercise Statistics

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

## Common Test Scenarios

### Scenario 1: Fresh Database

1. Start with empty exercises table
2. Run `seedExercises` mutation
3. Verify 130 exercises are created
4. Check stats match expected breakdown

### Scenario 2: Existing Data

1. Try to run `seedExercises` with existing data
2. Should get error: "Database already contains X exercises"
3. Use `clearAndSeedExercises` to reset
4. Verify fresh seed works

### Scenario 3: CLI vs Mutation Comparison

1. Import via CLI (no user ownership)
2. Clear table
3. Import via mutation (with user ownership)
4. Compare data structure

## Troubleshooting Tests

### Test Authentication

```typescript
// Check if user is authenticated
const identity = await ctx.auth.getUserIdentity();
console.log('User identity:', identity);

// Check if user exists in database
const user = await convex.query(api.users.getCurrentUser, {});
console.log('Current user:', user);
```

### Test Schema Compatibility

```typescript
// Validate schema before migration
const schemaCheck = await convex.query(api.validateMigration.checkSchema, {});
if (!schemaCheck.success) {
  console.error('Schema incompatible:', schemaCheck.error);
}
```

### Test Data Integrity

```typescript
// After migration, validate data
const validation = await convex.query(api.validateMigration.validateMigration, {});
console.log('Data validation:', validation.validation);

// Check for missing fields
if (!validation.validation.fieldValidation.hasName) {
  console.error('Some exercises missing name field');
}
```

## Performance Testing

### Large Dataset Handling

- The migration handles 130 exercises efficiently
- All inserts happen in a single transaction
- Expected completion time: < 5 seconds

### Memory Usage

- JSON Lines file: ~15KB
- Migration script memory: minimal
- Database impact: negligible for 130 records

## Integration Testing

### Frontend Integration

1. Create a test component with seeding buttons
2. Test both success and error scenarios
3. Verify UI updates after seeding
4. Test statistics display

### API Testing

1. Test all mutation endpoints
2. Verify error handling
3. Test with different user states
4. Validate return values match documentation
