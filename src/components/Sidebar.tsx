"use client";

import React, { useState } from "react";
import {
    LayoutGrid,
    Upload as UploadIcon,
    Bell,
    Key,
    FileCode,
    LogOut,
    Library as LibraryIcon,
    BarChart3,
    ChevronLeft,
    ChevronRight,
    Search
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

interface SidebarProps {
    user: any;
    activeTab: string;
    onTabChange?: (tab: any) => void;
    onLogout?: () => void;
    isExpanded: boolean;
    onToggle: () => void;
}

export default function Sidebar({ user, activeTab, onTabChange, onLogout, isExpanded, onToggle }: SidebarProps) {
    const router = useRouter();
    const pathname = usePathname();

    const menuItems = [
        { id: "library", label: "Dashboard", icon: LayoutGrid, color: "text-brand", href: "/" },
        { id: "all-library", label: "Explore Library", icon: LibraryIcon, color: "text-brand", href: "/library" },
        { id: "upload", label: "Upload Book", icon: UploadIcon, color: "text-blue-400", href: "/upload" },
        { id: "requests", label: "Approvals", icon: Bell, color: "text-orange-400", href: "/requests" },
        { id: "analytics", label: "Analytics", icon: BarChart3, color: "text-cyan-400", href: "/analytics" },
        { id: "keys", label: "API Keys", icon: Key, color: "text-emerald-400", href: "/keys" },
        { id: "docs", label: "API Docs", icon: FileCode, color: "text-purple-400", href: "/docs" },
    ];

    const handleClick = (id: string, href: string) => {
        router.push(href);
    };

    return (
        <motion.aside
            initial={false}
            animate={{ width: isExpanded ? 240 : 64 }}
            className="h-screen bg-[#030303] flex flex-col items-center py-6 fixed left-0 top-0 z-[100] border-r border-white/5 transition-all duration-300 ease-in-out"
        >
            {/* Toggle Button - Industrial Style */}
            <button
                onClick={onToggle}
                className="absolute -right-3 top-20 w-6 h-12 bg-[#0a0a0a] border border-white/10 flex items-center justify-center text-zinc-500 hover:text-brand cursor-pointer transition-colors z-[110]"
            >
                {isExpanded ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>

            {/* Logo area */}
            <div className={cn(
                "mb-12 w-full px-4 flex transition-all",
                isExpanded ? "justify-start" : "justify-center"
            )}>
                <Link href="/">
                    <div className="flex items-center gap-3 group">
                        <div className="w-8 h-8 bg-brand flex items-center justify-center shadow-lg shadow-brand/10 cursor-pointer group-hover:scale-105 transition-transform rounded-sm">
                            <LibraryIcon className="text-black w-4 h-4" />
                        </div>
                        {isExpanded && (
                            <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-white font-black text-sm tracking-tight uppercase"
                            >
                                Learnivo<span className="text-brand">.</span>
                            </motion.span>
                        )}
                    </div>
                </Link>
            </div>

            {/* Menu Items */}
            <nav className="flex flex-col gap-1 w-full px-2">
                {menuItems.map((item) => {
                    const isActive = activeTab === item.id;
                    const content = (
                        <div
                            className={cn(
                                "relative flex items-center transition-all duration-200 group cursor-pointer w-full py-3",
                                isExpanded ? "px-4 gap-3" : "justify-center",
                                isActive
                                    ? "bg-white/[0.03] text-brand"
                                    : "text-zinc-600 hover:text-white hover:bg-white/[0.02]"
                            )}
                        >
                            <item.icon
                                className={cn(
                                    "w-4 h-4 flex-shrink-0 transition-all",
                                    isActive ? "text-brand" : "text-zinc-600 group-hover:text-zinc-400"
                                )}
                            />

                            {isExpanded && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-[10px] font-black uppercase tracking-[0.15em] whitespace-nowrap"
                                >
                                    {item.label}
                                </motion.span>
                            )}

                            {/* Tooltip (collapsed) */}
                            {!isExpanded && (
                                <div className="absolute left-14 px-3 py-1.5 bg-[#0a0a0a] border border-white/10 text-white text-[8px] font-black uppercase tracking-widest opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-[100]">
                                    {item.label}
                                </div>
                            )}

                            {isActive && (
                                <motion.div
                                    layoutId="active-nav-indicator"
                                    className="absolute left-0 w-0.5 h-full bg-brand"
                                />
                            )}
                        </div>
                    );

                    return item.href.startsWith("/#") ? (
                        <button key={item.id} onClick={() => handleClick(item.id, item.href)} className="w-full text-left">
                            {content}
                        </button>
                    ) : (
                        <Link key={item.id} href={item.href} className="w-full">
                            {content}
                        </Link>
                    );
                })}
            </nav>

            {/* Profile / Bottom Section */}
            <div className="mt-auto w-full px-2 space-y-4">
                <button
                    onClick={onLogout}
                    className={cn(
                        "flex items-center text-zinc-600 hover:text-red-500 hover:bg-red-500/5 transition-all cursor-pointer group relative w-full py-3",
                        isExpanded ? "px-4 gap-3" : "justify-center"
                    )}
                >
                    <LogOut className="w-4 h-4 flex-shrink-0" />
                    {isExpanded && (
                        <span className="text-[10px] font-black uppercase tracking-[0.15em]">Log out</span>
                    )}
                    {!isExpanded && (
                        <div className="absolute left-14 px-3 py-1.5 bg-[#0a0a0a] border border-white/10 text-red-500 text-[8px] font-black uppercase tracking-widest opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-[100]">
                            Exit
                        </div>
                    )}
                </button>

                <div className={cn(
                    "flex bg-[#0a0a0a] border border-white/5 transition-all overflow-hidden",
                    isExpanded ? "p-3 gap-3" : "p-2 justify-center"
                )}>
                    <div className="w-8 h-8 bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-500 font-black text-[10px] flex-shrink-0">
                        {user?.username?.[0]?.toUpperCase() || "A"}
                    </div>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col min-w-0"
                        >
                            <span className="text-[10px] font-black text-white truncate uppercase tracking-tight">{user?.username || "Guest"}</span>
                            <span className="text-[8px] font-bold text-zinc-600 truncate uppercase mt-0.5 tracking-widest">Logged in</span>
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.aside>
    );
}
