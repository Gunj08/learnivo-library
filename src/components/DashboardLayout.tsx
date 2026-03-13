"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import Sidebar from "./Sidebar";
import { usePathname } from "next/navigation";

interface DashboardLayoutProps {
    user: any;
    onLogout: () => void;
    children: React.ReactNode;
}

export default function DashboardLayout({ user, onLogout, children }: DashboardLayoutProps) {
    const pathname = usePathname();
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

    // Determine active tab from pathname
    const getActiveTab = () => {
        if (pathname === "/") return "library";
        return pathname.replace("/", "");
    };

    const activeTab = getActiveTab();

    return (
        <div className="flex h-screen bg-[#030303] text-zinc-100 overflow-hidden font-sans selection:bg-brand/30 relative">
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: `linear-gradient(#84cc16 1px, transparent 1px), linear-gradient(90deg, #84cc16 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />

            <Sidebar
                user={user}
                activeTab={activeTab}
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
                            key={pathname}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="h-full"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
