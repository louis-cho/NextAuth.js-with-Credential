import pool from "@/lib/db"
import type { NextApiRequest, NextApiResponse } from "next"
import { getToken } from "next-auth/jwt"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    query: { id },
    method,
  } = req

  if (method === "GET") {
    const client = await pool.connect()
    try {
      const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
      const userId = token?.id
      const userRole = token?.role

      // 뉴스 데이터 가져오기
      const result = await client.query(`SELECT * FROM news WHERE id = $1`, [id])

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "뉴스를 찾을 수 없습니다." })
      }

      const news = result.rows[0]

      // 접근 권한 체크
      const roleAllowed = news.allowed_roles?.includes(userRole)
      const userAllowed = news.allowed_user_ids?.includes(userId)

      const minMaxResult = await client.query("SELECT MIN(id) AS min_id, MAX(id) AS max_id FROM news")
      const { min_id, max_id } = minMaxResult.rows[0]

      if (!roleAllowed && !userAllowed) {
        // 접근 불가 → 권한 없음 메시지 전달
        return res.status(200).json({
          news: {
            id: news.id,
            title: "권한이 없습니다",
            content: "이 뉴스에 접근할 수 없습니다.",
          },
          minId: min_id,
          maxId: max_id
        })
      }

      // 접근 허용
      return res.status(200).json({
        news,
        minId: min_id,
        maxId: max_id
      })

    } catch (err) {
      console.error("API Error:", err)
      return res.status(500).json({ error: "Internal Server Error" })
    } finally {
      client.release()
    }
  } else {
    res.setHeader("Allow", ["GET"])
    return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
