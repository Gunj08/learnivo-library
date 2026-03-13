"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    Upload as UploadIcon,
    FileText,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    ChevronLeft,
    Sparkles,
    Image as ImageIcon,
    X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadProps {
    onSuccess?: (book: any) => void;
}

export default function Upload({ onSuccess }: UploadProps) {
    const [step, setStep] = useState(1);
    const [file, setFile] = useState<File | null>(null);
    const [lastUploadedBook, setLastUploadedBook] = useState<any>(null);
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [chapters, setChapters] = useState<
        { file: File; title: string; isAnalyzing: boolean }[]
    >([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [scanResult, setScanResult] = useState<{ ocrText?: string; confidence?: number } | null>(null);
    const [showOcrText, setShowOcrText] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        subtitle: "",
        author: "",
        publisher: "",
        description: "",
        board: "CBSE",
        grade: "10",
        subject: "Physics",
        language: "English",
        tags: "",
    });
    const [status, setStatus] = useState<
        "idle" | "uploading" | "success" | "error"
    >("idle");
    const [errorMsg, setErrorMsg] = useState<string>("");

    // --- Draft Saving (Local Storage) ---
    React.useEffect(() => {
        const draft = localStorage.getItem("upload_draft");
        if (draft) {
            try {
                const parsedDraft = JSON.parse(draft);
                setFormData(prev => ({ ...prev, ...parsedDraft.formData }));
                if (parsedDraft.chaptersCount > 0) {
                    // We can't restore files from localStorage, but we can restore placeholders
                    setChapters(new Array(parsedDraft.chaptersCount).fill(null).map((_, i) => ({
                        file: new File([], `chapter-${i + 1}.pdf`),
                        title: parsedDraft.chapterTitles[i] || `Chapter ${i + 1}`,
                        isAnalyzing: false
                    })));
                }
            } catch (e) { }
        }
    }, []);

    React.useEffect(() => {
        localStorage.setItem("upload_draft", JSON.stringify({
            formData,
            chaptersCount: chapters.length,
            chapterTitles: chapters.map(c => c.title)
        }));
    }, [formData, chapters]);

    const boards = ["CBSE", "ICSE", "State Board", "University"];
    const grades = ["9", "10", "11", "12", "UG", "PG"];
    const subjects = [
        "Physics",
        "Mathematics",
        "Chemistry",
        "Biology",
        "English",
        "Hindi",
    ];
    const languages = [
        "English",
        "Hindi",
        "Tamil",
        "Telugu",
        "Marathi",
        "Bengali",
        "Kannada",
        "Malayalam",
        "Punjabi",
        "Gujarati",
        "Odia",
    ];

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCoverImage(file);
            setScanResult(null);
        }
    };

    // ─── OCR Smart Scan ─────────────────────────────────────
    const handleSmartScan = async () => {
        if (!coverImage) return;
        setIsAnalyzing(true);
        setScanResult(null);

        try {
            // Convert image to base64
            const reader = new FileReader();
            const base64 = await new Promise<string>((resolve) => {
                reader.onload = () => {
                    const result = reader.result as string;
                    resolve(result.split(",")[1]); // remove data:image/...;base64,
                };
                reader.readAsDataURL(coverImage);
            });

            const res = await fetch("/api/ai/scan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ imageBase64: base64, mimeType: coverImage.type }),
            });

            if (res.ok) {
                const data = await res.json();
                const { _debug, ...parsed } = data;
                setScanResult({
                    ocrText: _debug?.ocrText || "",
                    confidence: _debug?.confidence || 0,
                });

                // Auto-fill form details
                setFormData(prev => ({
                    ...prev,
                    title: parsed.title || prev.title,
                    subtitle: parsed.subtitle || prev.subtitle,
                    author: parsed.author || prev.author,
                    publisher: parsed.publisher || prev.publisher,
                    description: parsed.description || prev.description,
                    board: parsed.board || prev.board,
                    grade: parsed.grade || prev.grade,
                    subject: parsed.subject || prev.subject,
                    language: parsed.language || prev.language,
                }));

                setScanResult({
                    ocrText: _debug?.ocrText || "",
                    confidence: _debug?.confidence || 0,
                });
            } else {
                const err = await res.json();
                alert("Scan failed: " + (err.error || "Unknown error"));
            }
        } catch (error) {
            console.error("Smart Scan error:", error);
            alert("Scan failed. Please try again.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleChaptersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []) as File[];
        if (files.length > 0) {
            const newChapters = files.map((file) => ({
                file,
                title: file.name.replace(".pdf", ""),
                isAnalyzing: false,
            }));
            setChapters((prev) => [...prev, ...newChapters]);
        }
    };

    const updateChapterTitle = (index: number, title: string) => {
        setChapters((prev) =>
            prev.map((c, i) => (i === index ? { ...c, title } : c))
        );
    };

    const moveChapter = (index: number, direction: 'up' | 'down') => {
        setChapters((prev) => {
            const nextIndex = direction === 'up' ? index - 1 : index + 1;
            if (nextIndex < 0 || nextIndex >= prev.length) return prev;
            const newArray = [...prev];
            const item = newArray[index];
            newArray[index] = newArray[nextIndex];
            newArray[nextIndex] = item;
            return newArray;
        });
    };

    const removeChapter = (idx: number) => {
        setChapters(prev => prev.filter((_, i) => i !== idx));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file && chapters.length === 0) return;

        setStatus("uploading");
        setErrorMsg("");
        const data = new FormData();
        if (file) data.append("bookFile", file);
        if (coverImage) {
            data.append("coverImage", coverImage);
        }

        if (chapters.length > 0) {
            chapters.forEach((c) => {
                data.append("chapterFiles", c.file);
            });
            data.append(
                "chapterTitles",
                JSON.stringify(chapters.map((c) => c.title))
            );
        }

        Object.entries(formData).forEach(([key, value]) => {
            data.append(key, value as string);
        });

        try {
            const res = await fetch("/api/books", {
                method: "POST",
                body: data,
            });
            if (res.ok) {
                const result = await res.json();
                setLastUploadedBook(result);
                setStatus("success");
            } else {
                const errData = await res.json().catch(() => ({}));
                setErrorMsg(errData.error || `Server error: ${res.status} ${res.statusText}`);
                setStatus("error");
            }
        } catch (err: any) {
            setErrorMsg(err?.message || "Network error — could not connect to server");
            setStatus("error");
        }
    };

    return (
        <div className="w-full px-12 py-10 relative">
            {/* Header */}
            <header className="mb-16 text-left relative">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand/10 border-l-2 border-brand text-brand text-[11px] font-black uppercase tracking-[0.3em] mb-4">
                    Contribute
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none uppercase mb-4">
                    Upload <span className="text-zinc-700">Book.</span>
                </h1>
                <p className="text-zinc-600 font-bold text-[13px] uppercase tracking-widest max-w-xl">
                    Share new academic books and study materials with the community.
                </p>
            </header>

            {/* Progress Bar - Industrial Style */}
            <div className="mb-20 max-w-2xl">
                <div className="flex justify-between items-end mb-6">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex flex-col gap-2">
                            <span className={cn(
                                "text-[12px] font-black uppercase tracking-widest transition-colors",
                                step >= s ? "text-brand" : "text-zinc-800"
                            )}>
                                {s === 1 ? "STEP_01" : s === 2 ? "STEP_02" : "STEP_03"}
                            </span>
                            <div className={cn(
                                "h-1 w-24 transition-all duration-500",
                                step >= s ? "bg-brand pb-0.5" : "bg-zinc-900"
                            )} />
                        </div>
                    ))}
                </div>
                <div className="flex justify-between mt-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700">
                    <span>Book Info</span>
                    <span>Upload Files</span>
                    <span>Review</span>
                </div>
            </div>

            {status === "success" ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[#0a0a0a]/40 border border-emerald-500/20 p-16 text-center relative overflow-hidden group"
                >
                    <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-emerald-500/40" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-emerald-500/40" />

                    <div className="w-20 h-20 border-2 border-emerald-500 flex items-center justify-center mx-auto mb-10 relative">
                        <div className="absolute inset-2 bg-emerald-500/10" />
                        <CheckCircle2 className="text-emerald-500 w-10 h-10 relative z-10" />
                    </div>

                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">
                        Upload Successful
                    </h2>
                    <p className="text-zinc-600 font-bold text-[13px] uppercase tracking-widest mb-4 max-w-md mx-auto leading-relaxed">
                        Your book has been submitted and is now available in the library.
                    </p>
                    {lastUploadedBook?.uid && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand/10 border border-brand/20 rounded-lg mb-12">
                            <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Book ID:</span>
                            <span className="text-brand font-black text-sm font-mono tracking-widest">{lastUploadedBook.uid}</span>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => {
                                if (onSuccess && lastUploadedBook) {
                                    onSuccess(lastUploadedBook);
                                }
                            }}
                            className="w-full sm:w-auto px-10 py-5 bg-brand text-black font-black text-[11px] uppercase tracking-[0.2em] hover:bg-brand/90 transition-all cursor-pointer font-sans"
                        >
                            View Book
                        </button>
                        <button
                            onClick={() => {
                                setStatus("idle");
                                setStep(1);
                                setFile(null);
                                setCoverImage(null);
                                setChapters([]);
                                setFormData({
                                    title: "",
                                    subtitle: "",
                                    author: "",
                                    publisher: "",
                                    description: "",
                                    board: "CBSE",
                                    grade: "10",
                                    subject: "Physics",
                                    language: "English",
                                    tags: "",
                                });
                                localStorage.removeItem("upload_draft");
                            }}
                            className="w-full sm:w-auto px-10 py-5 bg-white/5 text-white font-black text-[11px] uppercase tracking-[0.2em] border border-white/10 hover:bg-white/10 transition-all cursor-pointer font-sans"
                        >
                            Add Another
                        </button>
                    </div>
                </motion.div>
            ) : (
                <div className="bg-[#0a0a0a]/40 border border-white/5 p-12 relative overflow-hidden group">
                    {/* Corner Accents */}
                    <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-white/10 group-focus-within:border-brand/40 transition-colors" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-white/10 group-focus-within:border-brand/40 transition-colors" />

                    <form onSubmit={handleSubmit}>
                        {step === 1 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-8"
                            >
                                {/* Cover Image Upload + Smart Scan */}
                                <div className="p-8 bg-brand/[0.02] border border-white/[0.03] mb-12 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-brand/20" />

                                    <div className="flex items-center justify-between mb-8">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-brand text-[10px] font-black uppercase tracking-[0.3em]">
                                                <Sparkles className="w-2.5 h-2.5" />
                                                Smart Scan
                                            </div>
                                            <h3 className="text-xl font-black text-white uppercase tracking-tighter">Cover Image</h3>
                                        </div>
                                        {coverImage && (
                                            <button
                                                type="button"
                                                onClick={handleSmartScan}
                                                disabled={isAnalyzing}
                                                className="px-6 py-3 bg-brand text-black font-black text-[11px] uppercase tracking-[0.2em] hover:bg-brand/90 transition-all disabled:opacity-50 cursor-pointer font-sans"
                                            >
                                                {isAnalyzing ? "Scanning Image..." : "Auto-Fill Details"}
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-zinc-700 font-bold text-[11px] uppercase tracking-widest mb-10 max-w-lg">
                                        Upload the book cover. Our AI will scan it to automatically fill in the details below.
                                    </p>

                                    <div className="relative group">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleCoverChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <div
                                            className={cn(
                                                "flex items-center gap-4 p-4 border transition-all",
                                                coverImage
                                                    ? "border-brand/50 bg-brand/10"
                                                    : "border-white/10 bg-black/20 group-hover:border-white/20"
                                            )}
                                        >
                                            <div className="w-12 h-12 bg-white/5 flex items-center justify-center flex-shrink-0 overflow-hidden border border-white/5">
                                                {coverImage ? (
                                                    <img
                                                        src={URL.createObjectURL(coverImage)}
                                                        alt="Cover"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <ImageIcon className="text-zinc-600 w-6 h-6" />
                                                )}
                                            </div>
                                            <div className="flex-grow">
                                                <p className="text-[12px] font-black text-white uppercase tracking-widest">
                                                    {coverImage ? coverImage.name : "Upload Cover"}
                                                </p>
                                                <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">
                                                    {coverImage
                                                        ? "Image verified"
                                                        : "PNG, JPG · MAX 5MB"}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                className="px-4 py-2 bg-white/5 text-[10px] font-black text-zinc-600 uppercase tracking-widest border border-white/5 font-sans"
                                            >
                                                {coverImage ? "Swap" : "Browse"}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Scan Result Feedback */}
                                    {scanResult && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-6 p-5 bg-emerald-500/[0.03] border border-emerald-500/20"
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                                    <span className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em]">Smart Scan Complete</span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">
                                                        CONFIDENCE: <span className="text-emerald-500">{scanResult.confidence}%</span>
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowOcrText(!showOcrText)}
                                                        className="text-zinc-600 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-black uppercase tracking-widest"
                                                    >
                                                        {showOcrText ? 'Hide' : 'View'} Raw Scan
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-zinc-700 font-bold text-[10px] uppercase tracking-widest mb-4">
                                                Book details extracted. You can still edit them manually.
                                            </p>
                                            {showOcrText && scanResult.ocrText && (
                                                <pre className="p-4 bg-black/40 text-[10px] text-zinc-500 font-mono whitespace-pre-wrap max-h-40 overflow-y-auto border border-white/5 uppercase tracking-widest leading-relaxed">
                                                    {scanResult.ocrText}
                                                </pre>
                                            )}
                                        </motion.div>
                                    )}

                                    {/* Analyzing State */}
                                    {isAnalyzing && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="mt-6 p-6 bg-brand/[0.03] border border-brand/20 relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand to-transparent animate-scan" />
                                            <div className="flex items-center gap-6">
                                                <div className="relative w-12 h-12 flex items-center justify-center">
                                                    <div className="absolute inset-0 border border-brand/10 border-dashed rounded-full animate-[spin_10s_linear_infinite]" />
                                                    <div className="absolute inset-1 border border-brand/20 rounded-full animate-[spin_4s_linear_infinite_reverse]" />
                                                    <div className="w-6 h-6 border-2 border-brand/20 border-t-brand animate-spin rounded-full relative z-10" />
                                                    <div className="absolute inset-0 bg-brand/5 blur-xl rounded-full animate-pulse" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[12px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 bg-brand rounded-full animate-pulse" />
                                                        Analyzing Document Structure
                                                    </p>
                                                    <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest leading-relaxed">
                                                        Extracting semantic metadata via OCR nodes...
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.3em] ml-1">
                                            Book Title *
                                        </label>
                                        <input
                                            required
                                            name="title"
                                            type="text"
                                            placeholder="Enter title..."
                                            className="w-full px-6 py-5 bg-[#070707] border border-white/10 text-white text-[13px] font-black uppercase tracking-widest focus:outline-none focus:border-brand/40 placeholder:text-zinc-900 transition-all font-sans"
                                            value={formData.title}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.3em] ml-1">
                                            Subtitle
                                        </label>
                                        <input
                                            name="subtitle"
                                            type="text"
                                            placeholder="Enter subtitle (optional)..."
                                            className="w-full px-6 py-5 bg-[#070707] border border-white/10 text-white text-[13px] font-black uppercase tracking-widest focus:outline-none focus:border-brand/40 placeholder:text-zinc-900 transition-all font-sans"
                                            value={formData.subtitle}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.3em] ml-1">
                                            Author *
                                        </label>
                                        <input
                                            required
                                            name="author"
                                            type="text"
                                            placeholder="Enter author name..."
                                            className="w-full px-6 py-5 bg-[#070707] border border-white/10 text-white text-[13px] font-black uppercase tracking-widest focus:outline-none focus:border-brand/40 placeholder:text-zinc-900 transition-all font-sans"
                                            value={formData.author}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.3em] ml-1">
                                            Publisher
                                        </label>
                                        <input
                                            name="publisher"
                                            type="text"
                                            placeholder="Enter publisher..."
                                            className="w-full px-6 py-5 bg-[#070707] border border-white/10 text-white text-[13px] font-black uppercase tracking-widest focus:outline-none focus:border-brand/40 placeholder:text-zinc-900 transition-all font-sans"
                                            value={formData.publisher}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.3em] ml-1">Board</label>
                                        <select
                                            name="board"
                                            className="w-full px-6 py-5 bg-[#070707] border border-white/10 text-white text-[13px] font-black uppercase tracking-widest focus:outline-none focus:border-brand/40 transition-all appearance-none font-sans"
                                            value={formData.board}
                                            onChange={handleChange}
                                        >
                                            {boards.map((b) => (
                                                <option key={b} value={b}>
                                                    {b}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.3em] ml-1">Grade</label>
                                        <select
                                            name="grade"
                                            className="w-full px-6 py-5 bg-[#070707] border border-white/10 text-white text-[13px] font-black uppercase tracking-widest focus:outline-none focus:border-brand/40 transition-all appearance-none font-sans"
                                            value={formData.grade}
                                            onChange={handleChange}
                                        >
                                            {grades.map((g) => (
                                                <option key={g} value={g}>
                                                    {g}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.3em] ml-1">
                                            Subject
                                        </label>
                                        <select
                                            name="subject"
                                            className="w-full px-6 py-5 bg-[#070707] border border-white/10 text-white text-[13px] font-black uppercase tracking-widest focus:outline-none focus:border-brand/40 transition-all appearance-none font-sans"
                                            value={formData.subject}
                                            onChange={handleChange}
                                        >
                                            {subjects.map((s) => (
                                                <option key={s} value={s}>
                                                    {s}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-8">
                                    <button
                                        type="button"
                                        onClick={() => setStep(2)}
                                        className="px-12 py-5 bg-brand text-black font-black text-[12px] uppercase tracking-[0.2em] hover:bg-brand/90 transition-all cursor-pointer font-sans"
                                    >
                                        Continue
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-12"
                            >
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.3em]">
                                            Upload Method
                                        </label>
                                        <div className="flex bg-[#070707] p-1 border border-white/10 font-sans">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setChapters([]);
                                                    setFile(null);
                                                }}
                                                className={cn(
                                                    "px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer",
                                                    !chapters.length
                                                        ? "bg-brand text-black"
                                                        : "text-zinc-700"
                                                )}
                                            >
                                                Full Book PDF
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFile(null);
                                                }}
                                                className={cn(
                                                    "px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer",
                                                    chapters.length
                                                        ? "bg-brand text-black"
                                                        : "text-zinc-700"
                                                )}
                                            >
                                                Chapter-wise PDFs
                                            </button>
                                        </div>
                                    </div>

                                    {!chapters.length ? (
                                        <div className="space-y-4">
                                            <label className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.3em] ml-1">
                                                Select PDF File *
                                            </label>
                                            <div
                                                className={cn(
                                                    "relative border border-dashed border-white/10 p-20 text-center transition-all bg-[#070707]/50",
                                                    file ? "border-brand/40 bg-brand/[0.02]" : "hover:border-white/20"
                                                )}
                                            >
                                                <input
                                                    required={!chapters.length}
                                                    type="file"
                                                    accept=".pdf"
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                                />
                                                <div className="flex flex-col items-center">
                                                    <div className={cn(
                                                        "w-16 h-16 flex items-center justify-center mb-6 border transition-all",
                                                        file ? "border-brand text-brand bg-brand/5 shadow-[0_0_20px_rgba(var(--brand-rgb),0.1)]" : "border-white/5 text-zinc-800"
                                                    )}>
                                                        {file ? <CheckCircle2 className="w-8 h-8" /> : <UploadIcon className="w-8 h-8" />}
                                                    </div>
                                                    <p className="font-black text-white text-[12px] uppercase tracking-[0.2em] mb-2">
                                                        {file ? file.name : "Select PDF File"}
                                                    </p>
                                                    <div className="flex items-center gap-3">
                                                        <p className="text-zinc-700 font-bold text-[10px] uppercase tracking-widest">
                                                            {file ? "File Verified" : "MAX 200MB // PDF ONLY"}
                                                        </p>
                                                        {file && (
                                                            <span className="px-2 py-0.5 bg-brand/10 border border-brand/20 text-brand text-[8px] font-black uppercase tracking-widest rounded">
                                                                Ready
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.3em] ml-1">
                                                    Uploaded Chapters ({chapters.length})
                                                </label>
                                                <div className="relative font-sans">
                                                    <input
                                                        type="file"
                                                        multiple
                                                        accept=".pdf"
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                        onChange={handleChaptersChange}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="px-6 py-3 bg-brand/10 text-brand text-[10px] font-black uppercase tracking-widest border border-brand/20 hover:bg-brand/20 transition-all cursor-pointer"
                                                    >
                                                        Add Chapter
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="space-y-3 max-h-96 overflow-y-auto pr-3 custom-scrollbar">
                                                {chapters.map((chapter, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center gap-6 p-5 bg-[#070707] border border-white/5 group/node font-sans"
                                                    >
                                                        <div className="w-10 h-10 border border-white/5 flex items-center justify-center text-zinc-700 group-hover/node:text-brand transition-colors">
                                                            <FileText className="w-5 h-5" />
                                                        </div>
                                                        <div className="flex-grow space-y-1">
                                                            <input
                                                                type="text"
                                                                value={chapter.title}
                                                                onChange={(e) =>
                                                                    updateChapterTitle(idx, e.target.value)
                                                                }
                                                                className="bg-transparent border-none p-0 text-[12px] font-black text-white uppercase tracking-widest focus:ring-0 w-full outline-none"
                                                            />
                                                            <p className="text-[10px] font-bold text-zinc-800 uppercase tracking-widest">
                                                                {chapter.file.name}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-1 bg-black/40 p-1 rounded border border-white/5">
                                                            <button
                                                                type="button"
                                                                title="Move Up"
                                                                disabled={idx === 0}
                                                                onClick={() => moveChapter(idx, 'up')}
                                                                className="p-2 text-zinc-600 hover:text-brand disabled:opacity-5 transition-all cursor-pointer hover:bg-white/5 rounded"
                                                            >
                                                                <ChevronLeft className="w-4 h-4 rotate-90" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                title="Move Down"
                                                                disabled={idx === chapters.length - 1}
                                                                onClick={() => moveChapter(idx, 'down')}
                                                                className="p-2 text-zinc-600 hover:text-brand disabled:opacity-5 transition-all cursor-pointer hover:bg-white/5 rounded"
                                                            >
                                                                <ChevronRight className="w-4 h-4 rotate-90" />
                                                            </button>
                                                            <div className="w-[1px] h-4 bg-white/10 mx-1" />
                                                            <button
                                                                type="button"
                                                                title="Remove Node"
                                                                onClick={() => removeChapter(idx)}
                                                                className="p-2 text-zinc-600 hover:text-red-500 transition-all cursor-pointer hover:bg-white/5 rounded"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.3em] ml-1">
                                            Registry Language
                                        </label>
                                        <select
                                            name="language"
                                            className="w-full px-6 py-5 bg-[#070707] border border-white/10 text-white text-[13px] font-black uppercase tracking-widest focus:outline-none focus:border-brand/40 appearance-none font-sans"
                                            value={formData.language}
                                            onChange={handleChange}
                                        >
                                            {languages.map((l) => (
                                                <option key={l} value={l}>
                                                    {l}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.3em] ml-1">
                                            Logical Tags
                                        </label>
                                        <input
                                            name="tags"
                                            type="text"
                                            placeholder="TAG_01, TAG_02..."
                                            className="w-full px-6 py-5 bg-[#070707] border border-white/10 text-white text-[13px] font-black uppercase tracking-widest focus:outline-none focus:border-brand/40 placeholder:text-zinc-900 font-sans"
                                            value={formData.tags}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-between pt-12">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="px-10 py-5 bg-white/5 text-white font-black text-[12px] uppercase tracking-[0.2em] border border-white/10 hover:bg-white/10 transition-all font-sans cursor-pointer"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStep(3)}
                                        className="px-12 py-5 bg-brand text-black font-black text-[12px] uppercase tracking-[0.2em] hover:bg-brand/90 transition-all font-sans cursor-pointer"
                                    >
                                        Review Submission
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-12"
                            >
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.3em] ml-1">
                                        Book Description
                                    </label>
                                    <textarea
                                        name="description"
                                        rows={6}
                                        placeholder="Enter book description..."
                                        className="w-full px-6 py-5 bg-[#070707] border border-white/10 text-white text-[13px] font-black uppercase tracking-widest focus:outline-none focus:border-brand/40 placeholder:text-zinc-900 transition-all resize-none font-sans"
                                        value={formData.description}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="p-8 bg-brand/[0.02] border border-white/[0.03] relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-brand/20" />
                                    <h4 className="text-[13px] font-black text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                                        <AlertCircle className="w-3 h-3 text-brand" />
                                        Final Review
                                    </h4>
                                    <div className="grid grid-cols-2 gap-12 text-[12px] font-black uppercase tracking-widest font-sans">
                                        <div className="space-y-2">
                                            <span className="text-zinc-700 block text-[9px] tracking-[0.4em]">Registry_Title</span>
                                            <span className="text-white border-l-2 border-brand/20 pl-3">
                                                {formData.title || "NULL"}
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            <span className="text-zinc-700 block text-[9px] tracking-[0.4em]">Lead_Contributor</span>
                                            <span className="text-white border-l-2 border-brand/20 pl-3">
                                                {formData.author || "NULL"}
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            <span className="text-zinc-700 block text-[9px] tracking-[0.4em]">Academic_Board</span>
                                            <span className="text-white border-l-2 border-brand/20 pl-3">
                                                {formData.board || "CBSE"}
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            <span className="text-zinc-700 block text-[9px] tracking-[0.4em]">Asset_Status</span>
                                            <span className="text-brand flex items-center gap-2">
                                                <div className="w-1 h-1 bg-brand animate-pulse" />
                                                Verified Ready
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {status === "error" && (
                                    <div className="flex flex-col gap-2 p-6 bg-red-500/10 border border-red-500/20 text-red-400 font-sans">
                                        <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest">
                                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                            Upload Failed
                                        </div>
                                        {errorMsg && (
                                            <p className="text-[11px] font-mono text-red-300/80 pl-7 break-all">{errorMsg}</p>
                                        )}
                                    </div>
                                )}

                                <div className="flex justify-between pt-12">
                                    <button
                                        type="button"
                                        onClick={() => setStep(2)}
                                        className="px-10 py-5 bg-white/5 text-white font-black text-[12px] uppercase tracking-[0.2em] border border-white/10 hover:bg-white/10 transition-all font-sans cursor-pointer"
                                    >
                                        Back
                                    </button>
                                    <button
                                        disabled={status === "uploading"}
                                        type="submit"
                                        className="px-12 py-5 bg-brand text-black font-black text-[12px] uppercase tracking-[0.2em] hover:bg-brand/90 transition-all disabled:opacity-50 cursor-pointer font-sans"
                                    >
                                        {status === "uploading" ? "Uploading..." : "Publish Book"}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </form>
                </div>
            )}
        </div>
    );
}
