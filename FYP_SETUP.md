# 📚 Smart Library Management - FYP Setup Guide

Welcome to the Smart Library Management System. Follow these steps to get the project running locally on your machine using VS Code.

## 🛠 Prerequisites
Before starting, ensure you have the following installed:
1. **Node.js** (v18 or higher)
2. **VS Code**
3. **Git**
4. A **Supabase** account (for the database)

---

## 🚀 Step-by-Step Setup

### 1. Clone & Open
Open the project folder in VS Code.

### 2. Install Dependencies
Open the VS Code terminal and run:
```bash
npm install
```

### 3. Environment Configuration
Create a file named `.env` in the root directory and add your Supabase connection string:
```env
DATABASE_URL="your_supabase_postgresql_url"
JWT_SECRET="generate_any_random_string_here"
ADMIN_CODE="SMARTLIB-2026"
```
> **Note:** Use the "Transaction Pooler" URI from Supabase (Port 6543) and append `?pgbouncer=true` to the end.

### 4. Database Sync
Push the schema to your live database:
```bash
npx prisma db push
```

### 5. Seed Initial Data
Populate the library with 100+ premium books and default users:
```bash
npx tsx prisma/seed-books.ts
```

### 6. Start the System
Run the development server:
```bash
npm run dev
```
The app will be live at: **http://localhost:3000**

---

## 🔑 Default Login Credentials

### Librarian Portal
- **Email:** `iman@library.pro`
- **Password:** `password123`

### Student Portal
- **Email:** `hammad@student.pk`
- **Password:** `password123`

---

## 📁 Project Structure
- `/src`: Frontend React components & logic.
- `/server.ts`: Express backend & API routes.
- `/prisma`: Database schema and seeding scripts.
- `/public/uploads`: Local storage for uploaded book covers.
