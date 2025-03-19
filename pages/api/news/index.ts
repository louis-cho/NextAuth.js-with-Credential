// pages/api/news/index.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import pool from "@/lib/db"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const client = await pool.connect()
    try {
      const result = await client.query("SELECT id, title FROM news ORDER BY id DESC LIMIT 30")
      res.status(200).json(result.rows)
    } catch (err) {
      console.error("News list error:", err)
      res.status(500).json({ error: "Internal Server Error" })
    } finally {
      client.release()
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" })
  }
}
