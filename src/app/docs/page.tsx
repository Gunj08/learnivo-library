"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import Docs from "@/components/tabs/Docs";

export default function Page() {
    return (
        <ProtectedRoute>
            {(user) => <Docs />}
        </ProtectedRoute>
    );
}
