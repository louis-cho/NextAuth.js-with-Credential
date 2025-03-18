"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import "@/styles/globals.css"
import Link from "next/link"

export default function SignUpPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [name, setName] = useState("")
    const [role, setRole] = useState("user") // 기본값 user
    const router = useRouter()
    const searchParams = useSearchParams()
    const error = searchParams.get("error")

    useEffect(() => {
        if (error) {
            router.replace(`/error?error=${error}`)
        }
    }, [error, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const res = await fetch("/api/signup", {
            method: "POST",
            body: JSON.stringify({ name, email, password, role }),
            headers: { "Content-Type": "application/json" },
        })

        if (res.ok) {
            // 회원가입 성공 → signin으로 이동
            router.push("/signin")
        } else {
            // 회원가입 실패 → 에러 페이지로 이동 (에러 메시지 전달 가능)
            const errorData = await res.json()
            router.push(`/error?error=${errorData.message || "SignupFailed"}`)
        }
    }


    return (
        <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-400 to-blue-500">
            <div className="bg-white rounded-3xl shadow-2xl p-10 text-center max-w-md w-full">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">Sign Up</h1>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                    <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                    <input
                        type="text"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
                    />

                    {/* Role 선택 라디오 */}
                    <div className="flex justify-center gap-6 mt-4">
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="role"
                                value="user"
                                checked={role === "user"}
                                onChange={() => setRole("user")}
                                className="accent-green-500"
                            />
                            <span>User</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="role"
                                value="admin"
                                checked={role === "admin"}
                                onChange={() => setRole("admin")}
                                className="accent-green-500"
                            />
                            <span>Admin</span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="mt-6 px-6 py-3 bg-green-500 text-white font-semibold rounded-full shadow-md hover:bg-green-600 transition"
                    >
                        Sign Up
                    </button>
                    <Link href="/" className="px-4 py-2 bg-gray-500 text-white rounded-full hover:bg-orange-600">
                        Back to Main
                    </Link>
                </form>
            </div>
        </main>
    )
}
