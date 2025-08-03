#!/bin/bash

echo "📊 Analyzing Bundle Size..."
echo "=========================="

# Build for production
npm run build

# Analyze with vite-bundle-analyzer
npx vite-bundle-analyzer

echo ""
echo "Bundle analysis complete! Check the generated report."
