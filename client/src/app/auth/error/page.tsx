"use client";

import Link from "next/link";

export default function AuthErrorPage() {

    const message = "Authentication failed";

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="max-w-md w-full rounded-2xl border p-6 bg-card">
                <h1 className="text-xl font-bold mb-4">
                    OAuth Error
                </h1>

                <p className="text-sm text-red-500 mb-6">
                    {message}
                </p>

                <Link
                    href="/login"
                    className="inline-flex items-center justify-center rounded-xl px-4 py-2 bg-[#2872A1] text-white font-medium"
                >
                    Back to Login
                </Link>
            </div>
        </div>
    );
}