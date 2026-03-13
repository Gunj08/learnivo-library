"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import Upload from "@/components/tabs/Upload";
import { useRouter } from "next/navigation";

export default function Page() {
    const router = useRouter();

    return (
        <ProtectedRoute>
            {(user) => (
                <Upload
                    onSuccess={(book) => {
                        if (book?.uid) {
                            router.push(`/book/${book.uid}`);
                        } else {
                            router.push("/library");
                        }
                    }}
                />
            )}
        </ProtectedRoute>
    );
}
