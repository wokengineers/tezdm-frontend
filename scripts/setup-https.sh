#!/bin/bash

# HTTPS Setup Script for TezDM Frontend
# This script sets up SSL certificates for local HTTPS development

echo "🔒 Setting up HTTPS for local development..."

# Check if mkcert is installed
if ! command -v mkcert &> /dev/null; then
    echo "❌ mkcert is not installed. Installing..."
    
    # Install mkcert based on OS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew install mkcert
        brew install nss
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        sudo apt-get install mkcert
    else
        echo "❌ Unsupported OS. Please install mkcert manually:"
        echo "   https://github.com/FiloSottile/mkcert#installation"
        exit 1
    fi
fi

# Install local CA
echo "📜 Installing local Certificate Authority..."
mkcert -install

# Create certificates for localhost
echo "🔐 Creating SSL certificates for localhost..."
mkcert localhost 127.0.0.1 ::1

# Move certificates to project root
echo "📁 Moving certificates to project root..."
mv localhost+2.pem localhost.pem
mv localhost+2-key.pem localhost-key.pem

# Set proper permissions
chmod 600 localhost-key.pem
chmod 644 localhost.pem

echo "✅ HTTPS setup complete!"
echo ""
echo "🚀 To start the development server with HTTPS:"
echo "   npm start"
echo ""
echo "🌐 Your app will be available at:"
echo "   https://localhost:3000"
echo ""
echo "⚠️  Note: You may see a security warning in your browser."
echo "   This is normal for self-signed certificates in development."
echo "   Click 'Advanced' and 'Proceed to localhost' to continue." 