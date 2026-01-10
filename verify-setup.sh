#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 HabitFlow Production Readiness Check"
echo "========================================"
echo ""

# Check backend structure
echo "📦 Checking Backend Structure..."
if [ -f "backend/server/package.json" ]; then
    echo -e "${GREEN}✓${NC} package.json found"
else
    echo -e "${RED}✗${NC} package.json missing"
fi

if [ -f "backend/server/index.js" ]; then
    echo -e "${GREEN}✓${NC} index.js found"
else
    echo -e "${RED}✗${NC} index.js missing"
fi

if [ -f "backend/server/.env.example" ]; then
    echo -e "${GREEN}✓${NC} .env.example found"
else
    echo -e "${RED}✗${NC} .env.example missing"
fi

echo ""

# Check frontend structure
echo "🎨 Checking Frontend Structure..."
if [ -f "frontend/package.json" ]; then
    echo -e "${GREEN}✓${NC} package.json found"
else
    echo -e "${RED}✗${NC} package.json missing"
fi

if [ -f "frontend/services/dbService.ts" ]; then
    echo -e "${GREEN}✓${NC} dbService.ts found"
else
    echo -e "${RED}✗${NC} dbService.ts missing"
fi

if [ -f "frontend/.env.example" ]; then
    echo -e "${GREEN}✓${NC} .env.example found"
else
    echo -e "${RED}✗${NC} .env.example missing"
fi

echo ""

# Check documentation
echo "📚 Checking Documentation..."
if [ -f "DEPLOYMENT.md" ]; then
    echo -e "${GREEN}✓${NC} DEPLOYMENT.md found"
else
    echo -e "${RED}✗${NC} DEPLOYMENT.md missing"
fi

if [ -f "README.md" ]; then
    echo -e "${GREEN}✓${NC} README.md found"
else
    echo -e "${RED}✗${NC} README.md missing"
fi

echo ""

# Check for environment variables
echo "🔐 Checking Environment Configuration..."
if grep -q "VITE_API_URL" frontend/vite.config.ts 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Frontend configured for API URL environment variable"
else
    echo -e "${YELLOW}⚠${NC} Frontend may need API URL configuration"
fi

if grep -q "allowedOrigins" backend/server/index.js 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Backend CORS configured"
else
    echo -e "${YELLOW}⚠${NC} Backend CORS may need configuration"
fi

echo ""
echo "========================================"
echo "📋 Next Steps:"
echo "1. Deploy backend to Render"
echo "2. Update Vercel environment variables"
echo "3. Test production deployment"
echo ""
echo "See DEPLOYMENT.md for detailed instructions"
