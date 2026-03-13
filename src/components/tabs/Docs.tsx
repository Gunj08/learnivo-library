"use client";

import { useState } from "react";
import { Copy, Check, Globe, Shield, Zap, Terminal, Code2, Server } from "lucide-react";

export default function Docs() {
    const [copied, setCopied] = useState<string | null>(null);

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const endpoints = [
        {
            method: "GET",
            path: "/api/external/books",
            description:
                "List all approved books from the library. Requires API key.",
            params: [
                {
                    name: "q",
                    type: "string",
                    desc: "Search query for title or author",
                },
                { name: "board", type: "string", desc: "Filter by board (e.g., CBSE)" },
                { name: "grade", type: "string", desc: "Filter by grade (e.g., 10)" },
                {
                    name: "subject",
                    type: "string",
                    desc: "Filter by subject (e.g., Physics)",
                },
            ],
        },
        {
            method: "GET",
            path: "/api/books",
            description:
                "List all books with optional filtering. Requires authentication.",
            params: [
                {
                    name: "q",
                    type: "string",
                    desc: "Search query for title, author, or description",
                },
                { name: "board", type: "string", desc: "Filter by board" },
                { name: "grade", type: "string", desc: "Filter by grade" },
                { name: "subject", type: "string", desc: "Filter by subject" },
                { name: "language", type: "string", desc: "Filter by language" },
                { name: "status", type: "string", desc: "Filter by status" },
            ],
        },
        {
            method: "GET",
            path: "/api/books/:slug",
            description:
                "Get detailed info and chapters for a specific book.",
        },
    ];

    const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

    return (
        <div className="w-full px-12 py-10 h-full overflow-y-auto custom-scrollbar">
            <header className="mb-20 text-left relative">
                <div className="absolute -left-12 top-0 bottom-0 w-1 bg-brand/20" />
                <span className="text-brand text-[8px] font-black uppercase tracking-[0.4em] mb-2 block">API Docs</span>
                <h1 className="text-4xl md:text-[80px] font-black text-white tracking-tighter uppercase leading-none">
                    API <span className="text-zinc-700">Reference.</span>
                </h1>
                <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest mt-6">
                    Comprehensive guides and reference for the Learnivo Library API.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 max-w-7xl">
                {/* Sidebar */}
                <aside className="lg:col-span-3 space-y-12 h-fit">
                    <nav className="space-y-2 border-l border-white/5 pl-6">
                        <p className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.3em] mb-6">Introduction</p>
                        <a
                            href="#getting-started"
                            className="block py-2 text-[10px] font-black text-brand uppercase tracking-widest"
                        >
                            01 Getting Started
                        </a>
                        <a
                            href="#authentication"
                            className="block py-2 text-[10px] font-black text-zinc-600 hover:text-white transition-colors uppercase tracking-widest"
                        >
                            02 Authentication
                        </a>

                        <p className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.3em] mt-12 mb-6">
                            Endpoints
                        </p>
                        {endpoints.map((e, i) => (
                            <a
                                key={e.path}
                                href={`#${e.path.replace(/\//g, "-")}`}
                                className="block py-2 text-[10px] font-black text-zinc-600 hover:text-white transition-colors uppercase tracking-widest truncate"
                            >
                                {(i + 3).toString().padStart(2, '0')}_{e.method}_{e.path.split('/').pop()?.toUpperCase() || 'ROOT'}
                            </a>
                        ))}
                    </nav>
                </aside>

                {/* Content */}
                <main className="lg:col-span-9 space-y-32">
                    <section id="getting-started" className="space-y-8">
                        <div className="flex items-center gap-4">
                            <span className="text-brand text-[10px] font-mono font-black">01_</span>
                            <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Getting Started</h2>
                        </div>
                        <p className="text-zinc-400 text-sm leading-relaxed max-w-2xl font-bold uppercase tracking-wide">
                            The Learnivo API is a RESTful interface providing programmatic access to curated educational resources. All data is returned in standard JSON format.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
                            {[
                                { icon: Globe, label: "REST API", sub: "Standard JSON" },
                                { icon: Shield, label: "Secure", sub: "API Keys" },
                                { icon: Zap, label: "Fast", sub: "Optimized" }
                            ].map((item, i) => (
                                <div key={i} className="bg-[#0a0a0a] border border-white/5 p-8 space-y-4 group hover:border-brand/20 transition-colors">
                                    <item.icon className="w-5 h-5 text-brand opacity-40 group-hover:opacity-100 transition-opacity" />
                                    <h4 className="font-black text-white text-[10px] uppercase tracking-widest">{item.label}</h4>
                                    <p className="text-zinc-700 text-[8px] font-black uppercase tracking-widest">
                                        {item.sub}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="bg-[#070707] border border-white/5 p-8 relative group overflow-hidden">
                            <div className="absolute top-0 right-0 p-4">
                                <Server className="w-4 h-4 text-zinc-900" />
                            </div>
                            <p className="text-zinc-700 mb-4 uppercase text-[9px] font-black tracking-[0.3em]">
                                Base URL
                            </p>
                            <div className="text-brand font-mono text-sm tracking-tighter group-hover:tracking-normal transition-all">{baseUrl}/api</div>
                        </div>
                    </section>

                    <section id="authentication" className="space-y-8">
                        <div className="flex items-center gap-4">
                            <span className="text-brand text-[10px] font-mono font-black">02_</span>
                            <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Authentication</h2>
                        </div>
                        <p className="text-zinc-400 text-sm leading-relaxed max-w-2xl font-bold uppercase tracking-wide">
                            External endpoints require a unique API key. Generate credentials via the Settings panel and use them in your request headers.
                        </p>
                        <div className="bg-[#070707] border border-white/5 p-8 relative group">
                            <Terminal className="absolute top-4 right-4 w-4 h-4 text-zinc-900" />
                            <p className="text-zinc-700 mb-4 uppercase text-[9px] font-black tracking-[0.3em]">
                                Required Headers
                            </p>
                            <div className="text-emerald-500 font-mono text-sm tracking-tighter">
                                X-API-Key: lrn_live_xxxxxxxxxxxx
                            </div>
                        </div>
                    </section>

                    <section className="space-y-20">
                        <div className="flex items-center gap-4 border-b border-white/5 pb-10">
                            <span className="text-brand text-[10px] font-mono font-black">03_</span>
                            <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Data Endpoints</h2>
                        </div>

                        {endpoints.map((endpoint, i) => (
                            <div
                                key={endpoint.path}
                                id={endpoint.path.replace(/\//g, "-")}
                                className="space-y-10 pt-10 relative overflow-hidden group"
                            >
                                <div className="flex items-center gap-6">
                                    <span className="px-5 py-2 bg-brand text-black font-black text-[9px] uppercase tracking-widest shadow-[0_0_10px_rgba(132,204,22,0.3)]">
                                        {endpoint.method}
                                    </span>
                                    <h3 className="text-xl font-mono font-black text-white tracking-widest">
                                        {endpoint.path}
                                    </h3>
                                </div>
                                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">{endpoint.description}</p>

                                {endpoint.params && (
                                    <div className="space-y-6">
                                        <h4 className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">
                                            QUERY PARAMETERS
                                        </h4>
                                        <div className="bg-[#0a0a0a] border border-white/5 relative overflow-hidden">
                                            <table className="w-full text-left">
                                                <thead className="bg-[#0d0d0d] border-b border-white/5 text-zinc-700 text-[8px] font-black uppercase tracking-[0.3em]">
                                                    <tr>
                                                        <th className="px-8 py-5">Key</th>
                                                        <th className="px-8 py-5">Type</th>
                                                        <th className="px-8 py-5">Description</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/[0.03]">
                                                    {endpoint.params.map((p) => (
                                                        <tr key={p.name} className="hover:bg-white/[0.01] transition-colors">
                                                            <td className="px-8 py-6 font-mono text-brand text-[10px] font-black">
                                                                {p.name}
                                                            </td>
                                                            <td className="px-8 py-6 text-zinc-600 text-[9px] font-black uppercase tracking-widest">
                                                                {p.type}
                                                            </td>
                                                            <td className="px-8 py-6 text-zinc-400 text-[9px] font-bold uppercase tracking-widest">
                                                                {p.desc}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">
                                            Example Request
                                        </h4>
                                        <button
                                            onClick={() =>
                                                copyToClipboard(
                                                    `curl -H "X-API-Key: YOUR_KEY" ${baseUrl}${endpoint.path}`,
                                                    endpoint.path
                                                )
                                            }
                                            className="p-2 text-zinc-700 hover:text-brand transition-colors cursor-pointer"
                                        >
                                            {copied === endpoint.path ? (
                                                <Check className="w-4 h-4 text-brand" />
                                            ) : (
                                                <Copy className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                    <div className="bg-[#050505] border border-white/5 p-8 relative overflow-hidden group/code">
                                        <Code2 className="absolute top-4 right-4 w-4 h-4 text-zinc-900 group-hover/code:text-brand/20 transition-colors" />
                                        <pre className="text-zinc-400 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed">
                                            <span className="text-emerald-500">curl</span> -H <span className="text-orange-400">&quot;X-API-Key: YOUR_KEY&quot;</span> {baseUrl}
                                            {endpoint.path}
                                        </pre>
                                    </div>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 h-px bg-white/[0.03]" />
                            </div>
                        ))}
                    </section>
                </main>
            </div>
        </div>
    );
}
