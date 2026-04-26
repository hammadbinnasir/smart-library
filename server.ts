import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { addDays, isAfter } from "date-fns";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import multer from "multer";
import fs from "fs";

const JWT_SECRET = process.env.JWT_SECRET || "library-secret-key-123";

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    await ensureUsers();
    console.log("✅ Database synchronized successfully.");
  } catch (err) {
    console.error("⚠️ Warning: Could not connect to database during startup. System will continue but some features may be unavailable.");
  }
  
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());
  
  // Serve static uploads
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

  // Delete user (Librarian only)
  app.delete("/api/users/:id", async (req, res) => {
    const user = (req as any).user;
    if (user.role !== "LIBRARIAN") return res.status(403).json({ error: "Access denied" });
    const { id } = req.params;
    if (id === user.id) return res.status(400).json({ error: "Cannot delete your own administrative account." });

    try {
      await prisma.user.delete({ where: { id } });
      res.json({ message: "Member account removed successfully." });
    } catch (err) {
      res.status(500).json({ error: "Failed to remove member." });
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
    if (user.role !== "LIBRARIAN") {
      return res.status(403).json({ error: "Access denied. Librarian role required." });
    }
    
    const { transactionId } = req.body;
    
    try {
      const trans = await prisma.transaction.findUnique({
        where: { id: transactionId },
        include: { book: true }
      });

      if (!trans) return res.status(404).json({ error: "Transaction not found" });
      if (trans.status === "RETURNED") return res.status(400).json({ error: "Book already returned" });

      let responseMessage = "Book returned successfully";

      const updatedTrans = await prisma.$transaction(async (tx) => {
        const t = await tx.transaction.update({
          where: { id: transactionId },
          data: {
            status: "RETURNED",
            returnDate: new Date()
          }
        });

        const reservations = await tx.reservation.findMany({
          where: { bookId: trans.bookId, status: "PENDING" },
          orderBy: { queuePosition: 'asc' },
          include: { user: true }
        });

        let allocated = false;
        for (const resv of reservations) {
          const alreadyHasActive = await tx.transaction.findFirst({
            where: {
              userId: resv.userId,
              bookId: trans.bookId,
              status: { in: ["BORROWED", "OVERDUE"] }
            }
          });

          if (alreadyHasActive) {
            // User already has a copy, fulfill their reservation as they clearly don't need another one now
            await tx.reservation.update({
              where: { id: resv.id },
              data: { status: "FULFILLED" }
            });
            continue;
          }

          // Allocate to this user
          await tx.reservation.update({
            where: { id: resv.id },
            data: { status: "FULFILLED" }
          });
          
          await tx.transaction.create({
            data: {
              bookId: trans.bookId,
              userId: resv.userId,
              dueDate: addDays(new Date(), 14),
              status: "BORROWED"
            }
          });
          
          await tx.book.update({
            where: { id: trans.bookId },
            data: { borrowedCount: { increment: 1 } }
          });

          responseMessage = `Book returned and auto-allocated to reserved member: ${resv.user.name}`;
          allocated = true;
          break;
        }

        if (!allocated) {
          await tx.book.update({
            where: { id: trans.bookId },
            data: { availableCopies: { increment: 1 } }
          });
        }

        return t;
      });

      res.json({ message: responseMessage, transaction: updatedTrans });
    } catch (err) {
      res.status(500).json({ error: "Return failed" });
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
            orderBy: { createdAt: 'asc' }
          }
        }
      });

      if (!bookDetail) return res.status(404).json({ error: "Book not found" });

      res.json({
        book: bookDetail,
        activeTransactions: bookDetail.transactions.map(t => ({ ...t, userName: (t.user as any)?.name })),
        reservationQueue: bookDetail.reservations.map(r => ({ ...r, userName: (r.user as any)?.name })),
        totalReservations: bookDetail.reservations.length
      });
    } catch (err) {
      console.error("Fetch book details failed:", err);
      res.status(503).json({ error: "Unable to retrieve book information." });
    }
  });

  // Borrow a book
  app.post("/api/transactions/borrow", async (req, res) => {
    const user = (req as any).user;
    const { bookId } = req.body;

    try {
      const book = await prisma.book.findUnique({ where: { id: bookId } });

      if (!book) return res.status(404).json({ error: "Book not found" });
      if (book.availableCopies <= 0) return res.status(400).json({ error: "Book is currently unavailable" });


      const newTransaction = await prisma.$transaction(async (tx) => {
        // Check inside transaction to prevent race conditions
        const existingTransaction = await tx.transaction.findFirst({
          where: {
            userId: user.id,
            bookId: bookId,
            status: { in: ["BORROWED", "OVERDUE"] }
          }
        });

        if (existingTransaction) {
          throw new Error("ALREADY_BORROWED");
        }

        await tx.book.update({
          where: { id: bookId },
          data: { 
            availableCopies: { decrement: 1 },
            borrowedCount: { increment: 1 }
          }
        });

        // Fulfill any pending reservations this user has for this book
        await tx.reservation.updateMany({
          where: {
            userId: user.id,
            bookId,
            status: "PENDING"
          },
          data: { status: "FULFILLED" }
        });

        return await tx.transaction.create({
          data: {
            bookId,
            userId: user.id,
            dueDate: addDays(new Date(), 14),
            status: "BORROWED"
          }
        });
      });

      res.json(newTransaction);
    } catch (err: any) {
      console.log(`❌ Borrow error for user ${user?.id}:`, err.code || err.message);
      
      if (err.message === "ALREADY_BORROWED" || err.code === "P2002") {
        return res.status(400).json({ 
          error: "Already borrowed" 
        });
      }
      
      if (err.code === "P1001" || err.code === "P1003") {
         return res.status(503).json({ error: "Database connection failed. Please try again in a moment." });
      }

      res.status(500).json({ error: "Borrowing failed" });
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

  // Get all users (Librarian only)
  app.get("/api/users", async (req, res) => {
    const user = (req as any).user;
    if (user.role !== "LIBRARIAN") return res.status(403).json({ error: "Access denied" });
    
    const users = await prisma.user.findMany();
    res.json(users);
  });

  // Reservation Logic
  app.post("/api/reservations", async (req, res) => {
    const currentUser = (req as any).user;
    const { bookId } = req.body;

    const existingReservation = await prisma.reservation.findFirst({
      where: { userId: currentUser.id, bookId, status: "PENDING" }
    });

    if (existingReservation) {
      return res.status(400).json({ error: "You already have a pending reservation for this book." });
    }

    const existingBorrow = await prisma.transaction.findFirst({
      where: { 
        userId: currentUser.id, 
        bookId, 
        status: { in: ["BORROWED", "OVERDUE"] }
      }
    });

    if (existingBorrow) {
      return res.status(400).json({ error: "You already have an active borrowing of this book and cannot reserve another copy." });
    }
    
    const book = await prisma.book.findUnique({ 
      where: { id: bookId },
      include: { reservations: { where: { status: "PENDING" } } }
    });

    if (!book) return res.status(404).json({ error: "Book not found" });
    
    // Strict Objective Alignment: Only reserve if book is currently borrowed (out of stock)
    if (book.availableCopies > 0) {
      return res.status(400).json({ error: "Book is available for immediate borrowing. No reservation required." });
    }

    const newReservation = await prisma.reservation.create({
      data: {
        bookId,
        userId: currentUser.id,
        queuePosition: book.reservations.length + 1,
        status: "PENDING"
      }
    });

    res.json(newReservation);
  });

  // Get active reservations
  app.get("/api/reservations", async (req, res) => {
    const user = (req as any).user;
    const reservations = await prisma.reservation.findMany({
      where: user.role === "LIBRARIAN" ? { status: "PENDING" } : { userId: user.id, status: "PENDING" },
      include: { book: true, user: true },
      orderBy: { reservedAt: 'desc' }
    });
    res.json(reservations);
  });

  // Cancel Reservation
  app.delete("/api/reservations/:id", async (req, res) => {
    const currentUser = (req as any).user;
    const { id } = req.params;

    try {
      const reservation = await prisma.reservation.findUnique({ where: { id } });

      if (!reservation) return res.status(404).json({ error: "Reservation not found" });
      if (reservation.status !== "PENDING") return res.status(400).json({ error: "Only pending reservations can be cancelled" });
      if (reservation.userId !== currentUser.id && currentUser.role !== "LIBRARIAN") {
        return res.status(403).json({ error: "You can only cancel your own reservations" });
      }

      await prisma.$transaction(async (tx) => {
        await tx.reservation.update({
          where: { id },
          data: { status: "CANCELLED" }
        });

        // Recalculate queue positions for remaining pending reservations
        const remaining = await tx.reservation.findMany({
          where: { bookId: reservation.bookId, status: "PENDING" },
          orderBy: { reservedAt: 'asc' }
        });

        for (let i = 0; i < remaining.length; i++) {
          await tx.reservation.update({
            where: { id: remaining[i].id },
            data: { queuePosition: i + 1 }
          });
        }
      });

      res.json({ message: "Reservation cancelled successfully" });
    } catch (err) {
      res.status(500).json({ error: "Failed to cancel reservation" });
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

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Server failed to start:", err);
  process.exit(1);
});
