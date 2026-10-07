# Project Management System

This is the monorepo for the Project Management System containing the backend API, Web Frontend, and Mobile App.

## Getting Started

1. Set up your environment variables by copying `.env.example` to `.env`.
2. Start local dependencies using Docker:
   ```sh
   docker-compose up -d
   ```
3. Install dependencies:
   ```sh
   npm install
   ```
4. Start the backend server:
   ```sh
   npm run dev -w @project-management/api
   ```
