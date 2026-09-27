import "dotenv/config";
import db from "./db.js";
import app from "./app.js";

const PORT = process.env.PORT || 3000;

function startServer() {
  try {
    if (!process.env.JWT_SECRET_KEY) {
      throw new Error("JWT_SECRET_KEY is not set");
    }

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
