# Integration Guide: Adding Calculator to Your Existing Vite App

## 🎯 Overview

This guide shows how to integrate the CarbonConstruct calculator into your **existing Vite + React + TypeScript + shadcn/ui** application at `carbonconstruct.com.au`.

---

## 📁 File Structure Integration

### **Step 1: Add Backend as Separate Service**

Your existing Vite app doesn't need to change structure. Run the backend as a separate FastAPI service:

```
your-existing-app/
├── src/              # Your existing React app (unchanged)
├── public/
├── package.json
└── vite.config.ts

calculator-backend/   # NEW: Separate backend service
├── api/
├── core/
├── data/
└── requirements.txt
```

### **Step 2: Add TypeScript API Client**

Copy to your existing app:

```bash
# From the calculator package
cp frontend/src/lib/api/calculator.ts YOUR_APP/src/lib/api/
```

### **Step 3: Add Calculator Components**

```bash
# Copy components to your existing app
cp -r frontend/src/components/calculator YOUR_APP/src/components/
```

---

## 🔧 Configuration

### **1. Add Environment Variable**

In your existing app's `.env` file:

```bash
# .env
VITE_API_URL=http://localhost:8000/api/v1

# Production
VITE_API_URL=https://api.carbonconstruct.com.au/v1
```

### **2. Update your `vite.config.ts`** (if needed for CORS in development)

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
})
```

---

## 🎨 Adding Calculator Pages

### **Option A: New Calculator Route**

```typescript
// src/App.tsx or your router file
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CalculatorPage } from '@/pages/calculator';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Your existing routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        
        {/* NEW: Calculator route */}
        <Route path="/calculator" element={<CalculatorPage />} />
        <Route path="/calculator/:projectId" element={<CalculatorPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### **Option B: Embed in Existing Page**

```typescript
// src/pages/project/[id].tsx
import { FuelCalculator } from '@/components/calculator/FuelCalculator';
import { MaterialCalculator } from '@/components/calculator/MaterialCalculator';

export function ProjectPage() {
  const { projectId } = useParams();

  return (
    <div className="container">
      <h1>Project Carbon Analysis</h1>
      
      {/* Your existing project content */}
      <ProjectHeader projectId={projectId} />
      
      {/* NEW: Embedded calculators */}
      <Tabs defaultValue="fuel">
        <TabsList>
          <TabsTrigger value="fuel">Fuel Emissions</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
        </TabsList>
        
        <TabsContent value="fuel">
          <FuelCalculator projectId={projectId} />
        </TabsContent>
        
        <TabsContent value="materials">
          <MaterialCalculator projectId={projectId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

## 🚀 Deployment

### **Development**

**Terminal 1 - Backend:**
```bash
cd calculator-backend
source venv/bin/activate
uvicorn api.main:app --reload --port 8000
```

**Terminal 2 - Frontend (your existing Vite app):**
```bash
cd your-existing-app
npm run dev
```

### **Production**

#### **Backend (FastAPI)**

**Option 1: Same server (e.g., AWS EC2, DigitalOcean)**
```bash
# Run with Gunicorn
gunicorn api.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

**Option 2: Separate service (e.g., Railway, Render)**
```yaml
# Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### **Frontend (Vite build)**

Your existing build process remains unchanged:
```bash
npm run build
# Outputs to dist/
```

---

## 🔐 Production Environment Variables

```bash
# Backend (.env or system env)
DATABASE_URL=postgresql://user:pass@host/db  # Optional: migrate to Postgres
CORS_ORIGINS=https://carbonconstruct.com.au,https://www.carbonconstruct.com.au

# Frontend (.env.production)
VITE_API_URL=https://api.carbonconstruct.com.au/v1
```

---

## 🏗️ Recommended Architecture for Production

```
┌─────────────────────────────────────┐
│  carbonconstruct.com.au             │
│  (Vite React App)                   │
│  - Vercel / Netlify / CloudFlare    │
└────────────┬────────────────────────┘
             │ HTTPS
             ↓
┌────────────────────────────────────┐
│  api.carbonconstruct.com.au        │
│  (FastAPI Backend)                 │
│  - Railway / Render / AWS          │
│  - SQLite or PostgreSQL            │
└────────────────────────────────────┘
```

### **Hosting Recommendations**

| Component | Service | Cost |
|-----------|---------|------|
| Frontend | Vercel | Free |
| Backend | Railway | $5/mo |
| Database | Included (SQLite) or Supabase | Free |
| Domain | Existing | - |

**Total:** ~$5/month

---

## 📊 Example: Full Calculator Page

```typescript
// src/pages/calculator/index.tsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FuelCalculator } from '@/components/calculator/FuelCalculator';
import { MaterialCalculator } from '@/components/calculator/MaterialCalculator';
import { calculatorAPI } from '@/lib/api/calculator';

export function CalculatorPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    if (projectId) {
      calculatorAPI.getProjectSummary(projectId).then(setSummary);
    }
  }, [projectId]);

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Carbon Calculator</h1>
        <p className="text-muted-foreground mt-2">
          NGER Act 2007 & NCC 2025 compliant emissions calculation
        </p>
      </div>

      {/* Summary Card */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle>Project Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Emissions</p>
                <p className="text-3xl font-bold">
                  {summary.total_co2e_tonnes.toFixed(2)} t CO₂e
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fuel</p>
                <p className="text-2xl font-semibold">
                  {(summary.breakdown.fuel?.co2e_kg / 1000 || 0).toFixed(2)} t
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Materials</p>
                <p className="text-2xl font-semibold">
                  {(summary.breakdown.material?.co2e_kg / 1000 || 0).toFixed(2)} t
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calculator Tabs */}
      <Tabs defaultValue="fuel" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="fuel">Fuel Emissions</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="fuel">
          <FuelCalculator projectId={projectId || 'default'} />
        </TabsContent>

        <TabsContent value="materials">
          <MaterialCalculator projectId={projectId || 'default'} />
        </TabsContent>

        <TabsContent value="summary">
          {/* Summary charts and reports - Phase 3 */}
          <Card>
            <CardHeader>
              <CardTitle>Coming Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Dashboard visualizations and reports</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

## ✅ Integration Checklist

- [ ] Copy `calculator.ts` to `src/lib/api/`
- [ ] Copy calculator components to `src/components/calculator/`
- [ ] Add `VITE_API_URL` to `.env`
- [ ] Add calculator route to your router
- [ ] Start backend service on port 8000
- [ ] Test fuel calculation with diesel disambiguation
- [ ] Test material calculation with timber (biogenic storage)
- [ ] Deploy backend to production server
- [ ] Update production `VITE_API_URL`
- [ ] Deploy frontend with existing pipeline

---

## 🐛 Common Issues

### **CORS Error**

Update `backend/api/main.py`:
```python
allow_origins=[
    "http://localhost:5173",
    "http://localhost:3000",
    "https://carbonconstruct.com.au",
    "https://www.carbonconstruct.com.au",
]
```

### **API Not Found (404)**

Check:
1. Backend is running: `curl http://localhost:8000/api/health`
2. `VITE_API_URL` is correct in `.env`
3. No trailing slashes in API URL

### **Type Errors**

Ensure shadcn/ui components are installed:
```bash
npx shadcn-ui@latest add card button input select alert badge label tabs
```

---

## 📞 Next Steps

1. **Test locally**: Run backend + frontend, verify calculators work
2. **Deploy backend**: Railway/Render with environment variables
3. **Update frontend**: Point to production API
4. **Phase 3**: Build dashboard with Recharts for visualizations

**You're ready to integrate!** 🚀
