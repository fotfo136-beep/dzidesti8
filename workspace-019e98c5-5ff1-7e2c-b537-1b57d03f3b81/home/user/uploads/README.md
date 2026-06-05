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
- **Data persists in browser** - survives page refresh

### ⚙️ Settings
- Customize company branding (name, tagline, phone, email, address)
- **Export/Import** data as JSON backup
- **Delete all data** option

## Data Storage

All data is stored locally in your browser using **LocalStorage**:
- ✅ Data persists across page refreshes
- ✅ Export/Import backup functionality
- ✅ No server required
- ⚠️ Data is cleared if browser cache is cleared

### Backing Up Data
1. Go to **Settings** → **Data Management**
2. Click **Export Backup** to download a JSON file
3. Save this file in a safe place

### Restoring Data
1. Go to **Settings** → **Data Management**
2. Click **Import Backup**
3. Select your previously exported JSON file

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

Deploy to Vercel with one click:

```bash
# Push to GitHub, then import at vercel.com
git add . && git commit -m "Ready for deployment"
git push origin main
```

## Tech Stack

- **React 19** + **TypeScript**
- **Vite 6** - Fast build tool
- **Tailwind CSS v4** - Modern CSS framework
- **JSPDF** - PDF generation
- **Lucide React** - Icon library
- **Motion** - Smooth animations

## Project Structure

```
src/
├── App.tsx         # Main app with all views
├── types.ts        # TypeScript interfaces
├── utils.ts        # Helper functions (currency, WhatsApp, PDF)
├── storage.ts      # LocalStorage utilities
├── index.css       # Tailwind CSS styles
├── main.tsx        # React entry point
└── vite-env.d.ts   # Vite type declarations
```

## License

MIT License