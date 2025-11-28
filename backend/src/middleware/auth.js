import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const jwtSec = process.env.JWT_SECRET

export function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1]

  if (!token) return res.status(401).json({ message: "Access denied" })

  try {
    const decoded = jwt.verify(token, jwtSec)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" })
  }
}
