#!/bin/bash

# TezDM Frontend - Production Deployment Script
# This script helps deploy the application to Vercel

set -e  # Exit on any error

echo "🚀 Starting TezDM Frontend Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_error "Vercel CLI is not installed. Please install it first:"
    echo "npm install -g vercel"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

print_status "Running pre-deployment checks..."

# Install dependencies
print_status "Installing dependencies..."
npm ci

# Run type checking
print_status "Running TypeScript type checking..."
npm run type-check

# Run linting
print_status "Running linting..."
npm run lint

# Run tests
print_status "Running tests..."
npm run test:ci

# Build the project
print_status "Building for production..."
npm run build

print_success "Build completed successfully!"

# Check if build was successful
if [ ! -d "build" ]; then
    print_error "Build directory not found. Build may have failed."
    exit 1
fi

print_status "Build directory created successfully."

# Deploy to Vercel
print_status "Deploying to Vercel..."
echo ""

# Check if user wants to deploy to production
read -p "Deploy to production? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Deploying to production..."
    vercel --prod
else
    print_status "Deploying to preview..."
    vercel
fi

print_success "Deployment completed!"
echo ""
print_status "Next steps:"
echo "1. Check your Vercel dashboard for deployment status"
echo "2. Verify the application is working correctly"
echo "3. Test authentication and OAuth flows"
echo "4. Monitor error logs if needed"
echo ""
print_success "🎉 TezDM Frontend is now live!" 