"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    Book as BookIcon,
    Download,
    Star,
    Calendar,
    FileText,
    ChevronLeft,
    ExternalLink,
    ShieldCheck,
    Eye,
    X,
} from "lucide-react";
import { Book } from "@/lib/types";

interface BookDetailProps {
    book: Book;
    onBack: () => void;
}

export default function BookDetail({ book, onBack }: BookDetailProps) {
    const handleDownload = async () => {
        const fileName =
            book.file_name ||
            (book.chapters && book.chapters.length > 0
                ? book.chapters[0].file_name
                : null);
        if (!fileName) return;

        await fetch(`/api/books/${book.slug}/download`, { method: "POST" });
        const link = document.createElement("a");
        link.href = `/uploads/${fileName}`;
        link.download = fileName;
        link.click();
    };

    const handleRead = () => {
        const fileName =
            book.file_name ||
            (book.chapters && book.chapters.length > 0
                ? book.chapters[0].file_name
                : null);
        if (fileName) {
            window.open(`/uploads/${fileName}`, "_blank");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <button
                onClick={onBack}
                className="inline-flex items-center gap-2 text-zinc-500 hover:text-white mb-8 transition-colors group cursor-pointer"
            >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-bold">Back to Library</span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left: Cover & Actions */}
                <div className="lg:col-span-4 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="aspect-[3/4] glass rounded-[32px] overflow-hidden relative shadow-2xl shadow-black/50"
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
                        <div className="absolute top-6 right-6">
                            <span className="px-3 py-1.5 bg-brand text-black label-mono rounded-xl shadow-lg shadow-brand/20">
                                Free
                            </span>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 gap-4">
                        <button
                            onClick={handleRead}
                            className="w-full py-5 bg-brand text-black rounded-2xl font-bold text-lg hover:scale-[1.02] transition-transform shadow-lg shadow-brand/20 flex items-center justify-center gap-3 cursor-pointer"
                        >
                            <FileText className="w-6 h-6" />
                            Read Now
                        </button>
                    </div>
                </div>

                {/* Right: Details */}
                <div className="lg:col-span-8 space-y-12">
                    <header>
                        <div className="flex flex-wrap gap-2 mb-6">
                            {book.board && (
                                <span className="px-3 py-1 bg-white/5 border border-white/10 text-zinc-400 label-mono rounded-lg">
                                    {book.board}
                                </span>
                            )}
                            {book.grade && (
                                <span className="px-3 py-1 bg-white/5 border border-white/10 text-zinc-400 label-mono rounded-lg">
                                    Grade {book.grade}
                                </span>
                            )}
                            {book.subject && (
                                <span className="px-3 py-1 bg-brand/10 border border-brand/20 text-brand label-mono rounded-lg">
                                    {book.subject}
                                </span>
                            )}
                            {book.language && (
                                <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 label-mono rounded-lg">
                                    {book.language}
                                </span>
                            )}
                        </div>
                        <h1 className="heading-display text-4xl md:text-6xl text-white mb-4 leading-tight">
                            {book.title}
                        </h1>
                        {book.subtitle && (
                            <p className="text-2xl text-zinc-500 mb-6">{book.subtitle}</p>
                        )}
                        <div className="flex items-center gap-6 text-zinc-400">
                            <div className="flex items-center gap-2">
                                <Download className="w-5 h-5" />
                                <span className="font-bold text-white">
                                    {(book.downloads || 0).toLocaleString()}
                                </span>
                                <span className="text-sm">downloads</span>
                            </div>
                            <div className="w-1 h-1 bg-zinc-700 rounded-full" />
                            <div className="flex items-center gap-2">
                                <Eye className="w-5 h-5" />
                                <span className="font-bold text-white">
                                    {(book.views || 0).toLocaleString()}
                                </span>
                                <span className="text-sm">views</span>
                            </div>
                        </div>
                    </header>

                    {/* Chapters */}
                    {book.chapters && book.chapters.length > 0 && (
                        <section className="space-y-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <FileText className="w-5 h-5 text-brand" />
                                Chapters ({book.chapters.length})
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {book.chapters.map((chapter) => (
                                    <button
                                        key={chapter.id}
                                        onClick={() =>
                                            window.open(`/uploads/${chapter.file_name}`, "_blank")
                                        }
                                        className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-brand/30 transition-all text-left group cursor-pointer"
                                    >
                                        <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-brand group-hover:text-black transition-colors">
                                            <span className="text-xs font-bold">
                                                {chapter.order_index + 1}
                                            </span>
                                        </div>
                                        <div className="flex-grow">
                                            <p className="text-sm font-bold text-white line-clamp-1">
                                                {chapter.title}
                                            </p>
                                            <p className="text-[10px] text-zinc-500">Read Chapter</p>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-zinc-600 group-hover:text-brand transition-colors" />
                                    </button>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-y border-white/5">
                        <div className="space-y-1">
                            <span className="label-mono text-zinc-600">Author</span>
                            <p className="font-bold text-white">{book.author}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="label-mono text-zinc-600">Language</span>
                            <p className="font-bold text-white">{book.language}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="label-mono text-zinc-600">Published</span>
                            <p className="font-bold text-white">
                                {new Date(book.created_at).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <span className="label-mono text-zinc-600">Status</span>
                            <div className="flex items-center gap-2 text-emerald-500">
                                <ShieldCheck className="w-4 h-4" />
                                <p className="font-bold uppercase text-[10px]">
                                    {book.status}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-white">Description</h3>
                        <p className="text-zinc-400 text-lg leading-relaxed whitespace-pre-wrap">
                            {book.description || "No description provided for this book."}
                        </p>
                    </div>

                    {/* Tags */}
                    {book.tags && (
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-white">Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {book.tags.split(",").map((tag, i) => (
                                    <span
                                        key={i}
                                        className="px-3 py-1.5 bg-white/5 border border-white/5 text-zinc-400 text-xs font-bold rounded-xl"
                                    >
                                        {tag.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* API Access */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-white">API Access</h3>
                        <div className="bg-black/40 rounded-3xl p-6 border border-white/5 font-mono text-sm space-y-4">
                            <div>
                                <p className="text-zinc-500 mb-2 text-[10px] uppercase tracking-widest">
                                    Book Endpoint
                                </p>
                                <div className="bg-black/50 p-3 rounded-xl text-brand break-all">
                                    GET /api/external/books?q={book.slug}
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <p className="text-zinc-500 text-xs">Response format: JSON</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
