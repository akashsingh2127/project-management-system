# Database Design

This document details the database schema and relationships for the Project Management System using PostgreSQL and Prisma ORM.

## Overview
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Core Entities:** `User`, `Project`, `Task`

## Tables & Fields

### User
Stores application users mapped via Auth0 identities.
- `id` (String/UUID, Primary Key)
- `auth0Subject` (String, Unique) - Maps Auth0 identity
- `email` (String, Unique)
- `fullName` (String)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### Project
Stores projects owned by users.
- `id` (String/UUID, Primary Key)
- `userId` (String/UUID, Foreign Key to User)
- `name` (String)
- `description` (String, Nullable)
- `status` (Enum `ProjectStatus`): `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`
- `startDate` (DateTime, Nullable)
- `endDate` (DateTime, Nullable)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### Task
Stores tasks associated with projects.
- `id` (String/UUID, Primary Key)
- `projectId` (String/UUID, Foreign Key to Project)
- `name` (String)
- `description` (String, Nullable)
- `priority` (Enum `TaskPriority`): `LOW`, `MEDIUM`, `HIGH`
- `status` (Enum `TaskStatus`): `PENDING`, `IN_PROGRESS`, `COMPLETED`
- `dueDate` (DateTime, Nullable)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

## Relationships & Cascade Behavior

- **User 1:N Project**: A User can have many Projects.
  - Foreign Key: `Project.userId` references `User.id`
  - Cascade Behavior: `onDelete: Cascade` (Deleting a User deletes all their Projects).
- **Project 1:N Task**: A Project can have many Tasks.
  - Foreign Key: `Task.projectId` references `Project.id`
  - Cascade Behavior: `onDelete: Cascade` (Deleting a Project deletes all its Tasks).

## Indexes
Appropriate indexes have been defined to optimize specific lookup operations:
- `User`: `auth0Subject` and `email` are uniquely indexed.
- `Project`: `userId` (for ownership lookups), `status` (for filtering), and `name` (for searching).
- `Task`: `projectId` (for task lookups under a project), `status` (for filtering), `priority` (for filtering), and `dueDate` (for date-based queries).
