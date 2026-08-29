import express from "express";
import "dotenv/config";
import db from "./db.js";
import authRoutes from "./routes/auth.js";
import todoRoutes from "./routes/todos.js";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;
app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/todos", todoRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Server is running",
  });
});

function startServer() {
  try {
    // db.js already runs CREATE TABLE on import
    //but this confirms the connection is alive

    db.prepare("SELECT 1").get();
    console.log("Database connected");

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server: ", error.message);
    process.exit(1);
  }
}

startServer();
