"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Library, BookOpen, Globe, Shield, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import BookCard from "./BookCard";
import BookDetail from "./BookDetail";
import { Book } from "@/lib/types";

interface LandingProps {
    onSignIn: () => void;
}

export default function Landing({ onSignIn }: LandingProps) {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);

    useEffect(() => {
        fetch("/api/books")
            .then(res => res.ok ? res.json() : [])
            .then(data => {
                if (Array.isArray(data)) {
                    setBooks(data);
                } else {
                    setBooks([]);
                }
                setLoading(false);
            })
            .catch(() => {
                setBooks([]);
                setLoading(false);
            });
    }, []);

    const filteredBooks = Array.isArray(books) ? books.filter(book =>
        book.title.toLowerCase().includes(search.toLowerCase()) ||
        book.author.toLowerCase().includes(search.toLowerCase()) ||
        (book.subject && book.subject.toLowerCase().includes(search.toLowerCase()))
    ) : [];

    return (
        <div className="min-h-screen bg-[#030303] text-zinc-100 overflow-hidden font-sans relative">
            {/* Background Minimal Grid */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: `linear-gradient(#84cc16 1px, transparent 1px), linear-gradient(90deg, #84cc16 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />

            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-brand/5 blur-[140px] rounded-full" />
            </div>

            {/* Header */}
            <header className="relative z-30 max-w-7xl mx-auto px-6 py-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand flex items-center justify-center shadow-[0_0_30px_rgba(132,204,22,0.2)]">
                        <Library className="text-black w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-2xl font-black tracking-tighter text-white uppercase leading-none">
                            Learnivo<span className="text-brand"> library</span>
                        </span>
                        <span className="text-[8px] font-black text-brand uppercase tracking-[0.4em] mt-1">Digital Repository</span>
                    </div>
                </div>
                <button
                    onClick={onSignIn}
                    className="px-8 py-3 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-brand hover:text-black hover:border-brand transition-all cursor-pointer group flex items-center gap-3 active:translate-y-px"
                >
                    Sign In
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </button>
            </header>

            {/* Main Content */}
            <main className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-32">
                <AnimatePresence mode="wait">
                    {!selectedBook ? (
                        <motion.div
                            key="landing-main"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-40"
                        >
                            {/* Hero Section */}
                            <div className="max-w-5xl mx-auto">
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                                    className="space-y-12"
                                >
                                    <div className="space-y-4">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand/10 border-l-2 border-brand text-brand text-[8px] font-black uppercase tracking-[0.3em]">
                                            Open Education Library
                                        </div>

                                        <h1 className="text-6xl md:text-[100px] font-black text-white tracking-tighter leading-[0.85]">
                                            Read anything. <br />
                                            <span className="text-zinc-700">Anytime.</span>
                                        </h1>

                                        <p className="text-zinc-500 text-lg md:text-xl max-w-xl leading-relaxed font-medium">
                                            A simple, free platform to access thousands of academic books and research papers. No hidden costs, just learning.
                                        </p>
                                    </div>

                                    {/* Boxy Search Bar matching Login style */}
                                    <div className="relative max-w-3xl group">
                                        <div className="absolute -inset-1 bg-brand/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                        <div className="relative bg-[#0a0a0a] border border-white/5 p-1">
                                            <div className="bg-[#0d0d0d] border border-white/10 p-2 flex items-center relative overflow-hidden">
                                                {/* Corner accents */}
                                                <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-brand/40" />
                                                <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-brand/40" />

                                                <Search className="w-4 h-4 text-zinc-600 ml-4" />
                                                <input
                                                    type="text"
                                                    placeholder="Find books, authors, or subjects..."
                                                    value={search}
                                                    onChange={(e) => setSearch(e.target.value)}
                                                    className="flex-grow bg-transparent border-none text-white focus:outline-none placeholder:text-zinc-800 font-bold uppercase tracking-widest text-[10px] py-4 px-6"
                                                />
                                                <button className="bg-brand text-black font-black text-[10px] uppercase tracking-[0.2em] px-12 py-4 hover:bg-brand/90 transition-all cursor-pointer">
                                                    Search
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Horizontal Books Carousel */}
                            <section className="space-y-10">
                                <div className="flex items-end justify-between border-b border-white/5 pb-6">
                                    <div className="space-y-1">
                                        <p className="text-brand text-[8px] font-black uppercase tracking-[0.4em]">Curated Collection</p>
                                        <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Trending Books</h2>
                                    </div>
                                    <button
                                        onClick={onSignIn}
                                        className="flex items-center gap-2 text-zinc-600 hover:text-brand transition-colors group text-[8px] font-black uppercase tracking-[0.2em]"
                                    >
                                        Browse Library
                                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>

                                <div className="relative">
                                    <div className="flex gap-6 overflow-x-auto pb-8 pt-2 px-2 -mx-2 custom-scrollbar snap-x no-scrollbar">
                                        {loading ? (
                                            [1, 2, 3, 4, 5].map(i => (
                                                <div key={i} className="min-w-[300px] aspect-[3/4] bg-white/[0.02] border border-white/5 animate-pulse" />
                                            ))
                                        ) : filteredBooks.length > 0 ? (
                                            filteredBooks.map((book, i) => (
                                                <div key={book.id} className="min-w-[300px] snap-center">
                                                    <BookCard
                                                        book={book}
                                                        index={i}
                                                        onSelect={() => setSelectedBook(book)}
                                                    />
                                                </div>
                                            ))
                                        ) : (
                                            <div className="w-full py-40 text-center border border-white/[0.03] bg-[#0a0a0a]/30 relative overflow-hidden group">
                                                <div className="absolute top-0 left-0 w-12 h-12 border-t border-l border-brand/20" />
                                                <div className="absolute bottom-0 right-0 w-12 h-12 border-b border-r border-brand/20" />
                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand/5 blur-[100px] pointer-events-none" />

                                                <div className="relative z-10 flex flex-col items-center gap-8">
                                                    <div className="w-20 h-20 bg-white/[0.02] border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                                                        <Search className="w-8 h-8 text-zinc-800 group-hover:text-brand/40 transition-colors" />
                                                    </div>
                                                    <div className="space-y-3">
                                                        <h3 className="text-white font-black text-2xl uppercase tracking-tighter">No Books Found</h3>
                                                        <p className="text-zinc-700 font-bold text-[9px] uppercase tracking-[0.4em] max-w-xs mx-auto leading-relaxed">
                                                            Your search query returned zero matching books from our records.
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => setSearch("")}
                                                        className="px-12 py-4 bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.3em] hover:bg-white/10 hover:border-brand/40 transition-all cursor-pointer"
                                                    >
                                                        Clear Search
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Scroller bottom accent */}
                                    <div className="h-0.5 w-full bg-white/5 mt-4 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 h-full w-1/4 bg-brand/40 animate-shimmer" />
                                    </div>
                                </div>
                            </section>

                            {/* Features Section - More Industrial */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
                                {[
                                    {
                                        icon: BookOpen,
                                        title: "Adaptive Reading",
                                        desc: "Books with built-in OCR and AI summaries.",
                                        color: "group-hover:text-brand"
                                    },
                                    {
                                        icon: Globe,
                                        title: "Global Access",
                                        desc: "Read from any device, anywhere, instantly.",
                                        color: "group-hover:text-blue-400"
                                    },
                                    {
                                        icon: Shield,
                                        title: "Safe & Secure",
                                        desc: "High-grade security for your personal data.",
                                        color: "group-hover:text-emerald-400"
                                    }
                                ].map((feature, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 + i * 0.1 }}
                                        className="p-10 bg-[#0a0a0a] border border-white/5 relative group overflow-hidden"
                                    >
                                        <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/10 group-hover:border-brand/40 transition-colors" />
                                        <div className="relative z-10 space-y-4">
                                            <feature.icon className={cn("w-6 h-6 text-zinc-700 transition-colors", feature.color)} />
                                            <h3 className="text-lg font-black text-white uppercase tracking-tight">{feature.title}</h3>
                                            <p className="text-zinc-500 text-xs font-medium leading-relaxed">{feature.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="book-detail-view"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                        >
                            <BookDetail
                                book={selectedBook}
                                onBack={() => setSelectedBook(null)}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/5 bg-[#030303] py-12">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-zinc-700 text-[8px] font-black uppercase tracking-[0.4em]">
                        © 2026 LEARNIVO. BUILT FOR THE FUTURE OF OPEN LEARNING.
                    </div>
                    <div className="flex items-center gap-8 text-[8px] font-black text-zinc-600 uppercase tracking-[0.2em]">
                        <a href="#" className="hover:text-brand transition-colors">Privacy</a>
                        <a href="#" className="hover:text-brand transition-colors">Terms</a>
                        <a href="#" className="hover:text-brand transition-colors">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
