# Estim8 - Pro Trades Estimator & Quotations

A precision estimator tool for POP ceilings, tiling, and painting contractors in Ghana, featuring custom ratios, white-labeled PDF quotes, and WhatsApp sharing.

## Features

### 📐 Calculator
- Calculate material quantities and costs for POP ceilings, tiling, painting, plastering, and partitions
- Custom ratio factors for wastage or complexity adjustments
- Real-time cost estimation

### 📄 Quotes
- Generate professional PDF quotes
- Track quote status (draft, sent, accepted, rejected)
- Client information management

### 🧾 Receipts
- Create and manage payment receipts
- Multiple payment methods: Cash, Mobile Money, Bank Transfer, Cheque
- Link receipts to existing quotes
- **PDF Generation** with professional branding
- **WhatsApp Sharing** for instant delivery

### 🔐 Cloud Sync (Firebase)
- **User authentication** - Sign up / Login
- **Real-time sync** - Data syncs across all devices
- **Team sharing** - Multiple users can access same data

### ⚙️ Settings
- Customize company branding (name, tagline, phone, email, address)
- **Export/Import** data as JSON backup
- Cloud sync status indicator

## Setup Firebase (Required for Cloud Sync)

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Add project"** and give it a name (e.g., "estim8-app")
3. Disable Google Analytics (optional) and click **Create**

### Step 2: Enable Authentication

1. In your project, go to **Build → Authentication → Get started**
2. Enable **Email/Password** provider
3. Enable **Google** provider (optional, for one-click sign in)
4. Add your email to the authorized domains if needed

### Step 3: Create Firestore Database

1. Go to **Build → Firestore Database → Create database**
2. Choose **Start in test mode** (for development)
3. Select a location closest to your users

### Step 4: Get Your Config

1. Go to **Project Settings** (gear icon)
2. Scroll to **Your apps** section
3. Click **Web** (</>) icon
4. Register your app with a nickname
5. Copy the `firebaseConfig` object

### Step 5: Add Config to Your App

Create a file called `.env.local` in the project root:

```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef
```

### Step 6: Firestore Security Rules

For production, update your Firestore rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Getting Started

### Prerequisites
- Node.js 18+ installed

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

## Deployment

### Deploy to Vercel

```bash
git add . && git commit -m "Ready for deployment"
git push origin main
```

Then go to [vercel.com](https://vercel.com) → **Add New Project** → Import your repository → **Deploy**

**Note:** Add your Firebase environment variables in Vercel project settings.

## Firebase Free Tier Limits

| Feature | Free Tier |
|---------|-----------|
| Authentication | Unlimited |
| Firestore Storage | 1 GB |
| Data Transfer | 10 GB/month |
| Database Operations | 50,000 reads/day |

For most small contractors, this is **more than enough**.

## Tech Stack

- **React 19** + **TypeScript**
- **Vite 6** - Fast build tool
- **Tailwind CSS v4** - Modern CSS framework
- **Firebase** - Authentication & Cloud Database
- **JSPDF** - PDF generation
- **Lucide React** - Icon library
- **Motion** - Smooth animations

## Project Structure

```
src/
├── App.tsx           # Main app with all views
├── AuthContext.tsx   # Firebase authentication
├── LoginPage.tsx     # Login/Signup UI
├── firebase.ts       # Firebase configuration
├── firebaseData.ts   # Data operations (CRUD)
├── types.ts          # TypeScript interfaces
├── utils.ts          # Helper functions
├── storage.ts        # LocalStorage utilities
├── index.css         # Tailwind CSS styles
├── main.tsx          # React entry point
└── vite-env.d.ts     # Vite type declarations
```

## License

MIT License
