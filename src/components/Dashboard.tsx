"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    LayoutGrid,
    Upload as UploadIcon,
    Bell,
    Key,
    FileCode,
    LogOut,
    ChevronRight,
    Library as LibraryIcon,
    BarChart3,
    BookMarked,
} from "lucide-react";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import Sidebar from "./Sidebar";

// Lazy Load Tabs for Performance
const Home = dynamic(() => import("./tabs/Home"), { loading: () => <TabSkeleton /> });
const Upload = dynamic(() => import("./tabs/Upload"), { loading: () => <TabSkeleton /> });
const Admin = dynamic(() => import("./tabs/Admin"), { loading: () => <TabSkeleton /> });
const Docs = dynamic(() => import("./tabs/Docs"), { loading: () => <TabSkeleton /> });
const Analytics = dynamic(() => import("./tabs/Analytics"), { loading: () => <TabSkeleton /> });

interface DashboardProps {
    user: any;
    onLogout: () => void;
}

type Tab = "library" | "upload" | "requests" | "keys" | "docs" | "analytics";

// Skeleton for Tab loading
const TabSkeleton = () => (
    <div className="p-12 space-y-12 animate-pulse">
        <div className="space-y-4">
            <div className="w-48 h-2 bg-brand/10" />
            <div className="w-96 h-12 bg-white/5" />
        </div>
        <div className="grid grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-[3/4] bg-[#0d0d0d] border border-white/5" />
            ))}
        </div>
    </div>
);

export default function Dashboard({ user, onLogout }: DashboardProps) {
    const [activeTab, setActiveTab] = useState<Tab>("library");
    const [selectedBookUid, setSelectedBookUid] = useState<string | null>(null);
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);

    React.useEffect(() => {
        const timer = setTimeout(() => setIsInitializing(false), 800);

        const syncTabFromUrl = () => {
            const params = new URLSearchParams(window.location.search);
            const tab = params.get("tab") as Tab;
            const validTabs: Tab[] = ["library", "upload", "requests", "keys", "docs", "analytics"];
            if (tab && validTabs.includes(tab)) {
                setActiveTab(tab);
            }
        };

        syncTabFromUrl();
        window.addEventListener("popstate", syncTabFromUrl);
        return () => {
            window.removeEventListener("popstate", syncTabFromUrl);
            clearTimeout(timer);
        };
    }, []);

    const handleUploadSuccess = (book: any) => {
        setSelectedBookUid(book.uid);
        handleTabChange("library");
    };

    const handleTabChange = (tab: Tab) => {
        setActiveTab(tab);
        const url = new URL(window.location.href);
        if (tab === "library") {
            url.searchParams.delete("tab");
        } else {
            url.searchParams.set("tab", tab);
        }
        window.history.pushState({}, "", url.toString());
    };

    const renderContent = () => {
        switch (activeTab) {
            case "library":
                return <Home
                    user={user}
                    initialSelectedUid={selectedBookUid}
                    onClearSelection={() => setSelectedBookUid(null)}
                    onSwitchTab={(tab: Tab) => handleTabChange(tab)}
                />;
            case "upload":
                return <Upload onSuccess={handleUploadSuccess} />;
            case "requests":
                return <Admin initialTab="pending" />;
            case "analytics":
                return <Analytics />;
            case "keys":
                return <Admin initialTab="keys" />;
            case "docs":
                return <Docs />;
            default:
                return <Home user={user} />;
        }
    };

    return (
        <div className="flex h-screen bg-[#030303] text-zinc-100 overflow-hidden font-sans selection:bg-brand/30 relative">
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: `linear-gradient(#84cc16 1px, transparent 1px), linear-gradient(90deg, #84cc16 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />

            {/* Overlay Loader */}
            <AnimatePresence>
                {isInitializing && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center"
                    >
                        <div className="space-y-6 text-center">
                            <motion.div
                                animate={{
                                    scale: [1, 1.1, 1],
                                    rotateY: [0, 180, 0]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="w-12 h-12 flex items-center justify-center bg-brand/5 border border-brand/20 rounded-xl mx-auto"
                            >
                                <LibraryIcon className="w-6 h-6 text-brand" />
                            </motion.div>
                            <div className="space-y-2">
                                <p className="text-brand font-black text-[10px] uppercase tracking-[0.4em]">Optimizing Library</p>
                                <p className="text-zinc-700 font-bold text-[8px] uppercase tracking-widest">Loading assets...</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Sidebar
                user={user}
                activeTab={activeTab}
                onTabChange={handleTabChange}
                onLogout={onLogout}
                isExpanded={isSidebarExpanded}
                onToggle={() => setIsSidebarExpanded(!isSidebarExpanded)}
            />

            <main
                className={cn(
                    "flex-grow bg-[#0a0a0a]/40 backdrop-blur-sm relative h-screen overflow-y-auto custom-scrollbar group/main transition-all duration-300 ease-in-out border-l border-white/5",
                    isSidebarExpanded ? "ml-[240px]" : "ml-[64px]"
                )}
            >
                <div className="p-0 relative min-h-full">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab + (selectedBookUid || '')}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="h-full"
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
