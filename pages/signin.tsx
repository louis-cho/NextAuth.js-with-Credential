"use client"

import { signIn } from "next-auth/react"
import { useState, useEffect } from "react"
import "@/styles/globals.css";
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [keepSigned, setKeepSigned] = useState(false) // ✅ 추가
  const [localError, setLocalError] = useState("")

  const searchParams = useSearchParams()
  const router = useRouter()
  const error = searchParams.get("error")

  useEffect(() => {
    if (error) {
      if (error === "SessionExpired" || error === "LoggedOut") {
        router.replace(`/error?error=${error}`)
      } else if (error === "CredentialsSignin") {
        setLocalError("Invalid email or password.")
      } else {
        setLocalError("Unknown error occurred.")
      }
    }
  }, [error, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await signIn("credentials", { 
      email, 
      password, 
      keepSigned: keepSigned.toString(), // ✅ 문자열로 넘김
      callbackUrl: "/" 
    })
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="bg-white rounded-3xl shadow-2xl p-10 text-center max-w-md w-full">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Sign In</h1>

        {localError && (
          <div className="mb-4 text-red-500">{localError}</div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          {/* ✅ Keep Signed In 체크박스 추가 */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={keepSigned}
              onChange={() => setKeepSigned(!keepSigned)}
              className="accent-blue-500"
            />
            Keep me signed in
          </label>

          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-full shadow-md hover:bg-blue-700 transition"
          >
            Sign In
          </button>

          <Link href="/" className="px-4 py-2 bg-gray-500 text-white rounded-full hover:bg-orange-600">
            Back to Main
          </Link>
        </form>
      </div>
    </main>
  )
}
