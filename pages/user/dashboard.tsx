"use client"

import "@/styles/globals.css"
import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/router"
import { useEffect } from "react"

export default function UserDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if(status === "loading") {
            return;
        }

        if (!session) {
            router.replace("/error?error=SessionExpired");
        }

        if (status === "unauthenticated" || session?.user.role !== "user") {
            router.replace("/error?error=AccessDenied")
        }
    }, [status, session, router]);

    return (
        <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-500 to-green-500">
            <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-lg w-full mx-4">
                <h1 className="text-4xl font-bold mb-4 text-gray-800">User Dashboard</h1>
                <p className="text-gray-600 mb-6">
                    Hello, <span className="font-semibold">{session?.user.name}</span>!
                </p>
                <p className="mb-8">Role: <strong className="text-blue-600">User</strong></p>

                <div className="flex flex-col gap-4">
                    <Link href="/" className="px-6 py-3 bg-green-500 text-white font-semibold rounded-full hover:bg-green-600 transition">
                        Home
                    </Link>

                    <Link href="/news/list" className="px-6 py-3 bg-indigo-500 text-white font-semibold rounded-full hover:bg-indigo-600 transition">
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
