#!/bin/bash

# Railway Database Setup Script for macOS/Linux
# This script sets up your Railway database with all MenuGo tables
# Usage: ./setupRailway.sh or bash setupRailway.sh

echo ""
echo "========================================"
echo "MenuGo Railway Database Setup"
echo "========================================"
echo ""
echo "Your Railway credentials:"
echo "  Host: hayabusa.proxy.rlwy.net"
echo "  Port: 45537"
echo "  User: root"
echo "  Database: menugo_db"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "Node.js version:"
node --version
echo ""

# Check if database.sql exists
if [ ! -f "database.sql" ]; then
    echo "Error: database.sql not found!"
    echo "Please run this script from the menugo-backends directory"
    exit 1
fi

echo "Checking dependencies..."
if ! npm list mysql2 > /dev/null 2>&1; then
    echo "Installing mysql2..."
    npm install mysql2
fi

echo ""
echo "Running database setup script..."
echo ""

node scripts/setupRailwayDatabase.js

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================"
    echo "Success! Your Railway database is ready!"
    echo "========================================"
    echo ""
    echo "You can now connect to your database:"
    echo "  Host: hayabusa.proxy.rlwy.net:45537"
    echo "  User: root"
    echo "  Database: menugo_db"
    echo ""
else
    echo ""
    echo "Setup failed! Check the errors above."
    echo ""
    exit 1
fi
