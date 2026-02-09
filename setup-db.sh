#!/bin/bash

# SLZA.sk - Database Setup Script
# This script will help you set up the PostgreSQL database

echo "🔧 SLZA.sk Database Setup"
echo "=========================="
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed!"
    echo "Install it with: brew install postgresql@16"
    exit 1
fi

echo "✅ PostgreSQL is installed"

# Check if PostgreSQL is running
if ! brew services list | grep postgresql@16 | grep started &> /dev/null; then
    echo "⚠️  PostgreSQL is not running. Starting..."
    brew services start postgresql@16
    sleep 3
fi

echo "✅ PostgreSQL is running"

# Check if database exists
DB_EXISTS=$(psql -lqt | cut -d \| -f 1 | grep -w slza | wc -l)

if [ $DB_EXISTS -eq 0 ]; then
    echo "📦 Creating database 'slza'..."
    createdb slza
    echo "✅ Database created"
else
    echo "✅ Database 'slza' already exists"
fi

# Update .env file
echo ""
echo "📝 Updating .env file..."
cd frontend

# Get current user
CURRENT_USER=$(whoami)

# Create or update DATABASE_URL in .env
if [ -f .env ]; then
    # Check if DATABASE_URL exists
    if grep -q "^DATABASE_URL=" .env; then
        # Update existing
        sed -i.bak "s|^DATABASE_URL=.*|DATABASE_URL=\"postgresql://$CURRENT_USER@localhost:5432/slza\"|" .env
        echo "✅ Updated DATABASE_URL in .env"
    else
        # Add new
        echo "DATABASE_URL=\"postgresql://$CURRENT_USER@localhost:5432/slza\"" >> .env
        echo "✅ Added DATABASE_URL to .env"
    fi
else
    echo "❌ .env file not found! Please create it from .env.example"
    exit 1
fi

# Run Prisma migrations
echo ""
echo "🔄 Running Prisma migrations..."
npx prisma migrate dev --name init

# Generate Prisma client
echo ""
echo "🔄 Generating Prisma client..."
npx prisma generate

# Create admin user (optional)
echo ""
echo "👤 Would you like to create an admin user? (y/n)"
read -r CREATE_ADMIN

if [ "$CREATE_ADMIN" = "y" ]; then
    echo "Enter admin email:"
    read -r ADMIN_EMAIL
    echo "Enter admin password:"
    read -rs ADMIN_PASSWORD
    
    # Create admin user using Node script
    node -e "
    const { PrismaClient } = require('@prisma/client');
    const bcrypt = require('bcryptjs');
    
    const prisma = new PrismaClient();
    
    async function createAdmin() {
      try {
        const passwordHash = await bcrypt.hash('$ADMIN_PASSWORD', 10);
        
        const user = await prisma.user.create({
          data: {
            email: '$ADMIN_EMAIL',
            passwordHash: passwordHash,
            firstName: 'Admin',
            lastName: 'User',
            role: 'ADMIN'
          }
        });
        
        console.log('✅ Admin user created:', user.email);
      } catch (error) {
        console.error('❌ Error creating admin:', error.message);
      } finally {
        await prisma.\$disconnect();
      }
    }
    
    createAdmin();
    "
fi

echo ""
echo "🎉 Database setup complete!"
echo ""
echo "You can now start the development server:"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "To view your database:"
echo "  npx prisma studio"
