/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as exercises from "../exercises.js";
import type * as http from "../http.js";
import type * as preferences from "../preferences.js";
import type * as trackedWorkoutExerciseSets from "../trackedWorkoutExerciseSets.js";
import type * as trackedWorkoutExercises from "../trackedWorkoutExercises.js";
import type * as trackedWorkouts from "../trackedWorkouts.js";
import type * as users from "../users.js";
import type * as validateMigration from "../validateMigration.js";
import type * as workouts from "../workouts.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  exercises: typeof exercises;
  http: typeof http;
  preferences: typeof preferences;
  trackedWorkoutExerciseSets: typeof trackedWorkoutExerciseSets;
  trackedWorkoutExercises: typeof trackedWorkoutExercises;
  trackedWorkouts: typeof trackedWorkouts;
  users: typeof users;
  validateMigration: typeof validateMigration;
  workouts: typeof workouts;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
