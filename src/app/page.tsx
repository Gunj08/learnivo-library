"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import Home from "@/components/tabs/Home";

export default function Page() {
  return (
    <ProtectedRoute>
      {(user) => <Home user={user} onSwitchTab={() => { }} />}
    </ProtectedRoute>
  );
}
