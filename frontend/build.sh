#!/bin/bash
set -e

# Ensure schema.prisma exists in root
if [ ! -f "schema.prisma" ] && [ -f "prisma/schema.prisma" ]; then
  echo "Copying prisma/schema.prisma to root..."
  cp prisma/schema.prisma ./schema.prisma
fi

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Build Next.js
echo "Building Next.js..."
npx next build
