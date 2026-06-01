import { verifyToken } from "../utils/jwt.js";
import { env } from "../config/env.js";
import { getPublicUser } from "../utils/public-user.js";

export async function requireAuth(req, res, next) {
  if (env.publicAccessMode) {
    try {
      req.user = await getPublicUser();
      return next();
    } catch (error) {
      return next(error);
    }
  }

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
