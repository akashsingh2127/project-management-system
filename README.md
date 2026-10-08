# Project Management System

## Overview
A comprehensive project management system that allows users to create and manage projects and tasks. It provides a real-time dashboard, task management, and project tracking across Web and Native Android platforms.

## Main Features
- **Authentication**: Secure login using Auth0.
- **Projects**: Create, view, and delete projects.
- **Tasks**: Create tasks within projects, mark them as completed/in progress, and delete tasks.
- **Dashboard**: Real-time overview of total projects, tasks in progress, and completed tasks. Recent projects and upcoming tasks sections.
- **History**: View and search completed tasks.
- **Cross-Platform**: Full support for both Web browsers and Android mobile devices.

## Technology Stack
- **Monorepo**: npm workspaces
- **Frontend (Web)**: React, Vite, Tailwind CSS
- **Mobile (Android)**: React Native, Expo, NativeWind
- **Backend (API)**: Node.js, Express, TypeScript
- **Database**: PostgreSQL (via Prisma ORM)
- **Caching**: Redis
- **Authentication**: Auth0

## Project Structure
```text
project-management-system/
├── apps/
│   ├── api/      # Express backend
│   ├── web/      # React web app
│   └── mobile/   # React Native Android app
├── packages/
│   ├── common/   # Shared types, schemas, and constants
│   ├── eslint-config/
│   └── tsconfig/
├── docker/       # Docker configuration for local dev
└── docs/         # Architecture and design documentation
```

## Environment Variables
Copy the `.env.example` file to `.env` in the root directory (and any necessary `.env` files in `apps/api`, `apps/web`, `apps/mobile`) and fill in your details:
- `DATABASE_URL`: PostgreSQL connection string.
- `REDIS_URL`: Redis connection string.
- `AUTH0_AUDIENCE`, `AUTH0_ISSUER_BASE_URL`: Auth0 credentials.

## Setup & Local Development

### 1. Docker Setup (Database & Redis)
Ensure Docker is running, then start the local database and Redis:
```sh
docker-compose up -d
```

### 2. Install Dependencies
```sh
npm install
```

### 3. Database / Prisma Setup
Navigate to the API app and run Prisma migrations:
```sh
cd apps/api
npx prisma migrate dev
```

### 4. Backend Setup
Start the API server from the root directory:
```sh
npm run dev --workspace=apps/api
```

### 5. Web Setup
Start the web frontend:
```sh
npm run dev --workspace=apps/web
```

### 6. Mobile Setup (Android)
To run the Android app, start the Expo development server:
```sh
cd apps/mobile
npx expo start -c
```
*Note: The mobile app uses native modules (like Auth0 and DateTimePicker) and requires a custom development build or running directly on a physical device/emulator via `npx expo run:android` rather than Expo Go.*

## Testing
Run the test suites (ensure you are in the correct workspace):
```sh
npm test --workspace=apps/api
npm test --workspace=apps/web
```

## Deployment Requirements
Before deploying, ensure:
- Production environment variables are securely set.
- Docker or a cloud provider (e.g., AWS, GCP, Vercel) is configured for the frontend, backend, PostgreSQL, and Redis.
- Auth0 settings are updated with production callback, logout, and allowed origin URLs.
- Prisma migrations are executed in the production database using `npx prisma migrate deploy`.

## Future Improvements
- iOS support for the mobile app.
- Role-based access control (RBAC) within projects.
- Push notifications for upcoming tasks.
- Advanced search and filtering on the web dashboard.
