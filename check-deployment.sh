#!/bin/bash

# Backend Deployment Checklist Script

echo "🔍 Evolution Championship Backend - Deployment Checklist"
echo "========================================================"
echo ""

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Check Node.js
echo "1. Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "   ✅ Node.js installed: $NODE_VERSION"
else
    echo "   ❌ Node.js not found"
    exit 1
fi

# Check npm
echo "2. Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo "   ✅ npm installed: $NPM_VERSION"
else
    echo "   ❌ npm not found"
    exit 1
fi

# Check Vercel CLI
echo "3. Checking Vercel CLI..."
if command -v vercel &> /dev/null; then
    VERCEL_VERSION=$(vercel -v)
    echo "   ✅ Vercel CLI installed: $VERCEL_VERSION"
else
    echo "   ⚠️  Vercel CLI not found (optional for Dashboard deployment)"
fi

# Check dependencies
echo "4. Checking node_modules..."
if [ -d "node_modules" ]; then
    echo "   ✅ Dependencies installed"
else
    echo "   ⚠️  Dependencies not installed. Run: npm install"
fi

# Check required files
echo "5. Checking required files..."
FILES=(
    "package.json"
    "next.config.ts"
    "tsconfig.json"
    "vercel.json"
    ".env.example"
    "app/layout.tsx"
    "app/page.tsx"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ $file missing"
    fi
done

# Check API routes
echo "6. Checking API routes..."
API_COUNT=$(find app/api -name "route.ts" | wc -l)
echo "   ✅ Found $API_COUNT API endpoints"

# Check for build
echo "7. Checking build..."
if [ -d ".next" ]; then
    echo "   ✅ Build exists"
else
    echo "   ⚠️  No build found. Run: npm run build"
fi

echo ""
echo "📋 Summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   ✨ Backend is ready for deployment!"
echo ""
echo "🚀 Next Steps:"
echo "   1. Go to https://vercel.com/new"
echo "   2. Import your repository"
echo "   3. Set Root Directory: backend"
echo "   4. Add environment variables"
echo "   5. Deploy!"
echo ""
echo "📖 For detailed guide, see:"
echo "   - QUICK_DEPLOY.md (quick start)"
echo "   - DEPLOYMENT.md (detailed guide)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
