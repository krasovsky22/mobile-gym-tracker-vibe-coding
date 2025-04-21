# Mobile Gym Tracker

A React Native mobile application for tracking workouts and exercises, built with Expo and Convex.

## Features

- **Exercise Management**
  - Create and edit exercises
  - Categorize exercises by muscle groups
  - Search and filter exercises

- **Workout Management**
  - Create custom workouts with multiple exercises
  - Set number of sets for each exercise
  - Edit and delete workouts
  - Search and filter workouts

- **User Authentication**
  - GitHub OAuth integration
  - Secure user sessions
  - Protected routes

- **Account Settings**
  - View and update profile information
  - Manage connected accounts

## Tech Stack

- **Frontend**
  - React Native with Expo
  - Expo Router for navigation
  - Tailwind CSS for styling
  - TypeScript for type safety

- **Backend**
  - Convex for backend services
  - Real-time data synchronization
  - Authentication and authorization
  - Database management

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Expo CLI
- Convex account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/mobile-gym-tracker.git
   cd mobile-gym-tracker
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with:
   ```
   CONVEX_URL=your_convex_url
   ```

4. Start the development server:
   ```bash
   yarn start
   ```

5. Run on your device:
   - Scan the QR code with Expo Go app (iOS)
   - Scan the QR code with Expo Go app (Android)

## Project Structure

```
src/
├── app/                    # Expo Router app directory
│   ├── (tabs)/            # Tab navigation
│   │   ├── home/          # Home screen
│   │   ├── settings/      # Settings screens
│   │   └── track-workout/ # Workout tracking
│   ├── login.tsx          # Authentication screen
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
│   ├── ExerciseForm.tsx   # Exercise creation/editing
│   ├── WorkoutForm.tsx    # Workout creation/editing
│   └── ExerciseSelectModal.tsx # Exercise selection
└── convex/               # Backend functions
    ├── exercises.ts      # Exercise management
    ├── workouts.ts       # Workout management
    └── users.ts          # User management
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Expo](https://expo.dev/) for the amazing React Native development platform
- [Convex](https://www.convex.dev/) for the backend services
- [Tailwind CSS](https://tailwindcss.com/) for the styling utilities
