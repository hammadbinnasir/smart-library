import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, X, Bot, Loader2, Minus, ChevronUp } from 'lucide-react';
import { cn } from '../lib/utils';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm SmartLib AI. I can help you find books, check policies, or give you recommendations. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, isMinimized]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.text })
      });
      const data = await res.json();
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error('Chat failed');
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        text: "Sorry, I'm having trouble connecting to the library brain. Please try again later.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-sans pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: 'bottom right' }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? '80px' : '600px',
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={cn(
              "absolute bottom-20 right-0 w-[380px] max-w-[90vw] bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/20 flex flex-col overflow-hidden pointer-events-auto transition-all duration-300 ease-in-out",
              isMinimized ? "cursor-pointer" : ""
            )}
            onClick={() => isMinimized && setIsMinimized(false)}
          >
            {/* Header */}
            <div className="bg-indigo-600 p-6 text-white flex items-center justify-between relative overflow-hidden shrink-0">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 blur-3xl" />
              <div className="flex items-center gap-3 relative z-10">
                <div className="bg-white/20 p-2 rounded-xl">
                  <Bot size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight">SmartLib AI</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <p className="text-[9px] text-indigo-100 uppercase tracking-widest font-bold">Online Now</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 relative z-10">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMinimized(!isMinimized);
                  }}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {isMinimized ? <ChevronUp size={18} /> : <Minus size={18} />}
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                  }}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth custom-scrollbar bg-gradient-to-b from-white to-slate-50/50"
                >
                  {messages.map((msg) => (
                    <div 
                      key={msg.id}
                      className={cn(
                        "flex flex-col max-w-[85%]",
                        msg.sender === 'user' ? "ml-auto items-end" : "items-start"
                      )}
                    >
                      <div className={cn(
                        "px-5 py-3.5 rounded-[1.5rem] text-sm leading-relaxed shadow-sm whitespace-pre-wrap",
                        msg.sender === 'user' 
                          ? "bg-indigo-600 text-white rounded-tr-none shadow-indigo-100" 
                          : "bg-white text-slate-700 rounded-tl-none border border-slate-100 shadow-slate-100"
                      )}>
                        {msg.sender === 'bot' ? (
                          <ReactMarkdown 
                            components={{
                              p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                              ul: ({node, ...props}) => <ul className="list-disc ml-4 mb-2" {...props} />,
                              li: ({node, ...props}) => <li className="mb-1" {...props} />,
                              strong: ({node, ...props}) => <strong className="font-bold text-indigo-600" {...props} />,
                            }}
                          >
                            {msg.text}
                          </ReactMarkdown>
                        ) : (
                          msg.text
                        )}
                      </div>
                      <span className="text-[9px] text-slate-400 mt-2 px-1 font-semibold uppercase tracking-wider">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex flex-col items-start max-w-[85%]">
                      <div className="bg-white border border-slate-100 px-5 py-3.5 rounded-[1.5rem] rounded-tl-none text-slate-700 flex items-center gap-3 shadow-sm shadow-slate-100">
                        <Loader2 size={14} className="animate-spin text-indigo-600" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Thinking</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <form 
                  onSubmit={handleSend}
                  className="p-5 border-t border-slate-100 bg-white"
                >
                  <div className="relative group">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="w-full pl-5 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all text-sm placeholder:text-slate-400"
                    />
                    <button
                      type="submit"
                      disabled={!message.trim() || isTyping}
                      className="absolute right-1.5 top-1.5 p-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-30 disabled:hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 active:scale-95"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          if (isOpen && isMinimized) {
            setIsMinimized(false);
          } else {
            setIsOpen(!isOpen);
          }
        }}
        className={cn(
          "w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center transition-all duration-500 pointer-events-auto relative",
          isOpen && !isMinimized
            ? "bg-slate-100 text-slate-600 rotate-90" 
            : "bg-indigo-600 text-white hover:bg-indigo-700"
        )}
      >
        {isOpen && !isMinimized ? <X size={24} /> : <MessageSquare size={24} />}
        {(!isOpen || isMinimized) && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-[3px] border-white animate-pulse shadow-md" />
        )}
      </motion.button>
    </div>
  );
}
