# Environment Setup for Nexora Frontend

## Quick Fix for "process is not defined" Error

The error occurs because Vite (unlike Create React App) uses `import.meta.env` instead of `process.env`.

### Steps to Fix:

1. **Create `.env.local` file** in the `frontend` directory:
   ```bash
   cd frontend
   cp .env.example .env.local
   ```

2. **Or manually create** `frontend/.env.local` with:
   ```env
   VITE_BACKEND_URL=http://localhost:8000
   VITE_ENV=development
   ```

3. **Restart the dev server**:
   ```bash
   npm run dev
   ```

### Important Notes:

- ✅ Vite uses `import.meta.env.VITE_*` for browser-accessible variables
- ✅ Variables must be prefixed with `VITE_` to be exposed to the browser
- ✅ `.env.local` is gitignored (safe for local development)
- ✅ Changes to `.env` files require restarting the dev server

### Already Fixed:

The code has been updated to use `import.meta.env.VITE_BACKEND_URL` instead of `process.env.REACT_APP_BACKEND_URL`.

### Default Backend URL:

If no `.env.local` file exists, the app defaults to `http://localhost:8000` (your Python FastAPI backend).
