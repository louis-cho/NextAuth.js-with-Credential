"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import "@/styles/globals.css"; // styles 폴더일 때
import { useEffect } from "react";


export default function WelcomePage() {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === "loading") {
      return;
    }

  }, [status, session]);

  const isLoggedIn = !!session

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-12 text-center max-w-lg w-full mx-4">
        {/* 로딩 상태 */}
        {status === "loading" && (
          <div className="text-2xl font-semibold text-gray-700 animate-pulse">
            Loading...
          </div>
        )}

        {/* 로그인 상태 */}
        {status !== "loading" && isLoggedIn && (
          <>
            <h1 className="text-4xl font-bold mb-4 text-gray-800">
              Welcome, {session.user.name}!
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              You are signed in as <span className="font-semibold text-indigo-600">{session.user.role}</span>.
            </p>

            <div className="flex flex-col gap-4">
              {session.user.role === "admin" && (
                <Link
                  href="/admin/dashboard"
                  className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-full shadow-md hover:bg-indigo-700 transition"
                >
                  Go to Admin Dashboard
                </Link>
              )}

              {session.user.role === "user" && (
                <Link
                  href="/user/dashboard"
                  className="px-8 py-4 bg-blue-600 text-white font-bold rounded-full shadow-md hover:bg-blue-700 transition"
                >
                  Go to User Dashboard
                </Link>
              )}
            </div>
          </>
        )}

        {/* 비로그인 상태 */}
        {status !== "loading" && !isLoggedIn && (
          <>
            <h1 className="text-4xl font-bold mb-4 text-gray-800">Welcome!</h1>
            <p className="text-lg text-gray-600 mb-8">
              Please log in or sign up to continue.
            </p>

            <div className="flex flex-col gap-4">
              <Link
                href="/signin"
                className="px-8 py-4 bg-blue-600 text-white font-bold rounded-full shadow-md hover:bg-blue-700 transition"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-8 py-4 bg-green-600 text-white font-bold rounded-full shadow-md hover:bg-green-700 transition"
              >
                Sign Up
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
