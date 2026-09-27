import jwt from "jsonwebtoken";
import { setAuthCookie } from "../utils/authCookie.js";

// Re-issue the cookie once it is this old, so active users stay logged in
const RENEW_AFTER_SECONDS = 15 * 60;

function verifyToken(req, res, next) {
  // Browser requests send the token as an httpOnly cookie.
  // A Bearer header is still accepted for tools like curl.
  const cookieToken = req.cookies?.token;
  let token = cookieToken;

  if (!token) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: "No token provided",
      });
    }

    token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Malformed authorization header" });
    }
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.userId = decoded.userId;

    const ageInSeconds = Date.now() / 1000 - decoded.iat;
    if (cookieToken && ageInSeconds > RENEW_AFTER_SECONDS) {
      setAuthCookie(res, decoded.userId);
    }

    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export default verifyToken;
