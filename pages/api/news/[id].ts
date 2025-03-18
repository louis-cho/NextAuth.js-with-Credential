import pool from "@/lib/db"
import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    query: { id },
    method,
  } = req

  if (method === "GET") {
    const client = await pool.connect()
    try {
      // 현재 뉴스 가져오기
      const result = await client.query("SELECT * FROM news WHERE id = $1", [id])

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Not Found" })
      }

      // 최소 id, 최대 id 가져오기
      const minMaxResult = await client.query("SELECT MIN(id) AS min_id, MAX(id) AS max_id FROM news")
      const { min_id, max_id } = minMaxResult.rows[0]

      return res.status(200).json({
        news: result.rows[0],
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
