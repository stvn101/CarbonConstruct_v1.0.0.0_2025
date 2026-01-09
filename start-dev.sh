#!/bin/bash

# CarbonConstruct Development Server Quick Start
# This script automates the setup and launch of the development server

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║      CarbonConstruct Development Server Setup       ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo -e "${YELLOW}Please install Node.js (v18 or higher) from https://nodejs.org/${NC}"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version must be 18 or higher${NC}"
    echo -e "${YELLOW}Current version: $(node -v)${NC}"
    echo -e "${YELLOW}Please upgrade Node.js from https://nodejs.org/${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node -v) detected${NC}"
echo -e "${GREEN}✓ npm $(npm -v) detected${NC}"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Dependencies not found. Installing...${NC}"
    echo -e "${BLUE}This may take a few minutes on first run.${NC}"
    echo ""
    
    npm install --legacy-peer-deps
    
    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✓ Dependencies installed successfully${NC}"
        echo ""
    else
        echo -e "${RED}❌ Failed to install dependencies${NC}"
        echo -e "${YELLOW}Try running manually: npm install --legacy-peer-deps${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ Dependencies already installed${NC}"
    echo ""
fi

# Start the development server
echo -e "${BLUE}🚀 Starting development server...${NC}"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Development server will be available at:${NC}"
echo -e "${GREEN}  ${NC}"
echo -e "${GREEN}  🌐 http://localhost:8080${NC}"
echo -e "${GREEN}  ${NC}"
echo -e "${GREEN}  Press Ctrl+C to stop the server${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

npm run dev
