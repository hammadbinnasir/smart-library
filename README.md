# SmartLib Pro | Premium Library Management System

A sophisticated, modern, and highly functional Library Management system designed for professional academic and public institutions. Built with a focus on visual excellence, cloud scalability, and a seamless administrative experience.

![Dashboard Preview](https://api.dicebear.com/7.x/shapes/svg?seed=LibraryAnalytics&backgroundColor=4f46e5)

## 🌟 Key Features

### 👨‍💼 Librarian Dashboard
- **Real-Time Analytics**: Professional tracking of Trending Books, Circulation Volume, and Overdue Items.
- **Inventory Management**: Comprehensive tools to add new books, manage categories, and audit stock levels.
- **Member Management**: Track active members and their borrowing history.
- **Notification System**: One-click system for processing overdue notifications and alerts.

### 📚 Member Experience (Student View)
- **Advanced Book Search**: Filter by Title, Author, Category, or ISBN with real-time availability.
- **Visual Catalog**: Integration with global databases to display real book cover images.
- **Reservation System**: Automated waiting list for "Out of Stock" books with position tracking.
- **Borrowing History**: Personal dashboard to track currently borrowed books and historical records.

### 🛡 Core Architecture
- **Cloud Database**: Powered by **Supabase (PostgreSQL)** for enterprise-grade scalability and reliability.
- **Premium UI**: Framer Motion for smooth transitions, Glassmorphism accents, and a custom design system built with Tailwind CSS.
- **Global Typography**: Uses the **Inter** font family for a clean, corporate aesthetic.

## 🚀 Technology Stack

- **Frontend**: React, Vite, TypeScript, Tailwind CSS, Framer Motion, Lucide-React.
- **Backend**: Node.js, Express.js.
- **Database**: Prisma ORM, Supabase (PostgreSQL).
- **Images**: Open Library API integration.

## 🛠 Installation & Setup

For a detailed walkthrough, please refer to the **[FYP_SETUP.md](./FYP_SETUP.md)** guide.

### 💨 Quick Start (Windows)
If you are on Windows, simply run the automated setup script:
```powershell
./setup.bat
```

### 📋 Manual Setup
1. **Clone the project & Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment**:
   Create a `.env` file with your `DATABASE_URL` and `JWT_SECRET`.

3. **Database Setup**:
   ```bash
   npx prisma generate
   npx prisma db push
   npx tsx prisma/seed-books.ts
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```

## 📂 Project Structure

```bash
├── prisma/               # Database Schema & Seed Scripts
├── src/
│   ├── components/       # UI Components
│   │   ├── layout/       # Navigation & Sidebars
│   │   ├── dashboard/    # Analytics Cards
│   │   ├── books/        # Catalog Display
│   │   ├── ui/           # Design System Atoms
│   │   └── modals/       # Interactive Dialogs
│   ├── pages/            # View Pages (Dashboard, Search, etc.)
│   └── lib/              # Shared Utilities
├── server.ts             # Express.js API
└── package.json          # Dependency Manifest
```

---
*Created as a Professional Library Management Solution.*
