"use client"

import { useSearchParams } from "next/navigation"
import "@/styles/globals.css"

export default function ErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  // 에러 코드 → 사용자에게 보여줄 friendly 메시지 매핑
  const errorMessages: Record<string, string> = {
    CredentialsSignin: "Invalid email or password. Please try again.",
    AccessDenied: "You do not have permission to access this page.",
    Configuration: "There is a server configuration issue.",
    SessionExpired: "Session Invalid or Expired. Please signin again.",
    default: "Something went wrong. Please try again.",
  }

  const message = error ? (errorMessages[error] || errorMessages["default"]) : errorMessages["default"]

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-500 to-yellow-500">
      <div className="bg-white rounded-3xl shadow-2xl p-10 text-center max-w-md w-full">
        <h1 className="text-4xl font-bold mb-4 text-gray-800">Oops!</h1>
        <p className="text-gray-600 mb-8">
          {message}
        </p>
        <a
          href="/signin"
          className="inline-block px-6 py-3 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 transition"
        >
          Go to Sign In
        </a>
      </div>
    </main>
  )
}
