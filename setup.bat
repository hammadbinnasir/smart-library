@echo off
echo ==========================================
echo   Smart Library System - Automated Setup
echo ==========================================
echo.

echo [1/4] Installing dependencies...
call npm install

echo [2/4] Generating Prisma client...
call npx prisma generate

echo [3/4] Synchronizing database...
call npx prisma db push

echo [4/4] Seeding initial data...
call npx tsx prisma/seed-books.ts

echo.
echo ==========================================
echo   Setup Complete!
echo   Type 'npm run dev' to start the server.
echo ==========================================
pause
