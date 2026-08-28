import express from "express";
import db from "../db.js";
import verifyToken from "../middleware/auth.js";

const router = express.Router();

router.use(verifyToken);

router.get("/", (req, res) => {
  const todos = db
    .prepare("SELECT * FROM todos WHERE user_id = ?")
    .all(req.userId);

  res.json(todos);
});

router.post("/", (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }
  const stmt = db.prepare("INSERT INTO todos (title, user_id) VALUES (?, ?)");
  const result = stmt.run(title, req.userId);

  res.status(201).json({
    id: result.lastInsertRowid,
    title,
    done: false,
    user_id: req.userId,
  });
});

export default router;
