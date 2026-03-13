"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
    Check,
    X,
    FileText,
    ExternalLink,
    ShieldCheck,
    Trash2,
    Copy,
    AlertTriangle,
} from "lucide-react";
import { Book, ApiKey } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AdminProps {
    initialTab?: "pending" | "keys";
}

export default function Admin({ initialTab = "pending" }: AdminProps) {
    const [pendingBooks, setPendingBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [keys, setKeys] = useState<ApiKey[]>([]);
    const [newKeyName, setNewKeyName] = useState("");
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    const fetchPending = () => {
        setLoading(true);
        fetch("/api/admin/pending")
            .then((res) => res.json())
            .then((data) => {
                setPendingBooks(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    const fetchKeys = () => {
        fetch("/api/admin/keys")
            .then((res) => res.json())
            .then((data) => setKeys(data))
            .catch(() => { });
    };

    useEffect(() => {
        fetchPending();
        fetchKeys();
    }, []);

    const handleApprove = async (id: number) => {
        await fetch("/api/admin/pending", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, action: "approve" }),
        });
        fetchPending();
    };

    const handleReject = async (id: number) => {
        if (confirm("Are you sure you want to reject and delete this book?")) {
            await fetch("/api/admin/pending", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, action: "reject" }),
            });
            fetchPending();
        }
    };

    const handleCreateKey = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newKeyName) return;
        await fetch("/api/admin/keys", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newKeyName }),
        });
        setNewKeyName("");
        fetchKeys();
    };

    const handleDeleteKey = async (id: number) => {
        if (confirm("Revoke this API key?")) {
            await fetch("/api/admin/keys", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            fetchKeys();
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(text);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    if (initialTab === "keys") {
        return (
            <div className="w-full px-12 py-10 h-full overflow-y-auto custom-scrollbar">
                <header className="mb-16 text-left relative">
                    <div className="absolute -left-12 top-0 bottom-0 w-1 bg-brand/20" />
                    <span className="text-brand text-[8px] font-black uppercase tracking-[0.4em] mb-2 block">Settings</span>
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase leading-none">
                        API <span className="text-zinc-700">Keys.</span>
                    </h1>
                    <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest mt-4">
                        Manage your API access and security tokens.
                    </p>
                </header>

                <div className="space-y-12 max-w-5xl">
                    <div className="bg-[#0a0a0a] border border-white/5 p-10 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-brand/40" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-brand/40" />

                        <div className="relative z-10">
                            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                                <div className="w-1.5 h-1.5 bg-brand animate-pulse" />
                                Create New API Key
                            </h3>
                            <form onSubmit={handleCreateKey} className="flex flex-col sm:flex-row gap-4">
                                <input
                                    type="text"
                                    value={newKeyName}
                                    onChange={(e) => setNewKeyName(e.target.value)}
                                    placeholder="Enter key label..."
                                    className="flex-grow bg-black/40 border border-white/10 px-8 py-5 text-white focus:outline-none focus:border-brand/40 transition-colors font-mono text-sm uppercase tracking-widest placeholder:text-zinc-800"
                                />
                                <button
                                    type="submit"
                                    className="bg-brand text-black font-black text-[10px] uppercase tracking-[0.2em] px-12 py-5 hover:bg-brand/90 transition-all cursor-pointer"
                                >
                                    Generate
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="bg-[#0a0a0a] border border-white/5 relative overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-[#0d0d0d] border-b border-white/5">
                                    <tr className="text-zinc-700 text-[8px] font-black uppercase tracking-[0.3em]">
                                        <th className="px-10 py-5">Label</th>
                                        <th className="px-10 py-5">Value</th>
                                        <th className="px-10 py-5">Created</th>
                                        <th className="px-10 py-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.03]">
                                    {keys.map((k) => (
                                        <tr
                                            key={k.id}
                                            className="group hover:bg-white/[0.01] transition-colors"
                                        >
                                            <td className="px-10 py-6 text-white font-black text-[10px] uppercase tracking-wider">
                                                {k.name}
                                            </td>
                                            <td className="px-10 py-6">
                                                <div className="flex items-center gap-3">
                                                    <code className="text-brand bg-brand/5 border border-brand/10 px-4 py-2 text-[10px] font-mono tracking-tighter">
                                                        {k.key}
                                                    </code>
                                                    <button
                                                        onClick={() => copyToClipboard(k.key)}
                                                        className="p-2 hover:text-brand transition-colors cursor-pointer text-zinc-700"
                                                    >
                                                        {copiedKey === k.key ? (
                                                            <Check className="w-3.5 h-3.5 text-brand" />
                                                        ) : (
                                                            <Copy className="w-3.5 h-3.5" />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6 text-zinc-500 text-[9px] font-bold uppercase tracking-widest tabular-nums">
                                                {new Date(k.created_at).toISOString().split('T')[0].replace(/-/g, '.')}
                                            </td>
                                            <td className="px-10 py-6 text-right">
                                                <button
                                                    onClick={() => handleDeleteKey(k.id)}
                                                    className="p-3 text-zinc-700 hover:text-red-500 hover:bg-red-500/5 transition-all cursor-pointer opacity-30 group-hover:opacity-100"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {keys.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="px-10 py-20 text-center text-zinc-800 text-[10px] font-black uppercase tracking-[0.5em]"
                                            >
                                                No active keys found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full px-12 py-10 h-full overflow-y-auto custom-scrollbar">
            <header className="mb-16 text-left relative">
                <div className="absolute -left-12 top-0 bottom-0 w-1 bg-brand/20" />
                <span className="text-brand text-[8px] font-black uppercase tracking-[0.4em] mb-2 block">Moderation</span>
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase leading-none">
                    Pending <span className="text-zinc-700">Approval.</span>
                </h1>
                <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest mt-4">
                    Review and approve new book submissions.
                </p>
            </header>

            <div className="space-y-6 max-w-5xl">
                {loading ? (
                    <div className="space-y-6">
                        {[1, 2].map((i) => (
                            <div
                                key={i}
                                className="h-48 bg-[#0a0a0a] border border-white/5 animate-pulse relative"
                            >
                                <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/5" />
                            </div>
                        ))}
                    </div>
                ) : pendingBooks.length > 0 ? (
                    pendingBooks.map((book) => (
                        <motion.div
                            layout
                            key={book.id}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-[#0a0a0a] border border-white/5 p-10 flex flex-col md:flex-row gap-10 items-start md:items-center relative group hover:border-white/10 transition-colors overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-brand/20 group-hover:border-brand/40 transition-colors" />

                            <div className="w-24 h-32 bg-black border border-white/5 flex items-center justify-center flex-shrink-0 group-hover:border-brand/20 transition-colors relative overflow-hidden">
                                <FileText className="text-zinc-800 w-12 h-12 group-hover:text-brand/20 transition-colors" />
                                {book.cover_image && (
                                    <div className="absolute inset-0 bg-brand/10 animate-pulse opacity-20" />
                                )}
                            </div>

                            <div className="flex-grow space-y-4 min-w-0">
                                <div className="flex flex-col gap-1">
                                    <span className="text-brand text-[7px] font-black uppercase tracking-[0.4em]">ID: {book.uid?.split('-')[0] || book.id}</span>
                                    <h3 className="text-2xl font-black text-white leading-none uppercase tracking-tighter truncate">
                                        {book.title}
                                    </h3>
                                </div>

                                <div className="flex flex-wrap gap-4 items-center">
                                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                                        Author: <span className="text-zinc-300">{book.author}</span>
                                    </p>
                                    <div className="w-1 h-1 bg-zinc-800" />
                                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest tabular-nums">
                                        Date: {new Date(book.created_at).toLocaleDateString()}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2 pt-2">
                                    {[book.board, `GRADE_${book.grade}`, book.subject].filter(Boolean).map(tag => (
                                        <span key={tag} className="px-3 py-1 bg-white/[0.03] border border-white/5 text-zinc-600 text-[7px] font-black uppercase tracking-widest">
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                {book.file_name && (
                                    <div className="pt-4">
                                        <a
                                            href={`/uploads/${book.file_name}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-white/5 border border-white/10 text-[8px] font-black text-zinc-400 hover:text-white hover:border-brand/40 transition-all uppercase tracking-widest"
                                        >
                                            <ExternalLink className="w-3 h-3" />
                                            Open Preview
                                        </a>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto">
                                <button
                                    onClick={() => handleApprove(book.id)}
                                    className="flex-grow md:w-40 p-5 bg-brand text-black font-black text-[10px] uppercase tracking-[0.2em] hover:bg-brand/90 transition-all flex items-center justify-center gap-3 cursor-pointer"
                                >
                                    <Check className="w-4 h-4" />
                                    Approve
                                </button>
                                <button
                                    onClick={() => handleReject(book.id)}
                                    className="flex-grow md:w-40 p-5 bg-white/5 border border-white/5 text-zinc-500 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all flex items-center justify-center gap-3 cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                    Reject
                                </button>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="text-center py-40 border border-white/[0.03] bg-[#0a0a0a]/30 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-12 h-12 border-t border-l border-brand/20" />
                        <div className="absolute bottom-0 right-0 w-12 h-12 border-b border-r border-brand/20" />

                        <div className="relative z-10 flex flex-col items-center gap-6">
                            <div className="w-20 h-20 bg-brand/5 border border-brand/10 flex items-center justify-center animate-pulse">
                                <ShieldCheck className="text-brand w-10 h-10" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-white font-black text-xl uppercase tracking-tighter">Everything's Clear</h3>
                                <p className="text-zinc-700 font-bold text-[9px] uppercase tracking-[0.4em] max-w-xs mx-auto leading-relaxed">
                                    No pending submissions require moderation.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
