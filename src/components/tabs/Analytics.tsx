"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
    FileText,
    Download,
    Eye,
    Key,
    TrendingUp,
    BarChart3,
    Activity,
    Clock,
    BookOpen,
    CheckCircle2,
    Database,
    Zap,
} from "lucide-react";

interface Stats {
    totalBooks: number;
    approvedBooks: number;
    pendingBooks: number;
    totalDownloads: number;
    totalViews: number;
    totalApiKeys: number;
    recentActivity: any[];
    booksByBoard: any[];
    monthlyUploads: any[];
}

export default function Analytics() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/stats")
            .then((res) => res.json())
            .then((data) => {
                setStats(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="w-full px-12 py-10 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="h-40 bg-[#0a0a0a] border border-white/5 animate-pulse"
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (!stats) return null;

    const statCards = [
        {
            label: "Total Books",
            value: stats.totalBooks,
            icon: Database,
            color: "text-brand",
            bgColor: "bg-brand/5",
        },
        {
            label: "Verified Books",
            value: stats.approvedBooks,
            icon: CheckCircle2,
            color: "text-emerald-400",
            bgColor: "bg-emerald-500/5",
        },
        {
            label: "Total Downloads",
            value: stats.totalDownloads,
            icon: Download,
            color: "text-blue-400",
            bgColor: "bg-blue-500/5",
        },
        {
            label: "Total Views",
            value: stats.totalViews,
            icon: Eye,
            color: "text-purple-400",
            bgColor: "bg-purple-500/5",
        },
        {
            label: "Pending Review",
            value: stats.pendingBooks,
            icon: Clock,
            color: "text-orange-400",
            bgColor: "bg-orange-500/5",
        },
        {
            label: "API Keys",
            value: stats.totalApiKeys,
            icon: Key,
            color: "text-cyan-400",
            bgColor: "bg-cyan-500/5",
        },
    ];

    return (
        <div className="w-full px-12 py-10 space-y-16 h-full overflow-y-auto custom-scrollbar">
            <header className="text-left relative">
                <div className="absolute -left-12 top-0 bottom-0 w-1 bg-brand/20" />
                <span className="text-brand text-[8px] font-black uppercase tracking-[0.4em] mb-2 block">Analytics</span>
                <h1 className="text-4xl md:text-[80px] font-black text-white tracking-tighter uppercase leading-none">
                    Library <span className="text-zinc-700">Insights.</span>
                </h1>
                <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest mt-6">
                    Detailed insights into library growth and user engagement.
                </p>
            </header>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
                {statCards.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-[#0a0a0a] border border-white/5 p-10 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-brand/0 group-hover:border-brand/40 transition-all" />

                        <div className="flex justify-between items-start mb-10">
                            <stat.icon className={`w-5 h-5 ${stat.color} opacity-40 group-hover:opacity-100 transition-opacity`} />
                            <span className="text-zinc-800 text-[8px] font-black tracking-[0.4em] uppercase">STAT_0{i + 1}</span>
                        </div>
                        <h4 className="text-zinc-500 text-[8px] font-black uppercase tracking-[0.3em] mb-2">{stat.label}</h4>
                        <div className="flex items-baseline gap-2">
                            <p className="text-4xl font-black text-white tracking-tighter tabular-nums">
                                {stat.value.toLocaleString()}
                            </p>
                            <div className="w-1.5 h-1.5 bg-brand/20 group-hover:bg-brand transition-colors" />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-1">
                {/* Books by Board */}
                <div className="bg-[#0a0a0a] border border-white/5 p-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                        <BarChart3 className="w-4 h-4 text-zinc-900" />
                    </div>

                    <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-12 flex items-center gap-3">
                        <div className="w-1.5 h-1.5 bg-brand" />
                        Library Categories
                    </h3>

                    {stats.booksByBoard.length > 0 ? (
                        <div className="space-y-8">
                            {stats.booksByBoard.map((item: any, i: number) => {
                                const maxCount = Math.max(
                                    ...stats.booksByBoard.map((b: any) => b.count)
                                );
                                const percentage = (item.count / maxCount) * 100;
                                return (
                                    <div key={i} className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[9px] font-black text-white uppercase tracking-widest">
                                                {item.board || "OTHER"}
                                            </span>
                                            <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest tabular-nums font-mono">
                                                {item.count} BOOKS
                                            </span>
                                        </div>
                                        <div className="h-1 bg-white/[0.03] overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                transition={{ delay: 0.2 + i * 0.1, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                                                className="h-full bg-brand/40 group-hover:bg-brand transition-colors"
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-20 text-center border border-white/5 bg-black/20">
                            <p className="text-zinc-800 text-[10px] font-black uppercase tracking-[0.5em]">NO DATA FOUND</p>
                        </div>
                    )}
                </div>

                {/* Monthly Uploads */}
                <div className="bg-[#0a0a0a] border border-white/5 p-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                        <Activity className="w-4 h-4 text-zinc-900" />
                    </div>

                    <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-12 flex items-center gap-3">
                        <div className="w-1.5 h-1.5 bg-brand" />
                        Upload Trends
                    </h3>

                    {stats.monthlyUploads.length > 0 ? (
                        <div className="h-64 flex items-end gap-1.5">
                            {stats.monthlyUploads
                                .reverse()
                                .map((item: any, i: number) => {
                                    const maxCount = Math.max(
                                        ...stats.monthlyUploads.map((m: any) => m.count)
                                    );
                                    const height =
                                        maxCount > 0 ? (item.count / maxCount) * 100 : 5;
                                    return (
                                        <motion.div
                                            key={i}
                                            initial={{ height: 0 }}
                                            animate={{ height: `${Math.max(height, 5)}%` }}
                                            transition={{ delay: 0.2 + i * 0.05, duration: 0.8 }}
                                            className="flex-grow bg-white/[0.03] border-t border-brand/0 hover:bg-brand/40 hover:border-brand transition-all relative group cursor-pointer"
                                        >
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-brand text-black text-[8px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                {item.count} UPLOADS
                                            </div>
                                        </motion.div>
                                    );
                                })}
                        </div>
                    ) : (
                        <div className="py-20 text-center border border-white/5 bg-black/20">
                            <p className="text-zinc-800 text-[10px] font-black uppercase tracking-[0.5em]">NO TRENDS FOUND</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-[#0a0a0a] border border-white/5 p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                    <Zap className="w-4 h-4 text-zinc-900" />
                </div>

                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-12 flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-brand shadow-[0_0_8px_rgba(132,204,22,0.5)]" />
                    Event History
                </h3>

                {stats.recentActivity.length > 0 ? (
                    <div className="space-y-1">
                        {stats.recentActivity.map((activity: any, i: number) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="flex items-center gap-6 p-6 bg-white/[0.01] border-l border-white/5 hover:border-brand hover:bg-white/[0.02] transition-all group"
                            >
                                <div className="text-[10px] font-mono text-zinc-800 tabular-nums font-black opacity-30 group-hover:opacity-100 transition-opacity">
                                    {(i + 1).toString().padStart(3, '0')}
                                </div>
                                <div className="flex-grow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-white uppercase tracking-tight">
                                            {activity.details}
                                        </p>
                                        <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest">
                                            {activity.action} :: {activity.entity_type}
                                        </p>
                                    </div>
                                    <div className="text-[8px] text-zinc-700 font-black uppercase tracking-widest tabular-nums">
                                        {new Date(activity.created_at).toLocaleString().replace(',', ' //')}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center border border-white/5 bg-black/20">
                        <p className="text-zinc-800 text-[10px] font-black uppercase tracking-[0.5em]">NO EVENTS FOUND</p>
                    </div>
                )}
            </div>
        </div>
    );
}
