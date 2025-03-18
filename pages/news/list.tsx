"use client"

import "@/styles/globals.css"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import { useSession } from "next-auth/react"

export default function NewsListPage() {
  const [newsList, setNewsList] = useState<{ id: number, title: string }[]>([])
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    fetch("/api/news")
      .then(res => res.json())
      .then(data => setNewsList(data))
  }, [])


  useEffect(() => {
    if(status === "loading") {
        return;
    }

    if(!session) {
        router.replace("/error?error=SessionExpired");
    }
  }, [status, session, router]);

  const dashboardLink =
    session?.user?.role === "admin" ? "/admin/dashboard" : "/user/dashboard"

  return (
    <main className="flex flex-col min-h-screen items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300">
      <div className="bg-white rounded-3xl shadow-2xl p-10 text-center max-w-lg w-full mx-4 mb-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">News List</h1>
        <ul className="divide-y divide-gray-200 text-left">
          {newsList.map(news => (
            <li
              key={news.id}
              className="py-4 cursor-pointer hover:bg-gray-100 px-4 rounded-md transition"
              onClick={() => router.push(`/news/${news.id}`)}
            >
              <span className="font-semibold">{news.title}</span>
              <span className="text-sm text-gray-400 ml-2">#{news.id}</span>
            </li>
          ))}
        </ul>
        
        <Link href={dashboardLink} className="inline-block mt-8 px-6 py-3 bg-blue-500 text-white font-semibold rounded-full hover:bg-blue-600 transition">
          Back to Dashboard
        </Link>
      </div>
    </main>
  )
}
