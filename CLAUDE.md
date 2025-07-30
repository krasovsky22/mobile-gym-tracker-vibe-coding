# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a mobile gym tracker app built with React Native, Expo, and Convex. It's a comprehensive fitness tracking application that allows users to create workouts, track exercises, and monitor their progress over time.

## Development Commands

### Core Development
- `npm start` or `yarn start` - Start Expo development server
- `npm run ios` - Start iOS simulator
- `npm run android` - Start Android emulator
- `npm run web` - Start web development server

### Code Quality
- `npm run lint` - Run ESLint and Prettier checks
- `npm run format` - Fix ESLint issues and format code with Prettier

### Backend Development
- `npm run dev` - Start Convex development server (for backend functions)
- `npm run migrate` - Run database migrations with seed data

### Building
- `npm run prebuild` - Generate native code for custom builds

## Architecture Overview

### Tech Stack
- **Frontend**: React Native with Expo (v53)
- **Backend**: Convex (real-time database and functions)
- **Authentication**: Convex Auth (@convex-dev/auth)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Navigation**: Expo Router with file-based routing
- **State Management**: Convex queries/mutations with React hooks

### Project Structure

#### Core App Structure
- `src/app/` - File-based routing with Expo Router
  - `_layout.tsx` - Root layout with providers (ConvexAuth, Theme, Alert)
  - `index.tsx` - Landing/redirect page
  - `login.tsx` - Authentication screen
  - `(tabs)/` - Main tab navigation
    - `home/` - Dashboard and overview
    - `track-workout/` - Workout tracking functionality
    - `settings/` - User preferences and configuration

#### Backend (Convex)
- `convex/schema.ts` - Database schema definitions
- `convex/auth.ts` - Authentication configuration
- Database tables: `exercises`, `workouts`, `categories`, `muscleGroups`, `trackedWorkouts`, `trackedWorkoutExercises`, `trackedWorkoutExerciseSets`, `userPreferences`

#### Components & UI
- `src/components/` - Reusable React Native components
- `src/theme/` - Custom themed UI components (Button, Text, TextInput, etc.)
- `src/context/` - React contexts for global state (theme, alerts)

### Key Features

#### Workout Tracking System
The app has a sophisticated workout tracking system with three levels:
1. **TrackedWorkouts** - Overall workout session
2. **TrackedWorkoutExercises** - Individual exercises within a workout
3. **TrackedWorkoutExerciseSets** - Individual sets with weight/reps data

Features include:
- Real-time auto-save with 2-second debounce
- Swipeable gesture system for set deletion
- Continue workout functionality
- Status progression (started → in_progress → completed)
- Comprehensive workout history

#### Authentication
- Uses Convex Auth with secure token storage
- Platform-specific secure storage (SecureStore on mobile)
- Protected routes with `ProtectedRoute` component

## Important Implementation Details

### Real-time Data Sync
The app uses Convex for real-time data synchronization. All workout data is automatically synced across devices with optimistic updates for immediate user feedback.

### Auto-save System
Workout sets are automatically saved with a 2-second debounce timer. The system includes:
- Optimistic UI updates
- Pending save indicators
- Error handling without disrupting UX
- Batch operations for efficiency

### Theme System
Dark/light mode support with:
- Theme context provider (`src/context/theme.tsx`)
- Themed components in `src/theme/`
- User preferences stored in database

### Navigation Patterns
- Uses Expo Router with file-based routing
- Tab navigation with custom reset behavior
- Protected routes require authentication
- Dynamic routes for workout/exercise IDs

## Development Guidelines

### Code Style
- TypeScript throughout the application
- ESLint with Universe config for React Native
- Prettier for code formatting
- Tailwind CSS classes via NativeWind

### Database Operations
- Use Convex queries for reading data
- Use Convex mutations for writing data
- Always include proper TypeScript typing
- Handle loading and error states

### Component Patterns
- Functional components with hooks
- Custom themed components from `src/theme/`
- Reusable components in `src/components/`
- Context providers for global state

## Current Development Status

### Completed Features
- Core workout tracking architecture
- Real-time auto-save system
- Advanced set management with swipeable gestures
- User authentication and protected routes
- Basic workout history and analytics
- Continue workout functionality

### In Progress
- Workout completion flow (button exists, logic incomplete in `src/app/(tabs)/track-workout/[id]/track.tsx:146`)
- Exercise status management improvements

### High Priority Next Features
- Rest timer functionality
- Workout summary screen with statistics
- Progress analytics and charts
- Enhanced exercise details with muscle group visualization

Refer to `TODO.md` and `TRACK_WORKOUT_TASKS.md` for detailed task lists and feature roadmap.

## Environment Setup

The app requires:
- Expo CLI
- Node.js and npm/yarn
- Convex account and project setup
- Environment variable: `EXPO_PUBLIC_CONVEX_URL`

For mobile development, you'll need:
- iOS Simulator (for iOS development)
- Android Studio/Emulator (for Android development)
- Expo Go app for physical device testing