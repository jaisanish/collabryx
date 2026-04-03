#!/bin/bash
# Collabryx Deployment Script for Ubuntu 22.04 (AWS EC2)

# Exit on error
set -e

# Configuration
PROJECT_DIR="/home/ubuntu/collabryx"
NGINX_CONF_PATH="/etc/nginx/sites-available/default"

echo "🚀 Starting Collabryx deployment..."

# 1. Update system and install initial tools
echo "📦 Installing system dependencies..."
sudo apt-get update
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    build-essential \
    git \
    nginx

# 2. Install Docker Engine (Required for code execution)
if ! command -v docker &> /dev/null
then
    echo "🐋 Installing Docker Engine via Official Script..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    
    echo "⚙️ Configuring Docker permissions..."
    sudo usermod -aG docker ubuntu
    # Fix permissions for the current session so PM2 can access it immediately
    sudo chmod 666 /var/run/docker.sock
    rm get-docker.sh
fi

# Verify Docker installation
if command -v docker &> /dev/null
then
    echo "✅ Docker is installed and ready: $(docker --version)"
else
    echo "❌ ERROR: Docker installation failed. Please check the logs."
    exit 1
fi

echo "📥 Pre-pulling language images (this might take a few minutes)..."
sudo docker pull node:18-alpine
sudo docker pull python:3-alpine
sudo docker pull eclipse-temurin:17-jdk-alpine
sudo docker pull frolvlad/alpine-gxx
sudo docker pull busybox

# 3. Install Node.js (v20 LTS recommended)
if ! command -v node &> /dev/null
then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# 3. Install PM2 globally
if ! command -v pm2 &> /dev/null
then
    echo "Installing PM2..."
    sudo npm install -g pm2
fi

# 4. Clone repository (assuming user has already cloned to $PROJECT_DIR)
# If not, use: git clone <repo_url> $PROJECT_DIR
cd $PROJECT_DIR

# 5. Install Backend dependencies and Build
echo "📦 Setting up Backend..."
cd backend
npm install
npm run build 

# 6. Install Frontend dependencies and Build
echo "📦 Setting up Frontend..."
cd ../frontend
npm install
npm run build

# 7. Configure Nginx
echo "⚙️ Configuring Nginx reverse proxy..."
sudo cp ../deploy/nginx.conf $NGINX_CONF_PATH
sudo nginx -t
sudo service nginx restart

# 8. Start Backend with PM2
echo "🔥 Launching backend with PM2..."
cd ..
pm2 start deploy/ecosystem.config.js --env production
pm2 save
sudo pm2 startup systemd -u ubuntu --hp /home/ubuntu

echo "✅ Collabryx deployment complete!"
echo "📍 Port 80 (HTTP) is now proxied to Node.js on port 3000."
echo "⚠️ IMPORTANT: Ensure your backend/.env contains MONGO_URI and JWT_SECRET!"
echo "✨ Visit your EC2 Public IP to start collaborating."
