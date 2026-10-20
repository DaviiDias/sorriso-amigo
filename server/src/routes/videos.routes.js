import express from "express";
import { requireAuth } from "../middleware/auth.js";

const localVideos = [
  { id: 1, title: "Abridor de Boca", description: "Vídeo educativo sobre o abridor de boca.", url: "/assets/videos/Abridor%20de%20Boca.mp4", audience: "famílias, cuidadores e profissionais" },
  { id: 2, title: "Adaptador de escova", description: "Vídeo educativo sobre o adaptador de escova.", url: "/assets/videos/Adaptador%20de%20escova.mp4", audience: "famílias, cuidadores e profissionais" },
  { id: 3, title: "Principal - Animação Inicial", description: "Animação inicial educativa do Sorriso Amigo.", url: "/assets/videos/Principal%20-%20Animação%20Inicial.mp4", audience: "famílias, cuidadores e profissionais" }
];

const router = express.Router();

router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    return res.json({ videos: localVideos });
  } catch (error) {
    return next(error);
  }
});

export default router;
