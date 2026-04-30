import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { Dashboard } from './pages/Dashboard';
import { Search } from './pages/Search';
import { Reservations } from './pages/Reservations';
import { History } from './pages/History';
import { Moderation } from './pages/Moderation';
import { Profile } from './pages/Profile';
import { AddBookModal } from './components/modals/AddBookModal';
import { BookDetailsModal } from './components/modals/BookDetailsModal';
import { AuthPage } from './components/auth/AuthPage';
import { ResetPasswordPage } from './components/auth/ResetPasswordPage';
import { cn } from './lib/utils';
import { ConfirmModal } from './components/modals/ConfirmModal';

// --- Types ---
interface User {
  id: string;
  name: string;
  email: string;
  role: 'LIBRARIAN' | 'STUDENT';
  gender?: string;
  createdAt?: string;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (window.location.pathname.includes('/reset-password') && token) {
      setResetToken(token);
    }
  }, []);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'search' | 'reservations' | 'moderation' | 'history' | 'profile'>('dashboard');
  const [books, setBooks] = useState<any[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/me/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications');
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/me/notifications/${id}/read`, { method: 'PATCH' });
      if (res.ok) {
        fetchNotifications();
      }
    } catch (err) {
      console.error('Failed to mark as read');
    }
  };

  const handleProcessDueSoon = async () => {
    try {
      const res = await fetch('/api/notifications/process-due-soon', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        showToast('success', `${data.count} notifications sent to users.`);
        fetchStats();
      } else {
        showToast('error', data.error);
      }
    } catch (err) {
      showToast('error', 'Failed to process alerts.');
    }
  };
  const [allUsers, setAllUsers] = useState<User[]>([]);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterAvailable, setFilterAvailable] = useState(false);
  
  // Modals & UI
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBookDetails, setSelectedBookDetails] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [newBook, setNewBook] = useState({ 
    title: '', 
    author: '', 
    category: 'Fiction', 
    totalCopies: '1', 
    coverFile: null as File | null, 
    imagePreview: null as string | null 
  });
  
  // Custom Confirmation State
  const [confirmConfig, setConfirmConfig] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    show: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // --- Initial Data Loading ---
  useEffect(() => {
    fetchUser();
    fetchBooks();
    // Pre-calculate all categories once
    fetch('/api/books').then(res => res.json()).then(data => {
      const cats = Array.from(new Set(data.map((b: any) => b.category))) as string[];
      setAllCategories(cats);
    });
  }, []);

  // Update lists when filters change
  useEffect(() => {
    fetchBooks();
  }, [filterCategory, filterAvailable]);

  // Tab-based data fetching
  useEffect(() => {
    if (user?.role === 'LIBRARIAN') {
      fetchStats();
      fetchAllUsers();
    }
    
    if (activeTab === 'history') fetchHistory();
    if (activeTab === 'reservations') fetchReservations();
    if (activeTab === 'dashboard' || activeTab === 'profile') fetchNotifications();
  }, [user, activeTab]);

  // --- API Methods ---
  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("User fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (filterCategory) params.append('category', filterCategory);
      if (filterAvailable) params.append('available', 'true');
      
      const res = await fetch(`/api/books?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setBooks(data);
      }
    } catch (err) {
      console.error("Books fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Stats fetch failed", err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error("History fetch failed", err);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setAllUsers(data);
    } catch (err) {
      console.error("User pool fetch failed", err);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setConfirmConfig({
      show: true,
      title: 'Remove Member?',
      message: 'Are you sure you want to remove this member? All history will be archived.',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
          const data = await res.json();
          if (res.ok) {
            showToast('success', data.message);
            fetchAllUsers();
          } else {
            showToast('error', data.error);
          }
        } catch (err: any) {
          showToast('error', 'Fetch error: ' + err.message);
          console.error('Delete member error:', err);
        }
      }
    });
  };

  const handleDeleteBook = async (bookId: string) => {
    setConfirmConfig({
      show: true,
      title: 'Delete Book?',
      message: 'Are you sure you want to delete this book? This will also remove all borrowing and reservation history for this item.',
      onConfirm: async () => {
        console.log('Deleting book:', bookId);
        try {
          const res = await fetch(`/api/books/${bookId}`, { method: 'DELETE' });
          console.log('Delete response status:', res.status);
          const data = await res.json();
          if (res.ok) {
            showToast('success', data.message);
            fetchBooks();
            fetchStats();
          } else {
            showToast('error', data.error);
          }
        } catch (err: any) {
          showToast('error', 'Fetch error: ' + err.message);
          console.error('Delete fetch error:', err);
        }
      }
    });
  };

  const fetchReservations = async () => {
    try {
      const res = await fetch('/api/reservations');
      if (res.ok) {
        const data = await res.json();
        setReservations(data);
      }
    } catch (err) {
      console.error("Reservations fetch failed", err);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setStats(null);
      setHistory([]);
      setReservations([]);
      setNotifications([]);
      setAllUsers([]);
      setActiveTab('dashboard');
      showToast('success', 'Logged out of system');
    } catch (err) {
      showToast('error', 'Logout failed');
    }
  };

  const handleBorrow = async (bookId: string) => {
    try {
      const res = await fetch('/api/books/borrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('success', 'Book borrowed successfully! Track due dates in history.');
        fetchBooks();
        fetchHistory();
        fetchReservations(); // Refresh reservations too
      } else {
        showToast('error', data.error);
      }
    } catch (err) {
      showToast('error', 'Borrow transaction failed.');
    }
  };

  const handleReturn = async (transactionId: string) => {
    try {
      const res = await fetch('/api/books/return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('success', data.message);
        fetchStats();
        fetchBooks();
        fetchHistory();
      } else {
        showToast('error', data.error);
      }
    } catch (err) {
      showToast('error', 'Return operation failed.');
    }
  };

  const handleReserve = async (bookId: string) => {
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('success', `Reserved! Queue position ${data.queuePosition} confirmed.`);
        fetchStats();
        fetchReservations();
      } else {
        showToast('error', data.error);
      }
    } catch (err) {
      showToast('error', 'Reservation process failed.');
    }
  };

  const handleCancelReservation = async (reservationId: string, bookId: string) => {
    try {
      const res = await fetch(`/api/reservations/${reservationId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok) {
        showToast('success', 'Reservation cancelled successfully.');
        fetchBookDetails(bookId);
        fetchStats();
        fetchReservations();
      } else {
        showToast('error', data.error);
      }
    } catch (err) {
      showToast('error', 'Cancellation failed.');
    }
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let finalImageUrl = null;
      
      // 1. Upload the image if it exists
      if ((newBook as any).coverFile) {
        const formData = new FormData();
        formData.append('cover', (newBook as any).coverFile);
        
        const uploadRes = await fetch('/api/books/upload', {
          method: 'POST',
          body: formData
        });
        
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          finalImageUrl = uploadData.imageUrl;
        }
      }

      // 2. Create the book
      const res = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: newBook.title,
          author: newBook.author,
          category: newBook.category,
          totalCopies: newBook.totalCopies,
          imageUrl: finalImageUrl 
        })
      });

      if (res.ok) {
        showToast('success', 'Book successfully added to the catalog.');
        setShowAddModal(false);
        setNewBook({ 
          title: '', 
          author: '', 
          category: 'Fiction', 
          totalCopies: '1',
          coverFile: null,
          imagePreview: null
        });
        fetchBooks();
        if (!allCategories.includes(newBook.category)) {
          setAllCategories([...allCategories, newBook.category]);
        }
      }
    } catch (err) {
      showToast('error', 'Inventory registration failed.');
    }
  };

  const fetchBookDetails = async (book: any) => {
    setDetailsLoading(true);
    // Optimistic UI: Use existing book data immediately
    setSelectedBookDetails({ book: book, history: [], queue: [] });
    setShowDetailsModal(true); 
    
    try {
      const res = await fetch(`/api/books/${book.id}/details`);
      const data = await res.json();
      if (res.ok) {
        setSelectedBookDetails(data);
      } else {
        showToast('error', data.error);
        // We keep the modal open with partial data unless it's a 404
        if (res.status === 404) setShowDetailsModal(false);
      }
    } catch (err) {
      console.error("BG fetch failed");
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleProcessOverdue = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications/process-overdue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        showToast('success', `${data.notificationsSent} members notified of overdue books.`);
        fetchStats();
      }
    } catch (err) {
      showToast('error', 'Failed to process notifications.');
    } finally {
      setLoading(false);
    }
  };

  const currentNotifications = React.useMemo(() => {
    if (user?.role === 'LIBRARIAN') {
      return stats?.notificationLogs || [];
    } else if (user?.role === 'STUDENT') {
      return history
        .filter(t => t.status === 'BORROWED' || t.status === 'OVERDUE')
        .map(t => ({
          id: t.id,
          message: `Your book "${t.bookTitle}" is ${t.status === 'OVERDUE' ? 'OVERDUE! Return immediately.' : 'due back soon.'}`,
          timestamp: t.dueDate 
        }));
    }
    return [];
  }, [user, stats, history]);

  if (resetToken) {
    return <ResetPasswordPage token={resetToken} onComplete={() => setResetToken(null)} />;
  }

  if (!user && !loading) {
    return <AuthPage onLogin={setUser} />;
  }

  if (loading && !user) {
    return (
      <div className="h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Sidebar navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        userRole={user?.role} 
      />

      {/* Primary surface area */}
      <main id="main-scroll-area" className="flex-1 p-8 overflow-y-auto custom-scrollbar relative">
        <Navbar 
          user={user} 
          onLogout={logout} 
          activeTab={activeTab}
          notifications={currentNotifications}
        />

        <section className="max-w-7xl mx-auto pb-20 relative z-0">
          {activeTab === 'dashboard' && (
            <Dashboard 
              stats={stats} 
              loading={loading} 
              handleReturn={handleReturn} 
              handleProcessOverdue={handleProcessOverdue}
              handleProcessDueSoon={handleProcessDueSoon}
              notifications={notifications}
              handleMarkAsRead={handleMarkAsRead}
              user={user}
            />
          )}
          {activeTab === 'search' && (
            <Search 
              books={books} 
              loading={loading} 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filterCategory={filterCategory}
              setFilterCategory={setFilterCategory}
              filterAvailable={filterAvailable}
              setFilterAvailable={setFilterAvailable}
              allCategories={allCategories}
              fetchBooks={fetchBooks}
              handleBorrow={handleBorrow}
              handleReserve={handleReserve}
              fetchBookDetails={fetchBookDetails}
            />
          )}
          {activeTab === 'reservations' && (
            <Reservations 
              stats={stats} 
              reservations={reservations} 
              handleCancel={handleCancelReservation} 
              handleBorrow={handleBorrow}
              user={user} 
            />
          )}
          {activeTab === 'history' && <History history={history} />}
          {activeTab === 'moderation' && (
            <Moderation 
              books={books} 
              allUsers={allUsers} 
              setShowAddModal={setShowAddModal} 
              fetchBookDetails={fetchBookDetails} 
              handleDeleteUser={handleDeleteUser}
              handleDeleteBook={handleDeleteBook}
            />
          )}
          {activeTab === 'profile' && <Profile user={user} onUpdateUser={setUser} showToast={showToast} />}
        </section>

        {/* Global Toast System */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={cn(
                "fixed top-8 left-1/2 -translate-x-1/2 z-[100] px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-4 border-2 transition-all",
                notification.type === 'success' ? "bg-white/80 backdrop-blur-xl border-emerald-100 text-emerald-800" : "bg-white/80 backdrop-blur-xl border-rose-100 text-rose-800"
              )}
            >
              <div className={cn("p-2 rounded-xl", notification.type === 'success' ? "bg-emerald-50" : "bg-rose-50")}>
                {notification.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
              </div>
              <span className="font-semibold text-sm">{notification.message}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modals & Dialogs */}
      <AddBookModal 
        show={showAddModal} 
        onClose={() => setShowAddModal(false)}
        newBook={newBook}
        setNewBook={setNewBook}
        handleSubmit={handleAddBook}
      />
      
      <BookDetailsModal 
        show={showDetailsModal} 
        onClose={() => { setShowDetailsModal(false); setSelectedBookDetails(null); }}
        details={selectedBookDetails}
        loading={detailsLoading}
        onCancelReservation={handleCancelReservation}
        currentUser={user}
      />
      <ConfirmModal 
        show={confirmConfig.show}
        onClose={() => setConfirmConfig({ ...confirmConfig, show: false })}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
      />
    </div>
  );
}
