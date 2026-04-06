import { verifyToken } from "../utils/jwt.js";

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token de acesso ausente." });
  }

  try {
    const token = authHeader.slice(7);
    req.user = verifyToken(token);
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalido ou expirado." });
  }
}
