#!/bin/bash

# Evolution Championship Backend Deployment Script

echo "🚀 Starting deployment to Vercel..."

cd /Users/abdelrahmanelezaby/work/app/flutter_application_1/backend

# Deploy to Vercel
vercel --yes --prod

echo "✅ Deployment completed!"
echo ""
echo "📝 Next steps:"
echo "1. Add environment variables in Vercel Dashboard"
echo "2. Get your production URL"
echo "3. Update Flutter app with production URL"
