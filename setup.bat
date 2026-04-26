@echo off
echo ==========================================
echo   Smart Library System - Automated Setup
echo ==========================================
echo.

echo [1/5] Checking Environment Variables...
if not exist .env (
    echo   Creating .env from .env.example...
    copy .env.example .env
    echo   ====================================================
    echo   ACTION REQUIRED:
    echo   A new .env file has been created. 
    echo   Please open .env and add your database credentials.
    echo   After saving the credentials, run setup.bat again.
    echo   ====================================================
    pause
    exit /b
) else (
    echo   .env file found.
)
echo.

echo [2/5] Installing dependencies...
call npm install

echo [3/5] Generating Prisma client...
call npx prisma generate

echo [4/5] Synchronizing database...
call npx prisma db push

echo [5/5] Seeding initial data...
call npx tsx prisma/seed-books.ts

echo.
echo ==========================================
echo   Setup Complete!
echo   Type 'npm run dev' to start the server.
echo ==========================================
pause
