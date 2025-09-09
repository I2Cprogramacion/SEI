import * as jwt from "jsonwebtoken"

export function verifyJWT(token: string): any {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || "default_secret")
  } catch (err) {
    return null
  }
}
