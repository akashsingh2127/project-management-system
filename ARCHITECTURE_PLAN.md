# Full Stack Project Management System - Architectural Plan (Auth0 + Redis Edition)

This document outlines the complete architectural and implementation plan for a production-ready Project Management System (Web + Mobile), incorporating Auth0 for robust identity management and Redis for caching.

## 1. Project Overview
- **Core Features:** User Auth (via Auth0), Project CRUD, Task CRUD, Dashboard Statistics, Search & Filtering.
- **Rules:** One backend for both Web and Mobile. Data isolation. Must handle "no network" gracefully.

---

## 2. Global Architecture & Tooling
- **Repository Structure:** Single Monorepo (`npm workspaces`).
- **Language:** TypeScript.
- **Shared Validation:** **Zod** (Schemas will be created in a `packages/common` folder and shared across the Express backend and React frontends).
- **Secrets Management:** Standard `.env` files for local dev. PaaS environment variables for production.

---

## 3. Infrastructure & Performance
- **Hosting Strategy:** Managed PaaS (e.g., Render, Railway).
- **Database:** PostgreSQL (Neon or Supabase).
- **Caching Layer (Redis):** We will use Redis to cache heavy API responses (like the Dashboard statistics) and to cache frequent database queries. This will drastically improve the speed and scalability of the app.
- **Graceful Shutdowns:** The Node.js server will listen for `SIGTERM`/`SIGINT`, stop accepting new requests, and cleanly close both the Prisma and Redis connections.
- **Search:** PostgreSQL native `ILIKE` or Full-Text Search.

---

## 4. Backend (Node.js API)
- **Framework:** Node.js with Express.js.
- **ORM:** Prisma (Fast schema modeling, built-in SQL injection prevention).
- **Rate Limiting:** Redis-backed rate limiting via `express-rate-limit` + `rate-limit-redis`.
- **Security Enhancements:**
  - Express Helmet for HTTP security headers.
  - Strict payload size limits (e.g., max 100kb JSON) to prevent DDoS.
- **Authentication & Authorization (Auth0):** 
  - Identity management is delegated to **Auth0**.
  - Auth0 handles the login flow and issues highly secure JWTs.
  - The Express backend uses `express-oauth2-jwt-bearer` to validate the Auth0 JWTs.
  - Refresh Tokens are managed by Auth0's SDKs on the web and mobile clients (stored in memory/HttpOnly cookies for web, and SecureStore for mobile).

---

## 5. Web Frontend (React)
- **Framework:** React (Vite).
- **Styling & UI Components:** Tailwind CSS + shadcn/ui.
- **State Management:** React Query (TanStack Query) + Axios.
- **Authentication SDK:** `@auth0/auth0-react` handles the PKCE login flow securely.
- **User Experience (UX):** 
  - **Optimistic UI Updates:** UI reacts instantly to user actions, rolling back seamlessly only if the API fails.
- **Offline / No-Network Handling:** Global network listeners & Error Boundaries. Displays a persistent "You are offline" banner.

---

## 6. Mobile App (React Native)
- **Framework:** React Native with **Expo**.
- **Styling:** NativeWind (Tailwind CSS for React Native).
- **Authentication SDK:** `react-native-auth0` handles the native biometric/browser login flows securely.
- **Offline Capabilities:** **React Query Persist with MMKV** storage. Provides full offline read-support. Uses a graceful "No Network" banner instead of crashing.
- **Secure Token Storage:** Expo SecureStore (utilized by the Auth0 SDK).
- **Push Notifications:** Expo Push Notifications triggered by the backend.
- **Distribution & Builds:** Expo Application Services (EAS) for cloud building (APK binaries).

---

## Conclusion
This architecture hits a perfect sweet spot. By bringing back **Redis**, we gain enterprise-grade caching and rate limiting. By integrating **Auth0**, we achieve bulletproof authentication, saving us from managing passwords and refresh token rotation logic manually, while still easily completing the project within a 1-week deadline.
