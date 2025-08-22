# Cellendar Backend API

A Node.js/Express backend with Supabase integration for the Cellendar cell culture tracking application.

## Features

- **Authentication**: User registration, login, logout with Supabase Auth
- **Culture Management**: CRUD operations for cell cultures
- **Task Management**: CRUD operations for culture-related tasks
- **Notification Settings**: User preference management
- **Security**: JWT authentication, rate limiting, CORS protection
- **Database**: PostgreSQL with Supabase, Row Level Security (RLS)

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Express Validator

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure your variables:

```bash
cp .env.example .env
```

Update `.env` with your Supabase credentials:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret_key_here
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:8081
```

### 3. Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL schema in the Supabase SQL editor:

```bash
# Copy the contents of database/schema.sql and run in Supabase SQL editor
```

This will create:
- Users table with RLS policies
- Cultures table with user isolation
- Tasks table linked to cultures
- Notification settings table
- Proper indexes and triggers

### 4. Development

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
npm start
```

### 5. API Testing

The API will be available at `http://localhost:3000`

Health check: `GET http://localhost:3000/health`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/profile` - Get user profile

### Cultures
- `GET /api/cultures` - Get all user cultures
- `GET /api/cultures/:id` - Get single culture
- `POST /api/cultures` - Create new culture
- `PUT /api/cultures/:id` - Update culture
- `DELETE /api/cultures/:id` - Delete culture
- `POST /api/cultures/:id/passage` - Increment passage number

### Tasks
- `GET /api/tasks` - Get all user tasks (with filters)
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/complete` - Mark task as completed
- `GET /api/tasks/today/list` - Get today's tasks
- `GET /api/tasks/overdue/list` - Get overdue tasks

### Notifications
- `GET /api/notifications/settings` - Get notification settings
- `PUT /api/notifications/settings` - Update notification settings

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <supabase_access_token>
```

## Database Schema

The database uses Row Level Security (RLS) to ensure users can only access their own data:

- **users**: User profiles linked to Supabase auth
- **cultures**: Cell culture records
- **tasks**: Culture-related tasks and schedules
- **notification_settings**: User notification preferences

## Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configured for frontend origin
- **Helmet**: Security headers
- **Input Validation**: Request validation with express-validator
- **RLS**: Database-level user isolation

## Error Handling

All endpoints return consistent JSON responses:

```json
{
  "success": boolean,
  "data": any,
  "error": string,
  "message": string
}
```

## Development Notes

- TypeScript for type safety
- Automatic timestamp updates with database triggers
- Comprehensive error handling and logging
- Modular route structure for maintainability
