"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "./DashboardLayout";
import Login from "./Login";
import Landing from "./Landing";

interface ProtectedRouteProps {
    children: (user: any) => React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showLogin, setShowLogin] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetch("/api/auth/me")
            .then((res) => {
                if (res.ok) return res.json();
                throw new Error("Not logged in");
            })
            .then((data) => setUser(data))
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        setUser(null);
        router.push("/");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#030303] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{ backgroundImage: `linear-gradient(#84cc16 1px, transparent 1px), linear-gradient(90deg, #84cc16 1px, transparent 1px)`, backgroundSize: '50px 50px' }} />
            </div>
        );
    }

    if (!user) {
        if (showLogin) {
            return <Login onLogin={setUser} onBack={() => setShowLogin(false)} />;
        }
        return <Landing onSignIn={() => setShowLogin(true)} />;
    }

    return (
        <DashboardLayout user={user} onLogout={handleLogout}>
            {children(user)}
        </DashboardLayout>
    );
}
