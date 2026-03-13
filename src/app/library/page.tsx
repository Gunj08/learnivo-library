"use client";

import { useState, useEffect } from "react";
import {
    Search,
    Filter,
    Library as LibraryIcon,
    LayoutGrid,
    BookOpen,
    ChevronRight,
    ArrowLeft,
    SlidersHorizontal,
    Star,
    Clock,
    TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Book } from "@/lib/types";
import BookCard from "@/components/BookCard";
import { cn } from "@/lib/utils";
import Sidebar from "../../components/Sidebar";

export default function LibraryPage() {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [user, setUser] = useState<any>(null);
    const [activeCategory, setActiveCategory] = useState("ALL BOOKS");
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

    useEffect(() => {
        // Fetch user for sidebar
        fetch("/api/auth/me")
            .then(res => res.ok ? res.json() : null)
            .then(data => setUser(data));

        fetchBooks();
    }, []);

    const fetchBooks = () => {
        setLoading(true);
        fetch("/api/books")
            .then(res => res.json())
            .then(data => {
                setBooks(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    const handleDeleteBook = async (uid: string) => {
        try {
            const res = await fetch(`/api/books/uid/${uid}`, {
                method: "DELETE",
            });
            
            if (res.ok) {
                // Remove from local state
                setBooks(prevBooks => prevBooks.filter(book => book.uid !== uid));
            } else {
                const data = await res.json();
                alert(`Failed to delete book: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error("Error deleting book:", error);
            alert("An error occurred while deleting the book.");
        }
    };


    const categories = ["ALL BOOKS", "SCIENCE", "MATHEMATICS", "HISTORY", "TECH"];

    const SkeletonCard = () => (
        <div className="aspect-[3/4] bg-white/[0.01] border border-white/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent -translate-y-full animate-shimmer" />
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/10" />
            <div className="p-4 space-y-4 h-full flex flex-col justify-end">
                <div className="w-3/4 h-2 bg-white/5" />
                <div className="w-1/2 h-2 bg-white/5" />
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-[#030303] text-zinc-100 overflow-hidden font-sans relative">
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: `linear-gradient(#84cc16 1px, transparent 1px), linear-gradient(90deg, #84cc16 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />

            <Sidebar
                user={user}
                activeTab="all-library"
                onLogout={() => { }}
                isExpanded={isSidebarExpanded}
                onToggle={() => setIsSidebarExpanded(!isSidebarExpanded)}
            />

            <main className={cn(
                "flex-grow bg-[#0a0a0a]/40 backdrop-blur-sm relative h-screen overflow-hidden flex flex-col transition-all duration-300 ease-in-out border-l border-white/5",
                isSidebarExpanded ? "ml-[240px]" : "ml-[64px]"
            )}>
                {/* Header Area */}
                <div className="p-10 pb-4">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand/10 border-l-2 border-brand text-brand text-[8px] font-black uppercase tracking-[0.3em]">
                                Digital Repository
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none uppercase">
                                Library <span className="text-zinc-700">Explore.</span>
                            </h1>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-brand/20 blur opacity-0 group-focus-within:opacity-100 transition-opacity" />
                                <div className="relative flex items-center bg-[#0d0d0d] border border-white/10 p-1">
                                    <Search className="w-3.5 h-3.5 text-zinc-600 ml-4 group-focus-within:text-brand transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Search title, author, or subject..."
                                        className="bg-transparent border-none text-white px-5 py-4 text-[10px] font-black uppercase tracking-widest placeholder:text-zinc-800 outline-none w-[320px]"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                    <button className="bg-brand text-black font-black text-[8px] uppercase tracking-[0.2em] px-8 py-4 hover:bg-brand/90 transition-all cursor-pointer">
                                        Search
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filter Bar */}
                    <div className="flex items-center gap-1 overflow-x-auto pb-4 custom-scrollbar no-scrollbar border-b border-white/[0.03]">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={cn(
                                    "px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                    activeCategory === cat
                                        ? "bg-white/10 text-brand border border-white/10"
                                        : "text-zinc-600 hover:text-white hover:bg-white/[0.02]"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-grow overflow-y-auto p-10 pt-4 custom-scrollbar">
                    {/* Trending Grid */}
                    <div className="mb-20">
                        <div className="flex items-end justify-between border-b border-white/[0.03] pb-6 mb-10">
                            <div className="space-y-1">
                                <p className="text-brand text-[8px] font-black uppercase tracking-[0.4em]">Popular</p>
                                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Recommended</h2>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {loading ? (
                                [1, 2, 3, 4].map(i => <SkeletonCard key={i} />)
                            ) : (
                                books.slice(0, 4).map((book, i) => (
                                <BookCard key={book.id} book={book} index={i} onSelect={() => { }} onDelete={handleDeleteBook} />
                                ))
                            )}
                        </div>
                    </div>

                    {/* All Books Grid */}
                    <div className="pb-20">
                        <div className="flex items-end justify-between border-b border-white/[0.03] pb-6 mb-10">
                            <div className="space-y-1">
                                <p className="text-blue-400 text-[8px] font-black uppercase tracking-[0.4em]">Collection</p>
                                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">All Resources</h2>
                            </div>
                            <div className="flex items-center gap-4 text-[8px] text-zinc-600 font-black uppercase tracking-widest">
                                <span>Sort by:</span>
                                <select className="bg-transparent border-none focus:ring-0 text-white cursor-pointer outline-none font-black">
                                    <option className="bg-zinc-900">Recently Added</option>
                                    <option className="bg-zinc-900">Alphabetical (A-Z)</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {loading ? (
                                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => <SkeletonCard key={i} />)
                            ) : books.length > 0 ? (
                                books.map((book, i) => (
                                    <BookCard key={book.id} book={book} index={i} onSelect={() => { }} onDelete={handleDeleteBook} />
                                ))
                            ) : (
                                <div className="col-span-full py-40 text-center border border-white/[0.03] bg-[#0a0a0a]/30 relative overflow-hidden group">
                                    <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-brand/20" />
                                    <div className="relative z-10 flex flex-col items-center gap-6">
                                        <Search className="w-8 h-8 text-zinc-900" />
                                        <div className="space-y-2">
                                            <h3 className="text-white font-black text-[10px] uppercase tracking-widest">No Books Found</h3>
                                            <p className="text-zinc-700 font-bold text-[8px] uppercase tracking-[0.3em] max-w-xs mx-auto">We couldn't find any books matching your criteria.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
