#!/bin/bash
# CarbonConstruct Calculator - One-Command Deployment
# Run this script to set up both backend and frontend

set -e

echo "🚀 CarbonConstruct Calculator Deployment"
echo "========================================"
echo ""

# Check for Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed"
    exit 1
fi

# Check for Node/npm
if ! command -v npm &> /dev/null; then
    echo "❌ Node.js and npm are required but not installed"
    exit 1
fi

# ===== BACKEND SETUP =====
echo "📦 Setting up backend..."
cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "✅ Created Python virtual environment"
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -q -r requirements.txt
echo "✅ Installed backend dependencies"

# Initialize database
python -m core.database
echo "✅ Initialized database with NGER data"

cd ..

# ===== FRONTEND SETUP =====
echo "📦 Setting up frontend..."
cd frontend

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "VITE_API_URL=http://localhost:8000/api/v1" > .env
    echo "✅ Created .env file"
fi

# Install dependencies (if not already installed)
if [ ! -d "node_modules" ]; then
    npm install
    echo "✅ Installed frontend dependencies"
fi

cd ..

# ===== COMPLETION =====
echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo ""
echo "1. Backend (Terminal 1):"
echo "   cd backend"
echo "   source venv/bin/activate"
echo "   uvicorn api.main:app --reload --host 0.0.0.0 --port 8000"
echo ""
echo "2. Frontend (Terminal 2):"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "📝 Backend API: http://localhost:8000/api/docs"
echo "🌐 Frontend App: http://localhost:5173"
echo ""
echo "📚 Read CALCULATOR_README.md for full documentation"
