# Full Free-Tier Deployment Guide

Since you're a student, we will use modern, generous free-tier services that don't require credit cards to get started. Here is the architecture we'll use:

1. **Database (PostgreSQL):** [Neon](https://neon.tech)
2. **Redis Cache:** [Upstash](https://upstash.com)
3. **Backend (Node.js API):** [Render](https://render.com)
4. **Frontend (Web):** [Vercel](https://vercel.com)
5. **Mobile (Android):** [Expo EAS Build](https://expo.dev/eas)

Follow these steps in order.

---

## Step 1: Deploy Databases (Neon & Upstash)

### 1A. PostgreSQL on Neon
1. Go to [Neon.tech](https://neon.tech) and sign up with GitHub.
2. Create a new project (e.g., `project-management-db`).
3. Once created, you will be given a connection string that looks like this:
   `postgresql://[user]:[password]@[host]/[dbname]?sslmode=require`
4. **Save this URL**; this will be your `DATABASE_URL`.

### 1B. Redis on Upstash
1. Go to [Upstash.com](https://upstash.com) and sign up.
2. Click **Create Database** under Redis. Give it a name and choose the region closest to you.
3. Scroll down in the dashboard to find the **Node.js (ioredis/redis)** connection string.
4. **Save this URL**; this will be your `REDIS_URL`. (Make sure to include `rediss://` if using TLS).

---

## Step 2: Deploy Backend API on Render

1. Go to [Render.com](https://render.com) and sign up with GitHub.
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository.
4. Fill in the following details:
   - **Name:** `pms-api` (or whatever you prefer)
   - **Region:** Choose one close to your Neon database.
   - **Branch:** `main`
   - **Root Directory:** *(leave blank)*
   - **Environment:** `Node`
   - **Build Command:**
     ```bash
     npm install && cd apps/api && npx prisma generate && npx prisma migrate deploy && npm run build
     ```
   - **Start Command:**
     ```bash
     cd apps/api && npm start
     ```
5. Choose the **Free** instance type.
6. Click **Advanced** to add Environment Variables:
   - `DATABASE_URL`: (Paste your Neon URL)
   - `REDIS_URL`: (Paste your Upstash URL)
   - `AUTH0_AUDIENCE`: `https://project-management-api` (from your current .env)
   - `AUTH0_ISSUER_BASE_URL`: (Your Auth0 issuer URL from your .env)
   - `PORT`: `10000`
7. Click **Create Web Service**. Wait 5-10 minutes for it to build and deploy.
8. Once live, copy your backend URL (e.g., `https://pms-api.onrender.com`).

---

## Step 3: Deploy Frontend Web on Vercel

1. Go to [Vercel.com](https://vercel.com) and sign up with GitHub.
2. Click **Add New -> Project**.
3. Import your GitHub repository.
4. Important: Set the **Framework Preset** to `Vite` and the **Root Directory** to `apps/web`.
5. Add the following **Environment Variables**:
   - `VITE_API_URL`: Your Render URL from Step 2 followed by `/api` (e.g., `https://pms-api.onrender.com/api`)
   - `VITE_AUTH0_DOMAIN`: (Your Auth0 Domain)
   - `VITE_AUTH0_CLIENT_ID`: (Your Auth0 Client ID)
   - `VITE_AUTH0_AUDIENCE`: `https://project-management-api`
6. Click **Deploy**.
7. Once finished, Vercel will give you a public URL (e.g., `https://pms-web.vercel.app`).

---

## Step 4: Update Auth0 Configuration

Since your URLs have changed from `localhost`, Auth0 needs to know about them.
1. Go to your [Auth0 Dashboard](https://manage.auth0.com).
2. Go to **Applications** -> select your frontend application.
3. Update the following fields with your new Vercel URL:
   - **Allowed Callback URLs:** `https://pms-web.vercel.app`
   - **Allowed Logout URLs:** `https://pms-web.vercel.app`
   - **Allowed Web Origins:** `https://pms-web.vercel.app`
4. Click **Save Changes**.

---

## Step 5: Build Android APK for Free

To get an `.apk` that you can install on any Android device:
1. Ensure you have an Expo account at [expo.dev](https://expo.dev) and log in locally by running:
   ```bash
   npx expo login
   ```
2. Navigate to your mobile app directory:
   ```bash
   cd apps/mobile
   ```
3. Update your `.env` file in `apps/mobile` so it uses your production API URL:
   ```env
   EXPO_PUBLIC_API_URL=https://pms-api.onrender.com/api
   EXPO_PUBLIC_AUTH0_DOMAIN=...
   EXPO_PUBLIC_AUTH0_CLIENT_ID=...
   EXPO_PUBLIC_AUTH0_AUDIENCE=...
   ```
4. Install EAS CLI globally if you haven't:
   ```bash
   npm install -g eas-cli
   ```
5. Run the build command for a free Android APK:
   ```bash
   eas build -p android --profile preview
   ```
6. Follow the terminal prompts. It will build in the cloud for free (takes 10-15 minutes). When it finishes, it will give you a link to download the `.apk` file!
