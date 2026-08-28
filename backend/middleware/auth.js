import jwt from "jsonwebtoken";

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: "No token provided",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Malformed authorization header" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.log("JWT verify error:", error.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export default verifyToken;
