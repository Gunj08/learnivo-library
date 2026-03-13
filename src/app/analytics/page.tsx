"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import Analytics from "@/components/tabs/Analytics";

export default function Page() {
    return (
        <ProtectedRoute>
            {(user) => <Analytics />}
        </ProtectedRoute>
    );
}
