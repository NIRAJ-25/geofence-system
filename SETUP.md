# Setup Guide — GeoFence System

This guide outlines step-by-step instructions to set up, configure, and execute the **GeoFence** project locally and in production.

---

## 1. System Requirements

- **Operating System**: macOS, Linux, or Windows (WSL recommended)
- **Runtime**: Node.js v18.17.0 or higher (Node.js v22 LTS recommended)
- **Package Manager**: npm 10+
- **Modern Browser**: Google Chrome, Mozilla Firefox, Apple Safari, or Microsoft Edge with location permissions enabled.

---

## 2. Environment Setup

1. Open your terminal and enter the project directory:
   ```bash
   cd /Users/nirajkumarsingh/.gemini/antigravity-ide/scratch/geofence-system
   ```

2. Verify that Node.js and npm are accessible:
   ```bash
   node -v
   npm -v
   ```

3. Ensure `.env.local` is present:
   ```bash
   cp .env.example .env.local
   ```

---

## 3. Google Cloud Console & Maps API Configuration

To enable live Google Maps integration (Phase 4):

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project named `geofence-project`.
3. Navigate to **APIs & Services > Library**.
4. Search for **Maps JavaScript API** and click **Enable**.
5. Navigate to **APIs & Services > Credentials** and click **Create Credentials > API Key**.
6. Set **Application Restrictions** to:
   - Development: `HTTP referrers` -> `http://localhost:3000/*`
   - Production: `https://your-domain.vercel.app/*`
7. Copy the API key and paste it into `.env.local`:
   ```env
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_key_here
   ```

---

## 4. Running the Development Server

Execute:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

When prompted by the browser:
1. Click **Allow** on the location prompt.
2. (Optional) Click **Allow** on the notifications prompt in Settings.

---

## 5. Production Build & Verification

To verify that the application compiles without errors:

```bash
npm run build
```

The output will confirm that all pages and routes are statically optimized and type-checked with Turbopack.
