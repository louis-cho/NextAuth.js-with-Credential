import pool from "@/lib/db"
import { pbkdf2Sync, randomBytes } from "crypto"
import { pbkdf2Config } from "@/types/pbkdf2Config"
import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" })
  }

  const { name, email, password, role } = req.body

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "Missing required fields" })
  }

  const client = await pool.connect()

  try {
    // 이메일 중복 체크
    const existing = await client.query("SELECT * FROM users WHERE email = $1", [email])
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Email already exists" })
    }

    // 비밀번호 해싱
    const salt = randomBytes(16).toString("hex")
    const hash = pbkdf2Sync(password, salt, pbkdf2Config.iterations, pbkdf2Config.keylen, pbkdf2Config.digest).toString("base64")
    const hashedPassword = `${pbkdf2Config.digest}:${pbkdf2Config.iterations}:${salt}:${hash}`

    // DB에 유저 삽입
    await client.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)",
      [name, email, hashedPassword, role]
    )

    return res.status(200).json({ message: "Signup successful" })
  } catch (err) {
    console.error("Signup error:", err)
    return res.status(500).json({ message: "Internal Server Error" })
  } finally {
    client.release()
  }
}
