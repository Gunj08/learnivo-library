"use client";

import React from "react";
import { Book } from "@/lib/types";
import { Book as BookIcon, Star, Download, Eye } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";

export interface BookCardProps {
    book?: Book; // Optional for skeleton
    index: number;
    onSelect?: (book: Book) => void;
    onDelete?: (uid: string) => void;
    isLoading?: boolean;
}

const BookCard: React.FC<BookCardProps> = ({ book, index, onSelect, onDelete, isLoading }) => {
    const router = useRouter();
    if (isLoading || !book) {
        return (
            <div className="group relative bg-[#0a0a0a] border border-white/5 aspect-[3/4.5] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full animate-shimmer" />
                <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
                    <div className="h-2 w-3/4 bg-white/5 rounded-full" />
                    <div className="h-2 w-1/2 bg-white/5 rounded-full" />
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                delay: index * 0.05,
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
            }}
            onClick={() => {
                if (book.uid) {
                    router.push(`/book/${book.uid}`);
                } else {
                    onSelect?.(book);
                }
            }}
            className="group relative flex flex-col bg-[#070707] border border-white/5 hover:border-brand/40 transition-all duration-700 cursor-pointer overflow-hidden h-full rounded-sm"
        >
            {/* Top Right Status */}
            <div className="absolute top-3 right-3 z-30 flex flex-col gap-1.5 items-end">
                <span className="px-2 py-0.5 bg-brand text-black text-[7px] font-black uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(var(--brand-rgb),0.3)]">
                    {book.status === "approved" ? "AVAILABLE" : "PENDING"}
                </span>
                {book.board && (
                    <span className="px-2 py-0.5 bg-black/80 border border-white/10 text-white text-[7px] font-black uppercase tracking-[0.2em] backdrop-blur-md">
                        {book.board}
                    </span>
                )}
                
                {/* Delete Button */}
                {book.uid && onDelete && (
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (confirm(`Are you sure you want to delete "${book.title}"?`)) {
                                onDelete(book.uid!);
                            }
                        }}
                        className="mt-1 p-1.5 bg-black/50 hover:bg-red-500/80 border border-white/10 hover:border-red-500 text-white/70 hover:text-white rounded transition-all duration-300 backdrop-blur-md"
                        title="Delete Book"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        </svg>
                    </button>
                )}
            </div>

            {/* Cover Image Container */}
            <div className="relative aspect-[3/4.2] overflow-hidden bg-[#0d0d0d]">
                {book.cover_image ? (
                    <img
                        src={`/uploads/${book.cover_image}`}
                        alt={book.title}
                        className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 group-hover:brightness-50"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <BookIcon className="w-10 h-10 text-zinc-800 group-hover:text-brand/40 transition-colors duration-500" />
                    </div>
                )}

                {/* Glassmorphism Read Button on Hover */}
                <div className="absolute inset-x-0 bottom-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-20">
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 flex items-center justify-between group/read-btn hover:bg-brand transition-all duration-300">
                        <span className="text-[10px] font-black text-white group-hover/read-btn:text-black uppercase tracking-[0.3em]">Read Now</span>
                        <div className="w-6 h-6 bg-white/10 flex items-center justify-center group-hover/read-btn:bg-black/10">
                            <Eye className="w-3.5 h-3.5 text-white group-hover/read-btn:text-black" />
                        </div>
                    </div>
                </div>

                {/* Subtle Scanline Effect */}
                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-20 transition-opacity">
                    <div className="absolute inset-0 bg-brand/5" />
                    <motion.div
                        animate={{ top: ["0%", "100%", "0%"] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-[1px] bg-brand shadow-[0_0_10px_rgba(var(--brand-rgb),0.5)]"
                    />
                </div>
            </div>

            {/* Content section */}
            <div className="p-5 flex flex-col flex-grow bg-gradient-to-b from-[#0a0a0a] to-[#070707] border-t border-white/5">
                <div className="mb-4">
                    <h3 className="text-[11px] font-black text-white group-hover:text-brand transition-colors duration-300 uppercase leading-tight tracking-tight line-clamp-2 min-h-[2.5em]">
                        {book.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest bg-white/[0.03] px-1.5 py-0.5 border border-white/5">
                            REF: {book.uid?.split("-")[0] || "BOOK-00"}
                        </span>
                        {book.grade && (
                            <span className="text-[7px] font-black text-brand uppercase tracking-widest">
                                CLASS {book.grade}
                            </span>
                        )}
                    </div>
                </div>

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5 text-zinc-500">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                            <Download className="w-2.5 h-2.5" />
                            <span className="text-[8px] font-black tabular-nums">{book.downloads || 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Eye className="w-2.5 h-2.5" />
                            <span className="text-[8px] font-black tabular-nums">{book.views || 0}</span>
                        </div>
                    </div>
                    {book.subject && (
                        <span className="text-[8px] font-black uppercase tracking-widest text-[#444]">
                            {book.subject}
                        </span>
                    )}
                </div>
            </div>

            {/* Decorative Edge */}
            <div className="absolute top-0 right-0 w-[1px] h-0 bg-brand/40 group-hover:h-full transition-all duration-700" />
        </motion.div>
    );
};

export default BookCard;
