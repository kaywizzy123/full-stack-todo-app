// routes/auth.js
import express from "express";
import bcrypt from "bcrypt";
import db from "../db.js";
import verifyToken from "../middleware/auth.js";
import { setAuthCookie, clearAuthCookie } from "../utils/authCookie.js";

const router = express.Router();

const USERNAME_PATTERN = /^[a-z0-9_]{3,30}$/;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 72; // bcrypt ignores anything past 72 bytes

function readCredentials(body) {
  const username =
    typeof body?.username === "string" ? body.username.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  return { username, password };
}

router.post("/register", async (req, res) => {
  const { username, password } = readCredentials(req.body);

  if (!username || !password) {
    return res.status(400).json({
      error: "username and password required",
    });
  }

  if (!USERNAME_PATTERN.test(username)) {
    return res.status(400).json({
      error:
        "username must be 3-30 characters: letters, numbers and underscores only",
    });
  }

  if (
    password.length < MIN_PASSWORD_LENGTH ||
    password.length > MAX_PASSWORD_LENGTH
  ) {
    return res.status(400).json({
      error: `password must be ${MIN_PASSWORD_LENGTH}-${MAX_PASSWORD_LENGTH} characters`,
    });
  }

  try {
    const existing = db
      .prepare("SELECT id FROM users WHERE username = ?")
      .get(username);

    if (existing) {
      return res.status(400).json({
        error: "username already taken",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const stmt = db.prepare(
      "INSERT INTO users (username, password) VALUES (?, ?)",
    );
    const result = stmt.run(username, hashedPassword);

    res.status(201).json({ id: result.lastInsertRowid, username });
  } catch (error) {
    console.error("Register error:", error.message);
    return res.status(500).json({
      error: "Internal Server Error!",
    });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = readCredentials(req.body);

  if (!username || !password) {
    return res.status(400).json({
      error: "username and password required",
    });
  }

  try {
    const user = db
      .prepare("SELECT * FROM users WHERE username = ?")
      .get(username);

    if (!user) {
      return res.status(400).json({
        error: "invalid username or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        error: "invalid username or password",
      });
    }

    const token = setAuthCookie(res, user.id);
    // token is also returned for non-browser clients (curl, tests)
    return res.json({ id: user.id, username: user.username, token });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({
      error: "Internal Server Error!",
    });
  }
});

router.post("/logout", (req, res) => {
  clearAuthCookie(res);
  res.json({ message: "Logged out" });
});

router.get("/me", verifyToken, (req, res) => {
  try {
    const user = db
      .prepare("SELECT id, username FROM users WHERE id = ?")
      .get(req.userId);

    if (!user) {
      clearAuthCookie(res);
      return res.status(401).json({ error: "User no longer exists" });
    }

    res.json(user);
  } catch (error) {
    console.error("Me error:", error.message);
    res.status(500).json({ error: "Internal Server Error!" });
  }
});

export default router;
