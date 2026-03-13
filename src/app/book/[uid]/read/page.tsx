"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
    ChevronLeft,
    BookOpen,
    Download,
    Maximize2,
    Minimize2,
    Menu,
    X,
    FileText,
    Loader2,
    ChevronRight,
    BookMarked,
} from "lucide-react";
import { Book } from "@/lib/types";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function BookReadPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const uid = params.uid as string;

    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(true);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeChapter, setActiveChapter] = useState<string | null>(null);
    const [pdfLoading, setPdfLoading] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);

    const getPdfUrlFromIdOrName = (idOrName: string | null | undefined) => {
        if (!idOrName) return null;
        const lower = idOrName.toLowerCase();
        if (lower.endsWith(".pdf")) {
            return `/uploads/${idOrName}`;
        }
        // Assume this is a Google Drive file ID
        return `https://drive.google.com/file/d/${idOrName}/preview`;
    };

    useEffect(() => {
        if (!uid) return;

        fetch(`/api/books/uid/${uid}`)
            .then((res) => {
                if (!res.ok) throw new Error("Book not found");
                return res.json();
            })
            .then((data: Book) => {
                setBook(data);
                setLoading(false);

                // Determine which PDF to load
                const chapterParam = searchParams.get("chapter");
                if (chapterParam) {
                    setPdfUrl(getPdfUrlFromIdOrName(chapterParam));
                    setActiveChapter(chapterParam);
                } else if (data.file_name) {
                    setPdfUrl(getPdfUrlFromIdOrName(data.file_name));
                } else if (data.chapters && data.chapters.length > 0) {
                    const firstChapter = data.chapters[0];
                    setPdfUrl(getPdfUrlFromIdOrName(firstChapter.file_name));
                    setActiveChapter(firstChapter.file_name);
                }
            })
            .catch(() => setLoading(false));
    }, [uid, searchParams]);

    const handleChapterSelect = (fileName: string) => {
        setPdfUrl(getPdfUrlFromIdOrName(fileName));
        setActiveChapter(fileName);
        setPdfLoading(true);
        setIsSidebarOpen(false);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }, []);

    const handleDownload = async () => {
        if (!book || !pdfUrl) return;
        if (book.slug) {
            await fetch(`/api/books/${book.slug}/download`, { method: "POST" }).catch(() => { });
        }

        let downloadUrl = pdfUrl;
        // If this is a Google Drive preview URL, convert to direct download
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

    if (loading) {
        return (
            <div className="flex h-screen bg-[#030303] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-brand animate-spin" />
                    <p className="text-zinc-500 text-xs font-black uppercase tracking-widest">
                        Loading Reader...
                    </p>
                </div>
            </div>
        );
    }

    if (!book) {
        return (
            <div className="flex h-screen bg-[#030303] items-center justify-center flex-col gap-6">
                <BookOpen className="w-16 h-16 text-zinc-800" />
                <h2 className="text-white font-black text-xl">Book not found</h2>
                <Link href="/library" className="px-6 py-3 bg-brand text-black font-black text-xs uppercase tracking-widest rounded-lg">
                    Back to Library
                </Link>
            </div>
        );
    }

    const hasChapters = book.chapters && book.chapters.length > 0;

    return (
        <div
            ref={containerRef}
            className="flex flex-col h-screen bg-[#030303] text-white overflow-hidden"
        >
            {/* ── Top Bar ── */}
            <div className="flex items-center justify-between px-4 md:px-6 py-3 bg-[#0a0a0a] border-b border-white/5 z-30 flex-shrink-0">
                {/* Left */}
                <div className="flex items-center gap-3 min-w-0">
                    <button
                        onClick={() => router.push(`/book/${uid}`)}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors group flex-shrink-0"
                        title="Back to details"
                    >
                        <ChevronLeft className="w-4 h-4 text-zinc-400 group-hover:text-white group-hover:-translate-x-0.5 transition-all" />
                    </button>
                    <div className="w-px h-6 bg-white/10 flex-shrink-0" />
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 bg-brand/10 border border-brand/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <BookMarked className="w-3.5 h-3.5 text-brand" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-black text-white truncate max-w-[200px] md:max-w-sm leading-none">
                                {book.title}
                            </p>
                            {activeChapter && hasChapters && (
                                <p className="text-[10px] text-zinc-500 mt-0.5 truncate max-w-[180px] md:max-w-xs">
                                    {book.chapters?.find((c) => c.file_name === activeChapter)?.title || "Chapter"}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                    {/* Chapter Nav (only if chapters exist) */}
                    {hasChapters && (
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                isSidebarOpen
                                    ? "bg-brand text-black"
                                    : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                            )}
                        >
                            <Menu className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Chapters</span>
                        </button>
                    )}

                    <button
                        onClick={handleDownload}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors text-zinc-400 hover:text-white"
                        title="Download PDF"
                    >
                        <Download className="w-4 h-4" />
                    </button>

                    <button
                        onClick={toggleFullscreen}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors text-zinc-400 hover:text-white"
                        title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                    >
                        {isFullscreen ? (
                            <Minimize2 className="w-4 h-4" />
                        ) : (
                            <Maximize2 className="w-4 h-4" />
                        )}
                    </button>
                </div>
            </div>

            {/* ── Main Area: Sidebar + PDF ── */}
            <div className="flex flex-1 overflow-hidden relative">
                {/* Chapter Sidebar */}
                <AnimatePresence>
                    {isSidebarOpen && hasChapters && (
                        <motion.aside
                            initial={{ x: -280, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -280, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="absolute left-0 top-0 bottom-0 w-72 bg-[#0a0a0a] border-r border-white/5 z-20 overflow-y-auto flex flex-col"
                        >
                            {/* Sidebar Header */}
                            <div className="flex items-center justify-between p-5 border-b border-white/5 sticky top-0 bg-[#0a0a0a] z-10">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-brand" />
                                    <h3 className="text-xs font-black uppercase tracking-widest text-white">
                                        Chapters ({book.chapters?.length})
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setIsSidebarOpen(false)}
                                    className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    <X className="w-3.5 h-3.5 text-zinc-500" />
                                </button>
                            </div>

                            {/* Chapter List */}
                            <div className="p-3 flex-1 space-y-1">
                                {book.chapters?.map((chapter) => (
                                    <button
                                        key={chapter.id}
                                        onClick={() => handleChapterSelect(chapter.file_name)}
                                        className={cn(
                                            "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all group cursor-pointer",
                                            activeChapter === chapter.file_name
                                                ? "bg-brand/10 border border-brand/30 text-brand"
                                                : "hover:bg-white/5 border border-transparent text-zinc-400 hover:text-white"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-black transition-colors",
                                            activeChapter === chapter.file_name
                                                ? "bg-brand text-black"
                                                : "bg-white/5 group-hover:bg-brand/20 group-hover:text-brand"
                                        )}>
                                            {chapter.order_index + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-black line-clamp-2 leading-tight">
                                                {chapter.title}
                                            </p>
                                        </div>
                                        {activeChapter === chapter.file_name && (
                                            <ChevronRight className="w-3 h-3 flex-shrink-0" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>

                {/* PDF Viewer Area */}
                <div className="flex-1 relative bg-[#111] overflow-hidden">
                    {/* Background pattern */}
                    <div
                        className="absolute inset-0 opacity-[0.02] pointer-events-none"
                        style={{
                            backgroundImage: `radial-gradient(circle, #84cc16 1px, transparent 1px)`,
                            backgroundSize: "30px 30px",
                        }}
                    />

                    {pdfUrl ? (
                        <>
                            {pdfLoading && (
                                <motion.div
                                    initial={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-[#111]"
                                >
                                    <Loader2 className="w-8 h-8 text-brand animate-spin mb-4" />
                                    <p className="text-zinc-500 text-xs font-black uppercase tracking-widest">
                                        Loading PDF...
                                    </p>
                                </motion.div>
                            )}
                            <iframe
                                key={pdfUrl}
                                src={`${pdfUrl}#toolbar=1&navpanes=0&view=FitH`}
                                className="w-full h-full border-none relative z-0"
                                title={book.title}
                                onLoad={() => setPdfLoading(false)}
                                allow="fullscreen"
                            />
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full gap-6 px-6 text-center">
                            <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
                                <BookOpen className="w-10 h-10 text-zinc-700" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-white font-black text-xl">No PDF Available</h3>
                                <p className="text-zinc-500 text-sm max-w-sm">
                                    This book does not have a PDF file attached. Please contact the administrator.
                                </p>
                            </div>
                            <button
                                onClick={() => router.push(`/book/${uid}`)}
                                className="px-6 py-3 bg-brand text-black font-black text-xs uppercase tracking-widest rounded-xl hover:bg-brand/90 transition-colors"
                            >
                                Back to Book Details
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Bottom Status Bar ── */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#0a0a0a] border-t border-white/5 flex-shrink-0">
                <div className="flex items-center gap-3 text-[9px] text-zinc-600 font-black uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 bg-brand rounded-full animate-pulse" />
                    <span>Reading Mode</span>
                    {book.author && (
                        <>
                            <span className="text-zinc-800">·</span>
                            <span>{book.author}</span>
                        </>
                    )}
                </div>
                <div className="flex items-center gap-2 text-[9px] text-zinc-700 font-black uppercase tracking-widest">
                    <span>Learnivo Library</span>
                </div>
            </div>
        </div>
    );
}
