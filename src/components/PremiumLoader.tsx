"use client";

import { motion } from "motion/react";
import { BookOpen } from "lucide-react";

interface PremiumLoaderProps {
    message?: string;
    submessage?: string;
}

export default function PremiumLoader({ message = "Loading...", submessage = "Please wait" }: PremiumLoaderProps) {
    return (
        <div className="flex flex-col items-center justify-center p-12">
            <div className="relative w-32 h-32 flex items-center justify-center">
                {/* Outer pulsing ring */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.3, 0.1],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute inset-0 bg-brand rounded-full blur-3xl"
                />

                {/* Main animated container */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative z-10 w-20 h-20 bg-[#0a0a0a] border border-white/5 shadow-2xl flex items-center justify-center overflow-hidden rounded-2xl"
                >
                    {/* Corner accents */}
                    <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-brand/40" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-brand/40" />

                    <motion.div
                        animate={{
                            y: ["-10%", "110%"],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="absolute inset-0 w-full h-[2px] bg-gradient-to-r from-transparent via-brand to-transparent opacity-20 shadow-[0_0_10px_rgba(132,204,22,0.5)] z-20"
                    />

                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    >
                        <BookOpen className="w-10 h-10 text-brand" />
                    </motion.div>
                </motion.div>

                {/* Rotating ornaments */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-[-20px] border border-brand/5 border-dashed rounded-full"
                />

                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-[-10px] border border-brand/10 border-t-transparent border-b-transparent rounded-full"
                />
            </div>

            {/* Typography */}
            <div className="mt-12 text-center space-y-2">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="overflow-hidden"
                >
                    <motion.p
                        animate={{
                            backgroundPosition: ["200% 0", "-200% 0"]
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        className="text-brand font-black text-[10px] uppercase tracking-[0.6em] bg-gradient-to-r from-brand via-white to-brand bg-clip-text text-transparent bg-[length:200%_100%]"
                    >
                        {message}
                    </motion.p>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-zinc-700 font-bold text-[8px] uppercase tracking-[0.3em]"
                >
                    {submessage}
                </motion.p>
            </div>
        </div>
    );
}
