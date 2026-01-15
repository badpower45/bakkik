#!/bin/bash

# Evolution Championship Backend - Vercel Setup Script

echo "🚀 Evolution Championship Backend - Vercel Deployment"
echo "====================================================="
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
else
    echo "✅ Vercel CLI found"
fi

echo ""
echo "📝 Project Information:"
echo "  - Framework: Next.js"
echo "  - APIs: 46 endpoints"
echo "  - Database: Supabase"
echo ""

# Navigate to backend directory
cd "$(dirname "$0")"

echo "🔧 Installing dependencies..."
npm install

echo ""
echo "🏗️  Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Run: vercel login"
    echo "2. Run: vercel"
    echo "3. Add environment variables in Vercel Dashboard:"
    echo "   - NEXT_PUBLIC_SUPABASE_URL"
    echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "   - SUPABASE_SERVICE_ROLE_KEY"
    echo "   - JWT_SECRET"
    echo "   - PAYMOB_API_KEY (optional)"
    echo "   - PAYMOB_INTEGRATION_ID (optional)"
    echo "   - PAYMOB_IFRAME_ID (optional)"
    echo "   - PAYMOB_HMAC_SECRET (optional)"
    echo "   - STREAMING_SECRET_KEY (optional)"
    echo "4. Run: vercel --prod"
    echo ""
    echo "📖 For detailed instructions, see QUICK_DEPLOY.md"
    echo ""
else
    echo ""
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi
