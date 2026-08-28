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

router.put("/:id", (req, res) => {
  const { title, done } = req.body;
  const { id } = req.params;

  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }
  const stmt = db.prepare(
    "UPDATE todos SET title = ?, done = ? WHERE id = ? AND user_id = ?",
  );

  const result = stmt.run(title, done ? 1 : 0, id, req.userId);

  if (result.changes === 0) {
    return res.status(404).json({
      error: "Todo not found",
    });
  }

  res.status(200).json({
    id: Number(id),
    title,
    done,
    user_id: req.userId,
  });
});

router.patch("/:id", (req, res) => {
  const { id } = req.params;
  const { title, done } = req.body;

  const fields = [];
  const values = [];

  if (title !== undefined) {
    fields.push("title = ?");
    values.push(title);
  }

  if (done !== undefined) {
    fields.push("done = ?");
    values.push(done ? 1 : 0);
  }

  if (fields.length === 0) {
    return res.status(400).json({ error: "No fields provided to update" });
  }

  const setClause = fields.join(", ");

  const stmt = db.prepare(
    `UPDATE todos SET ${setClause} WHERE id = ? AND user_id = ?`,
  );

  const result = stmt.run(...values, id, req.userId);

  if (result.changes === 0) {
    return res.status(404).json({
      error: "Todo not found",
    });
  }

  const updatedTodo = db
    .prepare("SELECT * FROM todos where id = ? AND user_id = ?")
    .get(id, req.userId);

  res.json(updatedTodo);
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: "No id provided" });
  }
  const stmt = db.prepare("DELETE FROM todos WHERE id = ? AND user_id = ?");

  const result = stmt.run(id, req.userId);

  if (result.changes === 0) {
    return res.status(404).json({
      error: "Todo not found",
    });
  }

  res.status(200).json({
    message: "Deleted",
  });
});
export default router;
