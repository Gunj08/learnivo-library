"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import Admin from "@/components/tabs/Admin";

export default function Page() {
    return (
        <ProtectedRoute>
            {(user) => <Admin initialTab="keys" />}
        </ProtectedRoute>
    );
}
