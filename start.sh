#!/bin/bash
# Startup script for Defitex Portal
# This script runs Prisma migrations before starting the server

set -e  # Exit on error

echo "🚀 Starting Defitex Portal..."

# Navigate to finance directory and run Prisma migrations
echo "📦 Running Prisma migrations..."
cd finance
if [ -f "prisma/schema.prisma" ]; then
  echo "   Generating Prisma Client..."
  npx prisma generate
  
  echo "   Deploying database migrations..."
  npx prisma migrate deploy || {
    echo "⚠️  Migration failed, but continuing..."
  }
else
  echo "⚠️  Prisma schema not found, skipping migrations..."
fi

# Return to root directory
cd ..

# Start the main server
echo "🌐 Starting Express gateway server..."
exec node server.js

