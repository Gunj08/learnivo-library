"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
    Book as BookIcon,
    Download,
    FileText,
    ChevronLeft,
    ExternalLink,
    ShieldCheck,
    Eye,
    Star,
    Calendar,
    Loader2,
} from "lucide-react";
import { Book } from "@/lib/types";
import Sidebar from "@/components/Sidebar";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function BookDetailPage() {
    const params = useParams();
    const router = useRouter();
    const uid = params.uid as string;

    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

    useEffect(() => {
        fetch("/api/auth/me")
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => setUser(data));

        if (uid) {
            fetch(`/api/books/uid/${uid}`)
                .then((res) => {
                    if (!res.ok) throw new Error("Book not found");
                    return res.json();
                })
                .then((data) => {
                    setBook(data);
                    setLoading(false);
                    // Increment views
                    fetch(`/api/books/${data.slug}/view`, { method: "POST" }).catch(() => { });
                })
                .catch((err) => {
                    setError(err.message);
                    setLoading(false);
                });
        }
    }, [uid]);

    const getPdfUrlFromIdOrName = (idOrName: string | null | undefined) => {
        if (!idOrName) return null;
        const lower = idOrName.toLowerCase();
        if (lower.endsWith(".pdf")) {
            return `/uploads/${idOrName}`;
        }
        // Assume this is a Google Drive file ID
        return `https://drive.google.com/file/d/${idOrName}/preview`;
    };

    const handleDownload = async () => {
        if (!book) return;
        const idOrName =
            book.file_name ||
            (book.chapters && book.chapters.length > 0
                ? book.chapters[0].file_name
                : null);
        if (!idOrName) return;

        const pdfUrl = getPdfUrlFromIdOrName(idOrName);
        if (!pdfUrl) return;

        await fetch(`/api/books/${book.slug}/download`, { method: "POST" });

        let downloadUrl = pdfUrl;
        const driveMatch = pdfUrl.match(/file\/d\/([^/]+)\/preview/);
        if (driveMatch && driveMatch[1]) {
            const fileId = driveMatch[1];
            downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
        }

        const link = document.createElement("a");
        link.href = downloadUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.click();
    };

    return (
        <div className="flex h-screen bg-[#030303] text-zinc-100 overflow-hidden font-sans relative">
            {/* Background Grid */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(#84cc16 1px, transparent 1px), linear-gradient(90deg, #84cc16 1px, transparent 1px)`,
                    backgroundSize: "60px 60px",
                }}
            />

            <Sidebar
                user={user}
                activeTab="all-library"
                onLogout={() => { }}
                isExpanded={isSidebarExpanded}
                onToggle={() => setIsSidebarExpanded(!isSidebarExpanded)}
            />

            <main
                className={cn(
                    "flex-grow bg-[#0a0a0a]/40 backdrop-blur-sm relative h-screen overflow-y-auto flex flex-col transition-all duration-300 ease-in-out border-l border-white/5",
                    isSidebarExpanded ? "ml-[240px]" : "ml-[64px]"
                )}
            >
                <div className="p-8 md:p-12 max-w-7xl mx-auto w-full pb-24">
                    {/* Back Button */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mb-10"
                    >
                        <button
                            onClick={() => router.back()}
                            className="inline-flex items-center gap-3 text-zinc-500 hover:text-white transition-colors group cursor-pointer px-4 py-2 border border-white/5 hover:border-brand/30 hover:bg-brand/5 rounded-lg"
                        >
                            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            <span className="text-xs font-bold uppercase tracking-widest">
                                Back to Library
                            </span>
                        </button>
                    </motion.div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
                            <Loader2 className="w-10 h-10 text-brand animate-spin" />
                            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">
                                Loading Book...
                            </p>
                        </div>
                    ) : error || !book ? (
                        <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
                            <BookIcon className="w-16 h-16 text-zinc-800" />
                            <div className="text-center space-y-2">
                                <h2 className="text-white font-black text-xl uppercase tracking-tight">
                                    Book Not Found
                                </h2>
                                <p className="text-zinc-600 text-sm">
                                    The book you are looking for does not exist or has been removed.
                                </p>
                            </div>
                            <Link
                                href="/library"
                                className="px-6 py-3 bg-brand text-black text-xs font-black uppercase tracking-widest hover:bg-brand/90 transition-colors rounded-lg"
                            >
                                Go to Library
                            </Link>
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            className="grid grid-cols-1 lg:grid-cols-12 gap-12"
                        >
                            {/* Left: Cover & Actions */}
                            <div className="lg:col-span-4 space-y-6">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.1 }}
                                    className="aspect-[3/4] bg-zinc-900 border border-white/10 overflow-hidden relative shadow-2xl shadow-black/50 rounded-2xl"
                                >
                                    {book.cover_image ? (
                                        <img
                                            src={`/uploads/${book.cover_image}`}
                                            alt={book.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
                                            <BookIcon className="w-24 h-24 text-zinc-700" />
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4">
                                        <span className="px-3 py-1.5 bg-brand text-black text-[9px] font-black uppercase tracking-[0.2em] rounded-md shadow-lg shadow-brand/20">
                                            Free
                                        </span>
                                    </div>
                                    {/* Gradient overlay at bottom */}
                                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
                                </motion.div>

                                {/* Action Buttons */}
                                <div className="grid grid-cols-1 gap-3">
                                    <Link
                                        href={`/book/${book.uid}/read`}
                                        className="w-full py-4 bg-brand text-black rounded-xl font-black text-sm hover:scale-[1.02] hover:shadow-lg hover:shadow-brand/30 transition-all flex items-center justify-center gap-3 cursor-pointer uppercase tracking-widest"
                                    >
                                        <FileText className="w-5 h-5" />
                                        Read Now
                                    </Link>
                                    <button
                                        onClick={handleDownload}
                                        className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-xl font-black text-sm hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-3 cursor-pointer uppercase tracking-widest"
                                    >
                                        <Download className="w-5 h-5" />
                                        Download
                                    </button>
                                </div>

                                {/* Stats Card */}
                                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-zinc-400">
                                            <Download className="w-4 h-4" />
                                            <span className="text-xs font-bold uppercase tracking-widest">Downloads</span>
                                        </div>
                                        <span className="text-white font-black tabular-nums">
                                            {(book.downloads || 0).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="w-full h-px bg-white/5" />
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-zinc-400">
                                            <Eye className="w-4 h-4" />
                                            <span className="text-xs font-bold uppercase tracking-widest">Views</span>
                                        </div>
                                        <span className="text-white font-black tabular-nums">
                                            {(book.views || 0).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="w-full h-px bg-white/5" />
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-zinc-400">
                                            <Star className="w-4 h-4" />
                                            <span className="text-xs font-bold uppercase tracking-widest">Rating</span>
                                        </div>
                                        <span className="text-white font-black tabular-nums">
                                            {book.rating > 0 ? book.rating.toFixed(1) : "N/A"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Details */}
                            <div className="lg:col-span-8 space-y-10">
                                <header className="space-y-4">
                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-2">
                                        {book.board && (
                                            <span className="px-3 py-1 bg-white/5 border border-white/10 text-zinc-400 text-[9px] font-black uppercase tracking-widest rounded-lg">
                                                {book.board}
                                            </span>
                                        )}
                                        {book.grade && (
                                            <span className="px-3 py-1 bg-white/5 border border-white/10 text-zinc-400 text-[9px] font-black uppercase tracking-widest rounded-lg">
                                                Grade {book.grade}
                                            </span>
                                        )}
                                        {book.subject && (
                                            <span className="px-3 py-1 bg-brand/10 border border-brand/20 text-brand text-[9px] font-black uppercase tracking-widest rounded-lg">
                                                {book.subject}
                                            </span>
                                        )}
                                        {book.language && (
                                            <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[9px] font-black uppercase tracking-widest rounded-lg">
                                                {book.language}
                                            </span>
                                        )}
                                        <span className={cn(
                                            "px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border",
                                            book.status === "approved"
                                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                                : "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
                                        )}>
                                            {book.status}
                                        </span>
                                    </div>

                                    <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight">
                                        {book.title}
                                    </h1>
                                    {book.subtitle && (
                                        <p className="text-xl text-zinc-500">{book.subtitle}</p>
                                    )}
                                </header>

                                {/* Metadata Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-y border-white/5">
                                    <div className="space-y-1">
                                        <span className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Author</span>
                                        <p className="font-black text-white text-sm">{book.author}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Language</span>
                                        <p className="font-black text-white text-sm">{book.language}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Published</span>
                                        <p className="font-black text-white text-sm">
                                            {new Date(book.created_at).toLocaleDateString("en-IN", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </p>
                                    </div>
                                    {book.publisher && (
                                        <div className="space-y-1">
                                            <span className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Publisher</span>
                                            <p className="font-black text-white text-sm">{book.publisher}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Description */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-black text-white uppercase tracking-wider">Description</h3>
                                    <p className="text-zinc-400 leading-relaxed whitespace-pre-wrap">
                                        {book.description || "No description provided for this book."}
                                    </p>
                                </div>

                                {/* Chapters */}
                                {book.chapters && book.chapters.length > 0 && (
                                    <section className="space-y-4">
                                        <h3 className="text-lg font-black text-white flex items-center gap-2 uppercase tracking-wider">
                                            <FileText className="w-5 h-5 text-brand" />
                                            Chapters ({book.chapters.length})
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {book.chapters.map((chapter) => (
                                                <Link
                                                    key={chapter.id}
                                                    href={`/book/${book.uid}/read?chapter=${chapter.file_name}`}
                                                    className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/5 hover:border-brand/30 transition-all text-left group cursor-pointer"
                                                >
                                                    <div className="w-10 h-10 bg-brand/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-brand group-hover:text-black transition-colors">
                                                        <span className="text-xs font-black">
                                                            {chapter.order_index + 1}
                                                        </span>
                                                    </div>
                                                    <div className="flex-grow">
                                                        <p className="text-sm font-black text-white line-clamp-1">
                                                            {chapter.title}
                                                        </p>
                                                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">Read Chapter</p>
                                                    </div>
                                                    <ExternalLink className="w-4 h-4 text-zinc-600 group-hover:text-brand transition-colors flex-shrink-0" />
                                                </Link>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Tags */}
                                {book.tags && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-black text-white uppercase tracking-wider">Tags</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {book.tags.split(",").map((tag, i) => (
                                                <span
                                                    key={i}
                                                    className="px-3 py-1.5 bg-white/5 border border-white/5 text-zinc-400 text-xs font-bold rounded-lg"
                                                >
                                                    {tag.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* API Access */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-black text-white uppercase tracking-wider">API Access</h3>
                                    <div className="bg-black/40 rounded-2xl p-5 border border-white/5 font-mono text-sm space-y-3">
                                        <p className="text-zinc-500 text-[10px] uppercase tracking-widest">Book Endpoint</p>
                                        <div className="bg-black/50 p-3 rounded-xl text-brand break-all text-sm">
                                            GET /api/external/books?q={book.slug}
                                        </div>
                                        <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                            <p className="text-zinc-500 text-xs">Response format: JSON</p>
                                            <span className="text-[10px] text-zinc-600 uppercase tracking-widest">v1</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </main>
        </div>
    );
}
