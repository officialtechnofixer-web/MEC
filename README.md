# MEC UAFMS (Unified Application & Facility Management System)

A comprehensive, full-stack digital platform designed to streamline and automate student-to-university application workflows. Built for high performance, security, and scalability.

## 🚀 Features

- **Unified Application Form**: One smart form to apply to multiple partner universities.
- **Digital Vault**: AES-256 encrypted locker for secure document storage and sharing.
- **Real-time Status Tracking**: Live updates on application progress, visa status, and interview schedules.
- **Multilingual Support**: High-performance dashboard logic optimized for global students.
- **Admin & Partner Portals**: Role-specific control towers for staff and university partners.
- **2FA Security**: Mandatory two-factor authentication for sensitive administrative roles.

## 🏗️ Architecture

The project is structured as a monorepo:

- `/backend`: Node.js & Express server with MongoDB (Mongoose).
- `/uafms`: Next.js frontend with Tailwind CSS and Framer Motion for premium UI.
- `/package.json`: Root orchestration to run both systems concurrently.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, Framer Motion, Heroicons.
- **Backend**: Node.js, Express, MongoDB, Socket.io, Multer, JWT.
- **Security**: BCrypt hashing, JWT Authorization, CORS protection, 2FA.

## 🚦 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or on Atlas)

### 2. Installation

Clone and install dependencies for all packages:
```bash
npm install
cd backend && npm install
cd ../uafms && npm install
cd ..
```

### 3. Environment Variables

Create `.env` files based on the provided examples:
- `backend/.env` (use `backend/.env.example` as a template)
- `uafms/.env.local` (use `uafms/.env.local.example` as a template)

### 4. Running the Application

Start both the Backend and Frontend in development mode using a single command from the root:
```bash
npm run dev
```

## 🏗️ Deployment

To build the project for production:
```bash
npm run build:all
```

To start the production bundle:
```bash
npm run start:prod
```

## 📄 License
© 2024 MEC. All rights reserved.
