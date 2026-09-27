import jwt from "jsonwebtoken";

const TOKEN_LIFETIME_MS = 60 * 60 * 1000; // 1 hour

const cookieOptions = {
  httpOnly: true, // not readable from JavaScript, so XSS can't steal it
  sameSite: "strict",
  secure: process.env.NODE_ENV === "production",
};

export function setAuthCookie(res, userId) {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET_KEY, {
    expiresIn: TOKEN_LIFETIME_MS / 1000,
  });

  res.cookie("token", token, { ...cookieOptions, maxAge: TOKEN_LIFETIME_MS });
  return token;
}

export function clearAuthCookie(res) {
  res.clearCookie("token", cookieOptions);
}
