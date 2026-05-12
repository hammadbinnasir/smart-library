import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { addDays, isAfter, format } from "date-fns";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import multer from "multer";
import fs from "fs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Auto-map Vercel Supabase variables to Prisma names
if (!process.env.DATABASE_URL && process.env.POSTGRES_PRISMA_URL) {
  process.env.DATABASE_URL = process.env.POSTGRES_PRISMA_URL;
}
if (!process.env.DIRECT_URL && process.env.POSTGRES_URL_NON_POOLING) {
  process.env.DIRECT_URL = process.env.POSTGRES_URL_NON_POOLING;
}

const JWT_SECRET = process.env.JWT_SECRET || "library-secret-key-123";
const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Email Transporter Setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Global Error Guard to prevent silent crashes
process.on("unhandledRejection", (reason) => {
  console.error("🔥 Unhandled Rejection at:", reason);
});
process.on("uncaughtException", (error) => {
  console.error("🔥 Uncaught Exception:", error);
});


async function ensureUsers() {
  const hashedPassword = await bcrypt.hash("password123", 10);

  const librarian = await prisma.user.upsert({
    where: { email: "iman@library.pro" },
    update: { password: hashedPassword, gender: "MALE" },
    create: {
      name: "Sheikh Iman Ali",
      email: "iman@library.pro",
      password: hashedPassword,
      role: "LIBRARIAN",
      gender: "MALE",
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "hammad@student.pk" },
    update: { password: hashedPassword, gender: "MALE" },
    create: {
      name: "Hammad Butt",
      email: "hammad@student.pk",
      password: hashedPassword,
      role: "STUDENT",
      gender: "MALE",
    },
  });

  // Seed some books if empty
  const bookCount = await prisma.book.count();
  if (bookCount === 0) {
    await prisma.book.createMany({
      data: [
        { title: "The Great Gatsby", author: "F. Scott Fitzgerald", category: "Fiction", isbn: "9780743273565", availableCopies: 2, totalCopies: 5, borrowedCount: 120 },
        { title: "1984", author: "George Orwell", category: "Dystopian", isbn: "9780451524935", availableCopies: 0, totalCopies: 3, borrowedCount: 250 },
        { title: "To Kill a Mockingbird", author: "Harper Lee", category: "Classic", isbn: "9780061120084", availableCopies: 1, totalCopies: 4, borrowedCount: 180 },
        { title: "The Hobbit", author: "J.R.R. Tolkien", category: "Fantasy", isbn: "9780547928227", availableCopies: 5, totalCopies: 5, borrowedCount: 300 },
        { title: "Sapiens", author: "Yuval Noah Harari", category: "History", isbn: "9780062316097", availableCopies: 3, totalCopies: 3, borrowedCount: 150 },
      ],
    });
  }

  // Seed overdue transactions for demo
  const txCount = await prisma.transaction.count();
  if (txCount === 0) {
    const books = await prisma.book.findMany({ take: 3 });
    const students = await prisma.user.findMany({ where: { role: "STUDENT" } });
    
    if (books.length > 0 && students.length > 0) {
      const studentId = students[0].id;
      
      await prisma.transaction.createMany({
        data: [
          {
            bookId: books[0].id,
            userId: studentId,
            borrowDate: addDays(new Date(), -30),
            dueDate: addDays(new Date(), -16),
            status: "OVERDUE"
          },
          {
            bookId: books[1].id,
            userId: studentId,
            borrowDate: addDays(new Date(), -25),
            dueDate: addDays(new Date(), -11),
            status: "OVERDUE"
          },
          {
            bookId: books[2].id,
            userId: studentId,
            borrowDate: addDays(new Date(), -20),
            dueDate: addDays(new Date(), -6),
            status: "OVERDUE"
          }
        ]
      });
    }
  }
}

async function startServer() {
  try {
    // Non-blocking database sync for Vercel efficiency
    ensureUsers().catch(err => {
      console.error("Delayed sync failed:", err);
    });

    const app = express();
    const PORT = process.env.PORT || 3000;

    app.use(express.json());
    app.use(cookieParser());

    app.get("/api/health", (req, res) => {
      res.json({ status: "ok", message: "Server is alive" });
    });
  
  app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));

  // Multer config
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });
  const upload = multer({ storage });

  // Upload endpoint
  app.post("/api/books/upload", upload.single("cover"), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    res.json({ imageUrl: `/uploads/${req.file.filename}` });
  });

  // --- Auth Middleware ---
  app.use(async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
      (req as any).user = null;
      return next();
    }

    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      (req as any).user = user;
      next();
    } catch (err) {
      (req as any).user = null;
      next();
    }
  });

  // --- Auth Routes ---
  app.post("/api/auth/register", async (req, res) => {
    const { name, email, password, role, adminCode, gender } = req.body;
    
    // --- Server-side Validation ---
    if (!name || !email || !password || !gender) {
      return res.status(400).json({ error: "All fields (Name, Email, Password, Gender) are required." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long." });
    }

    if (role === 'LIBRARIAN') {
      const EXPECTED_ADMIN_CODE = process.env.ADMIN_CODE || "SMARTLIB-2026";
      if (adminCode !== EXPECTED_ADMIN_CODE) {
        return res.status(403).json({ error: "Invalid Admin Code for Librarian registration" });
      }
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { name, email, password: hashedPassword, role: role || "STUDENT", gender: gender || null }
      });
      
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
      res.cookie("token", token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
      res.json(user);
    } catch (err) {
      res.status(400).json({ error: "Email already exists" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password, portalRole } = req.body;
    console.log(`Login attempt: ${email} for portal: ${portalRole}`);
    
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      
      if (!user) {
        console.log(`Login failed: User ${email} not found`);
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        console.log(`Login failed: Invalid password for ${email}`);
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      if (portalRole && user.role !== portalRole) {
        console.log(`Login failed: Role mismatch for ${email}. User is ${user.role}, trying to access ${portalRole}`);
        return res.status(403).json({ error: `Access denied. You cannot access the ${portalRole} portal with a ${user.role} account.` });
      }

      console.log(`Login successful: ${email}`);
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
      res.cookie("token", token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
      res.json(user);
    } catch (err) {
      console.error("❌ Database error during login:", err);
      
      // Fallback to mock users if database is down
      try {
        const fs = await import("fs/promises");
        let usersData = await fs.readFile(path.join(__dirname, "users_list.json"), "utf-8");
        // Strip BOM if present
        if (usersData.charCodeAt(0) === 0xFEFF) {
          usersData = usersData.slice(1);
        }
        const users = JSON.parse(usersData);
        const mockUser = users.find((u: any) => u.email === email);
        
        if (mockUser && password === "password123") { // Default password for mock
           console.log(`Login successful (MOCK): ${email}`);
           const token = jwt.sign({ userId: mockUser.id }, JWT_SECRET, { expiresIn: "7d" });
           res.cookie("token", token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
           return res.json(mockUser);
        }
      } catch (mockErr) {
        console.error("❌ Mock fallback failed:", mockErr);
      }
      
      res.status(503).json({ error: "Database connection failed. Please try again later or use the offline mode if available." });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logged out" });
  });

  app.post("/api/auth/forgot-password", async (req, res) => {
    console.log("Forgot password request:", req.body);
    const { email, role } = req.body;
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      
      if (!user) {
        return res.status(404).json({ 
          error: "This email address is not registered in our system. Please check the spelling or create a new account." 
        });
      }

      // Role-based validation
      if (role && user.role !== role) {
        return res.status(403).json({ 
          error: `Access Restricted: This account is registered under the ${user.role} portal. Please switch to the appropriate portal to proceed with your request.` 
        });
      }

      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken, resetTokenExpiry }
      });

      const resetUrl = `${req.protocol}://${req.get("host")}/reset-password?token=${resetToken}`;

      const mailOptions = {
        from: process.env.SMTP_FROM || '"Smart Library" <noreply@library.pro>',
        to: user.email,
        subject: "Password Reset Request",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #2563eb;">Password Reset</h2>
            <p>Hello ${user.name},</p>
            <p>You requested a password reset for your Smart Library account. Click the button below to set a new password:</p>
            <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
            <p>If you didn't request this, you can safely ignore this email.</p>
            <p>This link will expire in 1 hour.</p>
          </div>
        `,
      };

      if (process.env.SMTP_USER) {
        await transporter.sendMail(mailOptions);
      } else {
        console.log("-----------------------------------------");
        console.log("FORGOT PASSWORD TOKEN (No SMTP Configured)");
        console.log(`To: ${user.email}`);
        console.log(`URL: ${resetUrl}`);
        console.log("-----------------------------------------");
      }

      res.json({ 
        message: "If an account with that email exists, a reset link has been sent.",
        resetUrl: resetUrl // Include URL for direct redirection in dev/test
      });
    } catch (err) {
      console.error("Forgot password error:", err);
      res.status(500).json({ error: "Failed to process request" });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    const { token, password } = req.body;
    try {
      const user = await prisma.user.findFirst({
        where: {
          resetToken: token,
          resetTokenExpiry: { gt: new Date() }
        }
      });

      if (!user) {
        return res.status(400).json({ error: "Invalid or expired reset token" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null
        }
      });

      res.json({ message: "Password reset successful. You can now log in with your new password." });
    } catch (err) {
      console.error("Reset password error:", err);
      res.status(500).json({ error: "Failed to reset password" });
    }
  });

  // --- API Routes ---

  // Get current user profile
  app.get("/api/me", (req, res) => {
    res.json((req as any).user);
  });

  // Update current user profile
  app.patch("/api/me", async (req, res) => {
    const currentUser = (req as any).user;
    if (!currentUser) return res.status(401).json({ error: "Unauthorized" });

    const { name, gender } = req.body;
    try {
      const updatedUser = await prisma.user.update({
        where: { id: currentUser.id },
        data: { name, gender }
      });
      res.json(updatedUser);
    } catch (err) {
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Update password
  app.patch("/api/me/password", async (req, res) => {
    const currentUser = (req as any).user;
    if (!currentUser) return res.status(401).json({ error: "Unauthorized" });

    const { currentPassword, newPassword } = req.body;
    try {
      const user = await prisma.user.findUnique({ where: { id: currentUser.id } });
      if (!user) return res.status(404).json({ error: "User not found" });

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return res.status(400).json({ error: "Incorrect current password" });

      if (newPassword.length < 6) {
        return res.status(400).json({ error: "New password must be at least 6 characters long" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: currentUser.id },
        data: { password: hashedPassword }
      });

      res.json({ message: "Password updated successfully" });
    } catch (err) {
      res.status(500).json({ error: "Failed to update password" });
    }
  });


  // Update profile picture
  app.patch("/api/me/profile-picture", async (req, res) => {
    const currentUser = (req as any).user;
    if (!currentUser) return res.status(401).json({ error: "Unauthorized" });

    const { imageUrl } = req.body;
    try {
      const updatedUser = await prisma.user.update({
        where: { id: currentUser.id },
        data: { imageUrl }
      });
      res.json(updatedUser);
    } catch (err) {
      res.status(500).json({ error: "Failed to update profile picture" });
    }
  });

  // Get borrowing history (Global for Librarian, Personal for Student)
  app.get("/api/history", async (req, res) => {
    const user = (req as any).user;
    const history = await prisma.transaction.findMany({
      where: user.role === "LIBRARIAN" ? {} : { userId: user.id },
      include: { book: true, user: true },
      orderBy: { borrowDate: 'desc' }
    });
    
    res.json(history.map(t => ({
      ...t,
      bookTitle: t.book.title,
      userName: t.user?.name
    })));
  });

  // Manual Override: Mark as returned (Librarian only)
  app.post("/api/transactions/return", async (req, res) => {
    const user = (req as any).user;
    if (!user || user.role !== "LIBRARIAN") {
      return res.status(403).json({ error: "Access denied. Librarian role required." });
    }
    
    const { transactionId } = req.body;
    
    try {
      const result = await prisma.$transaction(async (tx) => {
        const trans = await tx.transaction.findUnique({
          where: { id: transactionId },
          include: { book: true }
        });

        if (!trans) throw new Error("Transaction not found");
        if (trans.status === "RETURNED") throw new Error("Book already returned");

        // 1. Mark as returned
        const updatedTrans = await tx.transaction.update({
          where: { id: transactionId },
          data: {
            status: "RETURNED",
            returnDate: new Date()
          }
        });

        // 2. Increment availableCopies (Primary source of truth)
        await tx.book.update({
          where: { id: trans.bookId },
          data: { availableCopies: { increment: 1 } }
        });

        // 3. Notify the next person who becomes "Ready"
        const updatedBook = await tx.book.findUnique({ where: { id: trans.bookId } });
        const nextInLine = await tx.reservation.findFirst({
          where: { 
            bookId: trans.bookId, 
            status: "PENDING",
            queuePosition: updatedBook?.availableCopies || 1
          }
        });

        if (nextInLine) {
          await tx.notification.create({
            data: {
              userId: nextInLine.userId,
              type: "RESERVATION_READY",
              message: `The book "${trans.book.title}" is now available for you! Visit your reservations to claim it.`
            }
          });
        }

        return { transaction: updatedTrans, notified: !!nextInLine };
      });

      res.json({ message: "Book returned successfully", notified: result.notified });
    } catch (err: any) {
      console.error("Return error:", err);
      res.status(400).json({ error: err.message || "Failed to process return" });
    }
  });

  // Get all books with search
  app.get("/api/books", async (req, res) => {
    try {
      const { q, author, category, available } = req.query;
      
      const books = await prisma.book.findMany({
        where: {
          AND: [
            q ? {
              OR: [
                { title: { contains: q as string, mode: 'insensitive' } },
                { author: { contains: q as string, mode: 'insensitive' } }
              ]
            } : {},
            category ? { category: category as string } : {},
            available === "true" ? { availableCopies: { gt: 0 } } : {}
          ]
        },
        orderBy: { borrowedCount: 'desc' },
        take: 200
      });

      // Enrich with user-specific borrowing status if user is logged in
      const currentUser = (req as any).user;
      let userBorrowedBookIds: string[] = [];
      
      if (currentUser) {
        const activeTransactions = await prisma.transaction.findMany({
          where: {
            userId: currentUser.id,
            status: { in: ["BORROWED", "OVERDUE"] }
          },
          select: { bookId: true }
        });
        userBorrowedBookIds = activeTransactions.map(t => t.bookId);
      }

      const enrichedBooks = books.map(book => ({
        ...book,
        isBorrowedByUser: userBorrowedBookIds.includes(book.id)
      }));

      res.json(enrichedBooks);
    } catch (err) {
      console.error("Database query failed:", err);
      res.status(503).json({ error: "Database temporarily unavailable. Please try again in a moment." });
    }
  });

  // Get specific book details
  app.get("/api/books/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const bookDetail = await prisma.book.findUnique({
        where: { id },
        include: {
          transactions: {
            where: { status: "BORROWED" },
            include: { user: { select: { name: true } } },
            orderBy: { borrowDate: 'desc' }
          },
          reservations: {
            include: { user: { select: { name: true } } },
            orderBy: { reservedAt: 'asc' }
          }
        }
      });

      if (!bookDetail) return res.status(404).json({ error: "Book not found" });

      res.json({
        book: bookDetail,
        activeTransactions: (bookDetail as any).transactions.map((t: any) => ({ ...t, userName: (t.user as any)?.name })),
        reservationQueue: (bookDetail as any).reservations.map((r: any) => ({ ...r, userName: (r.user as any)?.name })),
        totalReservations: (bookDetail as any).reservations.length
      });
    } catch (err) {
      console.error("Fetch book details failed:", err);
      res.status(503).json({ error: "Unable to retrieve book information." });
    }
  });

  // Borrow a book
  app.post("/api/books/borrow", async (req, res) => {
    const { bookId } = req.body;
    const currentUser = (req as any).user;
    if (!currentUser) return res.status(401).json({ error: "Unauthorized" });

    try {
      const result = await prisma.$transaction(async (tx) => {
        const book = await tx.book.findUnique({ 
          where: { id: bookId },
          include: { 
            reservations: { 
              where: { status: "PENDING" }, 
              orderBy: { queuePosition: 'asc' } 
            } 
          }
        });

        if (!book) throw new Error("Book not found");

        const userReservation = book.reservations.find(r => r.userId === currentUser.id);
        const queueLength = book.reservations.length;
        
        // Logical Permission Check
        const canPublicBorrow = book.availableCopies > queueLength;
        const isQueuePriority = userReservation && userReservation.queuePosition <= book.availableCopies;

        if (!canPublicBorrow && !isQueuePriority) {
          if (userReservation) {
            throw new Error(`Queue Position: #${userReservation.queuePosition}. There are currently ${book.availableCopies} copies available. Please wait your turn.`);
          } else {
            throw new Error("All available copies are reserved for students in the queue. Please join the reservation list.");
          }
        }

        // Check for active borrows of SAME book
        const activeBorrow = await tx.transaction.findFirst({
          where: { 
            userId: currentUser.id, 
            bookId, 
            status: { in: ["BORROWED", "OVERDUE"] } 
          }
        });
        if (activeBorrow) throw new Error("You already have an active copy of this book.");

        // Create transaction
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 14);

        const transaction = await tx.transaction.create({
          data: {
            bookId,
            userId: currentUser.id,
            dueDate,
            status: "BORROWED"
          }
        });

        // Update book availability
        await tx.book.update({
          where: { id: bookId },
          data: { 
            borrowedCount: { increment: 1 },
            availableCopies: { decrement: 1 }
          }
        });

        // If user had a reservation, fulfill it and re-index the queue
        if (userReservation) {
          await tx.reservation.update({
            where: { id: userReservation.id },
            data: { status: "FULFILLED" }
          });

          // Shift everyone else up
          const remaining = await tx.reservation.findMany({
            where: { bookId, status: "PENDING" },
            orderBy: { queuePosition: 'asc' }
          });

          for (let i = 0; i < remaining.length; i++) {
            await tx.reservation.update({
              where: { id: remaining[i].id },
              data: { queuePosition: i + 1 }
            });
          }
        }

        return transaction;
      });

      res.json(result);
    } catch (err: any) {
      console.error("Borrow error:", err);
      res.status(400).json({ error: err.message || "Borrowing failed" });
    }
  });

  // Add new book (Librarian only)
  app.post("/api/books", async (req, res) => {
    const user = (req as any).user;
    if (user.role !== "LIBRARIAN") return res.status(403).json({ error: "Access denied" });

    const { title, author, category, totalCopies, imageUrl } = req.body;
    try {
      const newBook = await prisma.book.create({
        data: {
          title,
          author,
          category,
          imageUrl,
          isbn: `978${Date.now().toString().slice(-10)}`, // Generate modern 13-digit style identifier
          totalCopies: parseInt(totalCopies),
          availableCopies: parseInt(totalCopies),
        }
      });
      res.json(newBook);
    } catch (err) {
      res.status(500).json({ error: "Failed to add book" });
    }
  });

  // Delete book (Librarian only)
  app.delete("/api/books/:id", async (req, res) => {
    const { id } = req.params;
    console.log('DELETE request for book:', id);
    const user = (req as any).user;
    if (!user || user.role !== "LIBRARIAN") return res.status(403).json({ error: "Access denied" });
    
    try {
      // We use a transaction to ensure all related data is cleaned up
      await prisma.$transaction([
        prisma.transaction.deleteMany({ where: { bookId: id } }),
        prisma.reservation.deleteMany({ where: { bookId: id } }),
        prisma.book.delete({ where: { id } })
      ]);
      res.json({ message: "Book and associated records removed successfully." });
    } catch (err) {
      console.error("Delete book error:", err);
      res.status(500).json({ error: "Failed to remove book from catalog." });
    }
  });

  // Get all users (Librarian only)
  app.get("/api/users", async (req, res) => {
    const user = (req as any).user;
    if (!user || user.role !== "LIBRARIAN") return res.status(403).json({ error: "Access denied" });
    
    const users = await prisma.user.findMany();
    res.json(users);
  });

  // Delete user (Librarian only)
  app.delete("/api/users/:id", async (req, res) => {
    const { id } = req.params;
    console.log('DELETE request for member:', id);
    const user = (req as any).user;
    if (!user || user.role !== "LIBRARIAN") return res.status(403).json({ error: "Access denied" });
    
    try {
      // Prevent deleting self
      if (id === user.id) {
        return res.status(400).json({ error: "You cannot remove your own administrative account." });
      }

      await prisma.$transaction([
        prisma.transaction.deleteMany({ where: { userId: id } }),
        prisma.reservation.deleteMany({ where: { userId: id } }),
        prisma.user.delete({ where: { id } })
      ]);
      res.json({ message: "Member account and history removed successfully." });
    } catch (err) {
      console.error("Delete user error:", err);
      res.status(500).json({ error: "Failed to remove member account." });
    }
  });

  // Reservation Logic
  app.post("/api/reservations", async (req, res) => {
    const currentUser = (req as any).user;
    const { bookId } = req.body;

    try {
      const reservation = await prisma.$transaction(async (tx) => {
        // 1. Check if user already has it
        const existingBorrow = await tx.transaction.findFirst({
          where: { userId: currentUser.id, bookId, status: { in: ["BORROWED", "OVERDUE"] } }
        });
        if (existingBorrow) throw new Error("You already have an active borrowing of this book.");

        const existingRes = await tx.reservation.findFirst({
          where: { userId: currentUser.id, bookId, status: "PENDING" }
        });
        if (existingRes) throw new Error("You already have a pending reservation for this book.");

        // 2. Check book availability
        const book = await tx.book.findUnique({ where: { id: bookId } });
        if (!book) throw new Error("Book not found");
        if (book.availableCopies > 0) throw new Error("Book is available for immediate borrowing.");

        // 3. Get next position
        const count = await tx.reservation.count({
          where: { bookId, status: "PENDING" }
        });

        return await tx.reservation.create({
          data: {
            bookId,
            userId: currentUser.id,
            queuePosition: count + 1,
            status: "PENDING"
          }
        });
      });

      res.json(reservation);
    } catch (err: any) {
      res.status(400).json({ error: err.message || "Failed to create reservation" });
    }
  });

  // Get active reservations
  app.get("/api/reservations", async (req, res) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    try {
      const reservations = await prisma.reservation.findMany({
        where: user.role === "LIBRARIAN" ? { status: "PENDING" } : { userId: user.id, status: "PENDING" },
        include: { 
          book: {
            include: {
              transactions: { 
                where: { 
                  status: { in: ["BORROWED", "OVERDUE"] } 
                } 
              }
            }
          }, 
          user: true 
        },
        orderBy: { reservedAt: 'desc' }
      });

      // Enrich with isReady status
      const enriched = reservations.map(resv => {
        // A book is ready if the user's position is within the number of available copies
        const borrowedCount = resv.book.transactions.length;
        const inLibrary = resv.book.totalCopies - borrowedCount;
        const isReady = resv.queuePosition <= inLibrary && resv.status === "PENDING";
        
        return {
          ...resv,
          isReady
        };
      });

      res.json(enriched);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch reservations" });
    }
  });

  // Cancel Reservation
  app.delete("/api/reservations/:id", async (req, res) => {
    const { id } = req.params;
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    try {
      await prisma.$transaction(async (tx) => {
        const reservation = await tx.reservation.findUnique({
          where: { id }
        });

        if (!reservation) throw new Error("Reservation not found");
        
        // Authorization check
        if (user.role !== "LIBRARIAN" && reservation.userId !== user.id) {
          throw new Error("You are not authorized to cancel this reservation");
        }

        // 1. Cancel the reservation
        await tx.reservation.update({
          where: { id },
          data: { status: "CANCELLED" }
        });

        // 2. Recalculate queue positions for remaining pending reservations for this book
        const remaining = await tx.reservation.findMany({
          where: { 
            bookId: reservation.bookId, 
            status: "PENDING" 
          },
          orderBy: { queuePosition: 'asc' }
        });

        // Re-index sequentially to avoid gaps
        for (let i = 0; i < remaining.length; i++) {
          await tx.reservation.update({
            where: { id: remaining[i].id },
            data: { queuePosition: i + 1 }
          });
        }
      });

      res.json({ message: "Reservation cancelled successfully" });
    } catch (err: any) {
      console.error("Cancel reservation error:", err);
      res.status(400).json({ error: err.message || "Failed to cancel reservation" });
    }
  });

  // Librarian Dashboard Stats (Protected)
  app.get("/api/stats", async (req, res) => {
    const user = (req as any).user;
    if (user.role !== "LIBRARIAN") return res.status(403).json({ error: "Access denied" });

    const totalBooks = await prisma.book.count();
    const activeReservations = await prisma.reservation.count({ where: { status: "PENDING" } });
    const overdueTransactions = await prisma.transaction.findMany({
      where: { status: "OVERDUE" },
      include: { book: true, user: true }
    });

    const mostBorrowed = await prisma.book.findMany({
      orderBy: { borrowedCount: 'desc' },
      take: 5
    });

    const recentTransactions = await prisma.transaction.findMany({
      orderBy: { borrowDate: 'desc' },
      take: 8,
      include: { book: true, user: true }
    });

    const logs = recentTransactions.map(t => ({
      id: t.id,
      message: `${t.user.name} borrowed "${t.book.title}"`,
      timestamp: t.borrowDate
    }));

    res.json({
      mostBorrowed,
      overdue: overdueTransactions.map(t => ({
        ...t,
        bookTitle: t.book.title,
        userName: t.user.name
      })),
      totalBooks,
      activeReservations,
      notificationLogs: logs
    });
  });

  // Process Overdue Notifications
  app.post("/api/notifications/process-overdue", async (req, res) => {
    const user = (req as any).user;
    if (user.role !== "LIBRARIAN") return res.status(403).json({ error: "Access denied" });

    const now = new Date();
    const overdue = await prisma.transaction.findMany({
      where: {
        status: "BORROWED",
        dueDate: { lt: now }
      }
    });

    await prisma.transaction.updateMany({
      where: { id: { in: overdue.map(t => t.id) } },
      data: { status: "OVERDUE" }
    });

    res.json({ 
      message: "Overdue processing complete", 
      notificationsSent: overdue.length
    });
  });

  // Process "Due Tomorrow" Notifications (Librarian only)
  app.post("/api/notifications/process-due-soon", async (req, res) => {
    const user = (req as any).user;
    if (!user || user.role !== "LIBRARIAN") return res.status(403).json({ error: "Access denied" });

    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

      const dueTomorrow = await prisma.transaction.findMany({
        where: {
          status: "BORROWED",
          dueDate: {
            gte: tomorrow,
            lt: dayAfterTomorrow
          }
        },
        include: { user: true, book: true }
      });

      let count = 0;
      for (const t of dueTomorrow) {
        // Check if a notification for this transaction and type already exists for today
        // (to avoid spamming if run multiple times)
        const existing = await prisma.notification.findFirst({
          where: {
            userId: t.userId,
            type: "DUE_SOON",
            message: { contains: t.book.title },
            createdAt: {
              gte: new Date(new Date().setHours(0,0,0,0))
            }
          }
        });

        if (!existing) {
          await prisma.notification.create({
            data: {
              userId: t.userId,
              type: "DUE_SOON",
              message: `Reminder: Your borrowed book "${t.book.title}" is due for return tomorrow. Please return it to avoid late fees.`
            }
          });
          count++;
        }
      }

      res.json({ message: "Due soon notifications processed", count });
    } catch (err) {
      console.error("Process due soon error:", err);
      res.status(500).json({ error: "Failed to process notifications" });
    }
  });

  // Get User Notifications
  app.get("/api/me/notifications", async (req, res) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    res.json(notifications);
  });

  // Mark Notification as Read
  app.patch("/api/me/notifications/:id/read", async (req, res) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    await prisma.notification.updateMany({
      where: { id: req.params.id, userId: user.id },
      data: { isRead: true }
    });
    res.json({ success: true });
  });

  // --- AI Chatbot Route (Powered by Gemini) ---
  app.post("/api/chat", async (req, res) => {
    const { message } = req.body;
    const user = (req as any).user;

    try {
      // 1. Fetch book catalog for context (Limited to top 100 for token efficiency)
      const books = await prisma.book.findMany({
        take: 100,
        select: { title: true, author: true, category: true, availableCopies: true }
      });

      const catalogContext = books.map(b => 
        `- ${b.title} by ${b.author} (${b.category}) [${b.availableCopies > 0 ? 'Available' : 'Reserved/Borrowed'}]`
      ).join('\n');

      // 2. Prepare the system instructions and prompt
      const prompt = `
You are "SmartLib AI", a premium, helpful, and professional library assistant for the Smart Library Management system.
Your goal is to assist students and librarians with their queries.

CONTEXT:
- Current User: ${user ? user.name : 'Guest'} (Role: ${user?.role || 'None'})
- Library Policy: Books can be borrowed for 14 days. Reservations are available for borrowed books.
- System Admin/Librarian: Sheikh Iman Ali

BOOK CATALOG (Current Inventory):
${catalogContext}

USER MESSAGE: "${message}"

INSTRUCTIONS:
1. FORMATTING: Use clear bullet points (•) and line breaks (\n) for lists.
2. BOLDING: Use double asterisks (**Text**) for bolding book titles or important terms. NEVER use triple asterisks.
3. STRUCTURE: Use double line breaks between paragraphs for a spacious, clean look.
4. TONE: Be helpful, extremely professional, and use the user's name (${user?.name || 'Guest'}).
5. CATALOG: Always recommend books that are explicitly listed in the CATALOG provided above.
6. POLICY: Mention the 14-day borrowing policy when relevant.
`;

      // 3. Call Gemini AI with Fallback
      console.log("Using API Key:", process.env.GEMINI_API_KEY ? "PRESENT" : "MISSING");
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
      let responseText = "";
      
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
        const result = await model.generateContent(prompt);
        responseText = result.response.text();
      } catch (err: any) {
        console.warn("⚠️ Gemini 3 Flash failed, attempting fallback to gemini-flash-latest...", err.message);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const result = await model.generateContent(prompt);
        responseText = result.response.text();
      }

      res.json({ response: responseText });
    } catch (err) {
      console.error("AI Chat Error:", err);
      res.status(500).json({ response: "I'm sorry, I'm having trouble connecting to my AI brain. Please check your internet or try again later." });
    }
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

    return app;
  } catch (err) {
    console.error("Critical error during server initialization:", err);
    throw err;
  }
}

const appPromise = startServer();

// For Vercel, we need to export the app as a function
export default async (req: any, res: any) => {
  const app = await appPromise;
  if (!app) {
    res.status(500).send("Server failed to initialize");
    return;
  }
  return app(req, res);
};
