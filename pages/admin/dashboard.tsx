"use client"

import "@/styles/globals.css"
import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "loading")
            return;

        if (status === "unauthenticated" || session?.user.role !== "admin") {
            router.replace("/error?error=AccessDenied")
        }

        if (!session) {
            router.replace("/error?error=SessionExpired");
        }

    }, [status, session, router]);


    return (
        <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-700">
            <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-lg w-full mx-4">
                <h1 className="text-4xl font-bold mb-4 text-gray-800">Admin Dashboard</h1>
                <p className="text-gray-600 mb-6">
                    Welcome, <span className="font-semibold">{session?.user.name}</span>!
                </p>
                <p className="mb-8">Role: <strong className="text-purple-600">Admin</strong></p>

                <div className="flex flex-col gap-4">
                    <Link href="/" className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition">
                        Home
                    </Link>
                    <Link href="/news/list" className="px-6 py-3 bg-green-500 text-white font-semibold rounded-full hover:bg-green-600 transition">
                        View News List
                    </Link>
                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="px-6 py-3 bg-red-500 text-white font-semibold rounded-full hover:bg-red-600 transition"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </main>
    )
}
