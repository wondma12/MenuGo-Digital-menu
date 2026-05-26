# MenuGo Backend API

## Overview
MenuGo is a comprehensive Digital Menu SaaS platform backend API built with Node.js, Express, PostgreSQL, and Redis. It provides complete restaurant management, digital menu, order management, waiter dashboard, and analytics capabilities.

## Features

### Core Features
- 🔐 **Authentication & Authorization** - JWT-based auth with role-based access control
- 🍽️ **Restaurant Management** - Complete restaurant profile management
- 📋 **Digital Menu Management** - Categories, items, options, and modifiers
- 📱 **QR Code Generation** - Dynamic QR codes for tables and menus
- 🛒 **Order Management** - Real-time order processing and tracking
- 👥 **Waiter Dashboard** - Real-time order verification and table management
- 📊 **Analytics & Reporting** - Sales reports, performance metrics, and insights
- 💳 **Payment Integration** - Stripe payment processing
- 📧 **Email Notifications** - Order confirmations, reports, and alerts
- 🔔 **Real-time Updates** - WebSocket for live order status

### Tech Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.x
- **Database**: PostgreSQL 14+
- **ORM**: Sequelize 6.x
- **Cache**: Redis 7+
- **Real-time**: Socket.io
- **Authentication**: JWT
- **File Upload**: Multer + Cloudinary
- **Email**: Nodemailer
- **Payment**: Stripe
- **Queue**: Bull (Redis)

## Prerequisites

- Node.js 18 or higher
- PostgreSQL 14 or higher
- Redis 7 or higher
- npm or yarn package manager

## Installation

### 1. Clone the repository
```bash
git clone https://github.com/menugo/backend.git
cd menugo-backend