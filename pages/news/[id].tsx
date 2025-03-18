"use client"
import "@/styles/globals.css"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import Link from "next/link"

export default function NewsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { id } = router.query
  const [news, setNews] = useState<any>(null)
  const [minId, setMinId] = useState<number | null>(null)
  const [maxId, setMaxId] = useState<number | null>(null)

  useEffect(() => {

    if (status === "loading") {
      return;
    }

    if (!id) return

    if (!session) {
      router.replace("/error?error=SessionExpired");
    }

    if (status === "unauthenticated") {
      router.replace("/signin")
      return
    }

    if (status === "authenticated") {
      fetch(`/api/news/${id}`)
        .then(res => {
          if (res.status === 403) {
            router.replace("/error?error=AccessDenied")
            return null
          }
          if (res.status === 404) {
            router.replace("/error?error=NotFound")
            return null
          }
          return res.json()
        })
        .then(data => {
          if (data) {
            setNews(data.news)
            setMinId(data.minId)
            setMaxId(data.maxId)
          }
        })
    }
  }, [status, session, id, router])

  if (status === "loading" || !id || !news) {
    return <div className="text-center p-10">Loading...</div>
  }

  const prevId = parseInt(id as string) - 1
  const nextId = parseInt(id as string) + 1

  return (
    <main className="flex flex-col min-h-screen items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300">
      <div className="bg-white rounded-3xl shadow-2xl p-10 text-center max-w-xl w-full">
        <h1 className="text-4xl font-bold mb-6 text-gray-800">{news.title}</h1>
        <p className="text-gray-600 mb-6">{news.content}</p>
        <p className="text-sm text-gray-400 mb-6">News ID: {news.id}</p>

        <div className="flex justify-between gap-4 mt-6">
          <Link href="/news/list" className="px-4 py-2 bg-gray-500 text-white rounded-full hover:bg-gray-600">
            Back to List
          </Link>

          <div className="flex gap-4">
            {minId !== null && prevId >= minId ? (
              <Link href={`/news/${prevId}`} className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600">
                Previous
              </Link>
            ) : (
              <button className="px-4 py-2 bg-gray-300 text-white rounded-full cursor-not-allowed" disabled>
                Previous
              </button>
            )}

            {maxId !== null && nextId <= maxId ? (
              <Link href={`/news/${nextId}`} className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600">
                Next
              </Link>
            ) : (
              <button className="px-4 py-2 bg-gray-300 text-white rounded-full cursor-not-allowed" disabled>
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
