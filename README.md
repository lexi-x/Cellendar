# Cellendar - Cell Culture Schedule Tracker

A React Native mobile app for personal cell culture schedule tracking with TypeScript.

## Features

### MVP - Phase 1 (Core Functionality)

✅ **Basic Culture Management**
- Add/Edit/Delete Cultures with name, cell type, start date
- Culture List View with simple overview of active cultures
- Culture Details with passage number, last action date, notes
- Culture Status tracking (active/paused/terminated)

✅ **Essential Task Management**
- Core Task Types: Media change/feeding, Passaging/splitting, Basic observation
- Schedule Tasks with date/time for next action
- Complete Tasks with automatic scheduling for next occurrence
- Task List with filtering (pending, overdue, completed, all)

✅ **Basic Notifications**
- Push Notifications for task reminders
- Overdue Alerts with red flag for missed tasks
- Configurable reminder timing (hours before due time)

✅ **Simple Dashboard**
- Today's Tasks showing immediate actions needed
- Active Cultures Count for quick overview
- Quick action buttons for adding new cultures/tasks
- Overdue task alerts

✅ **Data Persistence**
- Local Storage using AsyncStorage
- Data export/import functionality for backup

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on your device:
- For iOS: `npm run ios`
- For Android: `npm run android`

## Project Structure

```
src/
├── types/           # TypeScript type definitions
├── services/        # Data storage and notification services
├── screens/         # App screens/components
├── navigation/      # Navigation configuration
└── App.tsx         # Main app component
```

## Key Components

- **StorageService**: Handles all data persistence using AsyncStorage
- **NotificationService**: Manages push notifications and reminders
- **AppNavigator**: Tab-based navigation with stack navigators
- **Dashboard**: Overview of today's tasks and active cultures
- **Culture Management**: Full CRUD operations for cell cultures
- **Task Management**: Scheduling and tracking of culture tasks

## Usage

1. **Add Culture**: Create new cell cultures with basic information
2. **Schedule Tasks**: Set up media changes, passaging, and observations
3. **Track Progress**: Monitor task completion and culture status
4. **Get Reminders**: Receive notifications for upcoming and overdue tasks
5. **Export Data**: Backup your data for safekeeping

## Technologies Used

- React Native with Expo
- TypeScript
- AsyncStorage for local data persistence
- Expo Notifications for push notifications
- React Navigation for app navigation

## Future Enhancements

- Cloud synchronization
- Advanced scheduling patterns
- Culture growth tracking
- Photo documentation
- Lab inventory management
- Multi-user support
