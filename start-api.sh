#!/bin/bash
# Start backend API server script

set -e

echo "🚀 Starting GIVRwrld backend API..."
echo ""

cd "$(dirname "$0")/backend"

if [ ! -f .env ]; then
  echo "❌ Error: backend/.env file not found"
  echo "   Copy backend/.env.example to backend/.env and fill values"
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "📦 Installing backend dependencies..."
  npm install
fi

echo "✅ Starting backend on http://localhost:3001"
echo "   Press Ctrl+C to stop"
echo ""

npm start
