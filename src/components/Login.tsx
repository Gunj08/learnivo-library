"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shield, Lock, User, ArrowRight, AlertCircle, BookOpen } from "lucide-react";

interface LoginProps {
    onLogin: (user: any) => void;
    onBack?: () => void;
}

export default function Login({ onLogin, onBack }: LoginProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";

        try {
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (res.ok) {
                if (isLogin) {
                    onLogin(data);
                } else {
                    setSuccess("Account created successfully! You can now login.");
                    setIsLogin(true);
                    setPassword("");
                }
            } else {
                setError(data.error || "Login failed. Please check your credentials.");
            }
        } catch (err) {
            setError("Unable to connect to the server. Please check your internet.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-[#030303] selection:bg-brand selection:text-black">
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none overflow-hidden"
                style={{ backgroundImage: `linear-gradient(#84cc16 1px, transparent 1px), linear-gradient(90deg, #84cc16 1px, transparent 1px)`, backgroundSize: '60px 60px' }}>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#030303]/80 to-[#030303]" />
            </div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand/5 blur-[120px] rounded-full pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[480px] relative z-10"
            >
                {/* Logo Area */}
                <div className="flex flex-col items-center mb-10">
                    <div className="w-14 h-14 bg-brand flex items-center justify-center mb-4 shadow-xl shadow-brand/10">
                        <BookOpen className="w-7 h-7 text-black" />
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-tight uppercase font-sans">
                        Learnivo <span className="text-brand">Library</span>
                    </h2>
                </div>

                <div className="bg-[#0a0a0a] border border-white/5 p-1 relative group">
                    <div className="bg-[#0d0d0d] border border-white/[0.03] p-10 md:p-12 relative overflow-hidden">
                        {/* Simple corner accents */}
                        <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-brand/20" />
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-brand/20" />

                        <div className="relative z-10">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-0"
                            >
                                <header className="mb-10 text-center">
                                    <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2 font-sans">
                                        {isLogin ? "Welcome Back" : "Create Account"}
                                    </h1>
                                    <p className="text-zinc-500 text-xs font-medium font-sans">
                                        {isLogin ? "Enter your details to access your books." : "Join thousands of students and start reading."}
                                    </p>
                                </header>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <AnimatePresence>
                                        {error && (
                                            <motion.div
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0 }}
                                                className="p-4 bg-red-500/5 border border-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 font-sans"
                                            >
                                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                                {error}
                                            </motion.div>
                                        )}
                                        {success && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="p-4 bg-brand/5 border border-brand/10 text-brand text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 font-sans"
                                            >
                                                <Shield className="w-4 h-4 flex-shrink-0" />
                                                {success}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1 font-sans">
                                            Username
                                        </label>
                                        <div className="relative group">
                                            <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-brand transition-colors" />
                                            <input
                                                type="text"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                className="w-full bg-[#070707] border border-white/5 p-5 pl-12 text-sm text-white focus:outline-none focus:border-brand/40 transition-all placeholder:text-zinc-800 font-sans"
                                                placeholder="Enter your username"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1 font-sans">
                                            Password
                                        </label>
                                        <div className="relative group">
                                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-brand transition-colors" />
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full bg-[#070707] border border-white/5 p-5 pl-12 text-sm text-white focus:outline-none focus:border-brand/40 transition-all placeholder:text-zinc-800 font-sans"
                                                placeholder="••••••••"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-brand text-black font-black py-5 uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-brand/90 transition-all disabled:opacity-50 cursor-pointer shadow-lg border-none active:scale-[0.98] font-sans"
                                    >
                                        {isLogin ? (loading ? "Verifying..." : "Sign In") : (loading ? "Working..." : "Register")}
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </form>

                                <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center gap-4">
                                    <button
                                        onClick={() => {
                                            setIsLogin(!isLogin);
                                            setError("");
                                            setSuccess("");
                                        }}
                                        className="text-[10px] font-bold text-zinc-600 hover:text-brand transition-colors uppercase tracking-widest cursor-pointer font-sans"
                                    >
                                        {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-between items-center px-4">
                    <span className="text-[9px] font-medium text-zinc-700 uppercase tracking-widest font-sans">© 2026 Learnivo</span>
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="text-[9px] font-bold text-zinc-600 hover:text-white transition-colors uppercase tracking-widest cursor-pointer font-sans"
                        >
                            Go Back
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
