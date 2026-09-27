import express from "express";
import db from "../db.js";
import verifyToken from "../middleware/auth.js";

const router = express.Router();

router.use(verifyToken);

const MAX_TITLE_LENGTH = 200;

// Returns an error message, or null if the title is valid
function validateTitle(title) {
  if (typeof title !== "string" || !title.trim()) {
    return "Title is required";
  }
  if (title.trim().length > MAX_TITLE_LENGTH) {
    return `Title must be ${MAX_TITLE_LENGTH} characters or fewer`;
  }
  return null;
}

router.param("id", (req, res, next, id) => {
  if (!/^[1-9]\d*$/.test(id)) {
    return res.status(400).json({ error: "Invalid todo id" });
  }
  next();
});

router.get("/", (req, res) => {
  try {
    const todos = db
      .prepare("SELECT * FROM todos WHERE user_id = ?")
      .all(req.userId);

    res.json(todos);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Failed to fetch todos",
    });
  }
});

router.post("/", (req, res) => {
  try {
    const titleError = validateTitle(req.body?.title);

    if (titleError) {
      return res.status(400).json({ error: titleError });
    }
    const title = req.body.title.trim();
    const stmt = db.prepare("INSERT INTO todos (title, user_id) VALUES (?, ?)");
    const result = stmt.run(title, req.userId);

    res.status(201).json({
      id: result.lastInsertRowid,
      title,
      done: 0,
      user_id: req.userId,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Failed to add todo",
    });
  }
});

router.put("/:id", (req, res) => {
  try {
    const { done } = req.body ?? {};
    const { id } = req.params;

    const titleError = validateTitle(req.body?.title);
    if (titleError) {
      return res.status(400).json({ error: titleError });
    }
    const title = req.body.title.trim();
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
      done: done ? 1 : 0,
      user_id: req.userId,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Failed to update todo",
    });
  }
});

router.patch("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const { title, done } = req.body ?? {};

    const fields = [];
    const values = [];

    if (title !== undefined) {
      const titleError = validateTitle(title);
      if (titleError) {
        return res.status(400).json({ error: titleError });
      }
      fields.push("title = ?");
      values.push(title.trim());
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
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Failed to update todo",
    });
  }
});

router.delete("/:id", (req, res) => {
  try {
    const { id } = req.params;
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
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Failed to delete todo",
    });
  }
});
export default router;
