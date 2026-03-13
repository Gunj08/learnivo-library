"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Filter, Book as BookIcon, ChevronRight, X, ArrowUp, Plus, Sparkles } from "lucide-react";
import { Book } from "@/lib/types";
import BookCard from "@/components/BookCard";
import BookDetail from "@/components/BookDetail";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export interface HomeProps {
    user: any;
    initialSelectedUid?: string | null;
    onClearSelection?: () => void;
    onSwitchTab?: (tab: any) => void;
}

export default function Home({ user, initialSelectedUid, onClearSelection, onSwitchTab }: HomeProps) {
    const router = useRouter();
    const [books, setBooks] = useState<Book[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [activeHomeTab, setActiveHomeTab] = useState("all");
    const [filters, setFilters] = useState({
        board: "",
        grade: "",
        subject: "",
    });
    const [availableFilters, setAvailableFilters] = useState({
        boards: [] as string[],
        grades: [] as string[],
        subjects: [] as string[],
    });

    const fetchFilters = () => {
        fetch("/api/filters")
            .then((res) => res.json())
            .then((data) => {
                if (!data.error) {
                    setAvailableFilters(data);
                }
            })
            .catch((err) => console.error("Error fetching filters:", err));
    };

    const fetchBooks = () => {
        const params = new URLSearchParams();
        if (search) params.append("q", search);
        if (filters.board) params.append("board", filters.board);
        if (filters.grade) params.append("grade", filters.grade);
        if (filters.subject) params.append("subject", filters.subject);

        setLoading(true);
        fetch(`/api/books?${params.toString()}`)
            .then((res) => res.ok ? res.json() : [])
            .then((data) => {
                if (Array.isArray(data)) {
                    setBooks(data);

                    // Check for initial selection
                    if (initialSelectedUid) {
                        const book = data.find((b: Book) => b.uid === initialSelectedUid);
                        if (book) handleSelectBook(book);
                    }
                } else {
                    setBooks([]);
                }
                setLoading(false);
            })
            .catch(() => {
                setBooks([]);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchFilters();
        fetchBooks();
    }, [search, filters]);

    useEffect(() => {
        if (initialSelectedUid && books.length > 0) {
            const book = books.find((b: Book) => b.uid === initialSelectedUid);
            if (book) handleSelectBook(book);
        }
    }, [initialSelectedUid]);

    const handleSelectBook = async (book: Book) => {
        try {
            const res = await fetch(`/api/books/${book.slug}`);
            if (res.ok) {
                const fullBook = await res.json();
                setSelectedBook(fullBook);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteBook = async (uid: string) => {
        try {
            const res = await fetch(`/api/books/uid/${uid}`, {
                method: "DELETE",
            });

            if (res.ok) {
                // Remove from local state
                setBooks(prevBooks => prevBooks.filter(book => book.uid !== uid));
                if (selectedBook?.uid === uid) {
                    setSelectedBook(null);
                }
            } else {
                const data = await res.json();
                alert(`Failed to delete book: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error("Error deleting book:", error);
            alert("An error occurred while deleting the book.");
        }
    };


    if (selectedBook) {
        return (
            <div className="p-8 md:p-12 h-screen overflow-y-auto custom-scrollbar relative">
                <BookDetail
                    book={selectedBook}
                    onBack={() => {
                        setSelectedBook(null);
                        onClearSelection?.();
                        fetchBooks();
                    }}
                />
            </div>
        );
    }

    const hasActiveFilters = filters.board || filters.grade || filters.subject;

    return (
        <div className="flex flex-col h-full overflow-y-auto custom-scrollbar relative">
            {/* Centerpiece Hero Section - Industrial Style */}
            <div className="flex-shrink-0 flex flex-col items-center justify-center px-8 h-[calc(100vh-200px)] text-center relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                    className="max-w-4xl w-full space-y-12"
                >
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand/10 border-l-2 border-brand text-brand text-[8px] font-black uppercase tracking-[0.3em] mx-auto">
                            Library Initialized
                        </div>
                        <h1 className="text-5xl md:text-[80px] font-black text-white tracking-tighter leading-none">
                            Welcome, <span className="text-zinc-700">{user?.username?.split(' ')[0] || 'User'}.</span>
                        </h1>
                        <p className="text-zinc-500 font-bold text-sm max-w-xl mx-auto uppercase tracking-wide">
                            Explore our collection of curated academic books and study materials.
                        </p>
                    </div>

                    {/* Industrial Search Bar */}
                    <div className="max-w-2xl mx-auto w-full group">
                        <div className="relative bg-[#0a0a0a] border border-white/5 p-1">
                            <div className="bg-[#0d0d0d] border border-white/10 p-1.5 flex items-center relative overflow-hidden">
                                {/* Corner accents */}
                                <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-brand/40" />
                                <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-brand/40" />

                                <Search className="w-4 h-4 text-zinc-700 ml-4 group-focus-within:text-brand transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search for books, authors, or subjects..."
                                    className="flex-grow bg-transparent border-none focus:ring-0 text-white px-5 py-4 text-[10px] font-black uppercase tracking-widest placeholder:text-zinc-800 outline-none"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                <button className="bg-brand text-black font-black text-[10px] uppercase tracking-[0.2em] px-10 py-4 hover:bg-brand/90 transition-all cursor-pointer">
                                    Search
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Quick Filters - Boxy Style */}
                    <div className="flex flex-wrap items-center justify-center gap-1">
                        {availableFilters.subjects.slice(0, 6).map(sub => (
                            <button
                                key={sub}
                                onClick={() => setFilters(f => ({ ...f, subject: f.subject === sub ? "" : sub }))}
                                className={cn(
                                    "px-4 py-2 border text-[8px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer",
                                    filters.subject === sub
                                        ? "bg-brand border-brand text-black"
                                        : "bg-[#0a0a0a] border-white/5 text-zinc-600 hover:border-white/20 hover:text-zinc-300"
                                )}
                            >
                                {sub}
                            </button>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Bottom Content Area (The "Data Grid") */}
            <div className="mt-auto px-1 mx-2">
                <div className="bg-[#050505] border border-white/5 shadow-2xl min-h-[600px] flex flex-col relative">
                    {/* Header Panel - Industrial */}
                    <div className="px-10 py-6 border-b border-white/5 flex items-center justify-between bg-[#0a0a0a]/50">
                        <div className="flex gap-1">
                            {[
                                { id: "all", label: "All Books" },
                                { id: "recent", label: "Recently Read" },
                                { id: "favorite", label: "Favorites" }
                            ].map((btn) => (
                                <button
                                    key={btn.id}
                                    onClick={() => setActiveHomeTab(btn.id)}
                                    className={cn(
                                        "px-5 py-2.5 text-[8px] font-black uppercase tracking-widest transition-all",
                                        activeHomeTab === btn.id
                                            ? "bg-white/10 text-brand border border-white/10"
                                            : "text-zinc-600 hover:text-zinc-300"
                                    )}
                                >
                                    {btn.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-10">
                            <div className="text-right hidden sm:block">
                                <span className="block text-[8px] font-black text-zinc-700 uppercase tracking-[0.3em] mb-1">Library Status</span>
                                <div className="flex items-center gap-2 justify-end">
                                    <div className="w-1 h-1 bg-brand" />
                                    <span className="text-[10px] font-black text-white uppercase tracking-tighter">{books.length} Books Available</span>
                                </div>
                            </div>
                            <button
                                onClick={() => router.push('/upload')}
                                className="group flex items-center gap-3 px-6 py-2.5 text-[8px] font-black text-zinc-500 hover:text-white transition-all cursor-pointer bg-white/5 border border-white/5"
                            >
                                Contribute
                                <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {/* Book Grid Area */}
                    <div className="flex-grow p-10">
                        <div className="flex items-center justify-between mb-10 border-b border-white/[0.03] pb-6">
                            <div className="space-y-1">
                                <p className="text-brand text-[8px] font-black uppercase tracking-[0.4em]">Collection</p>
                                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
                                    {search || hasActiveFilters ? "Search Results" : "Library Catalog"}
                                </h2>
                            </div>
                            {(search || hasActiveFilters) && (
                                <button
                                    onClick={() => {
                                        setSearch("");
                                        setFilters({ board: "", grade: "", subject: "" });
                                    }}
                                    className="px-6 py-2.5 bg-white/5 border border-white/10 text-[8px] font-black text-zinc-400 hover:text-white transition-all flex items-center gap-2 uppercase tracking-widest"
                                >
                                    <X className="w-3 h-3" />
                                    Clear Search
                                </button>
                            )}
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                    <div key={i} className="aspect-[3/4] bg-white/[0.01] border border-white/5 animate-pulse" />
                                ))}
                            </div>
                        ) : books.length > 0 ? (
                            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                {books.map((book, i) => (
                                    <div key={book.id} className="relative group">
                                        <BookCard book={book} index={i} onSelect={handleSelectBook} onDelete={handleDeleteBook} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-32 text-center border border-white/[0.03] bg-[#0a0a0a]/30 relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-brand/20" />
                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-brand/20" />

                                <div className="relative z-10 flex flex-col items-center gap-6">
                                    <div className="w-16 h-16 bg-white/[0.02] border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                        <Search className="w-6 h-6 text-zinc-800" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-white font-black text-sm uppercase tracking-tighter">No Books Found</h3>
                                        <p className="text-zinc-700 font-bold text-[8px] uppercase tracking-[0.3em] max-w-xs mx-auto leading-relaxed">
                                            We couldn't find any books matching your search.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => { setSearch(""); setFilters({ board: "", grade: "", subject: "" }); }}
                                        className="px-8 py-3 bg-white/5 border border-white/10 text-[8px] font-black uppercase tracking-widest hover:bg-white/10 transition-all cursor-pointer"
                                    >
                                        Reset Search
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
