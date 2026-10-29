import express from "express";
import { requireAuth } from "../middleware/auth.js";

function videoUrl(filename) {
  return `/assets/videos/${encodeURIComponent(filename)}`;
}

const audience = "famílias, cuidadores e profissionais";

const videoHub = {
  intro: {
    id: "hub-intro",
    title: "Animação inicial",
    heading: "Escolha por onde começar",
    text: "Selecione uma opção para conhecer as adaptações.",
    url: videoUrl("principal-animacao-inicial.mp4"),
    audience
  },
  tracks: [
    {
      id: "adaptador",
      title: "MONTE SEU ADAPTADOR DE ESCOVA",
      description: "Conheça 04 opções de adaptação do cabo da escova dentária.",
      animation: {
        id: "adaptador-animacao",
        title: "Animação do adaptador de escova",
        url: videoUrl("adaptador-animacao.mp4"),
        audience
      },
      items: [
        {
          id: "adaptador-palitos-madeira",
          title: "ADAPTAÇÃO DO CABO DA ESCOVA DENTÁRIA COM PALITOS DE MADEIRA",
          description: "Adaptação do cabo da escova dental com palitos de madeira.",
          youtubeUrl: "https://www.youtube.com/watch?v=azMd4U-4_Kg",
          audience
        },
        {
          id: "adaptador-esfera-isopor",
          title: "ADAPTAÇÃO DO CABO DA ESCOVA DENTÁRIA COM ESFERA DE ISOPOR",
          description: "Adaptação do cabo da escova dental com esfera de isopor.",
          youtubeUrl: "https://www.youtube.com/watch?v=lHAUwS3I8Zw",
          audience
        },
        {
          id: "adaptador-tubo-espuma",
          title: "ADAPTAÇÃO DO CABO DA ESCOVA DENTÁRIA COM TUBO DE ESPUMA",
          description: "Adaptação do cabo da escova dental com tubo de espuma.",
          youtubeUrl: "https://www.youtube.com/watch?v=_AG3wEdcGjg",
          audience
        },
        {
          id: "adaptador-escova-unhas",
          title: "ADAPTAÇÃO DO CABO DA ESCOVA DENTÁRIA COM ESCOVA PARA UNHAS",
          description: "Adaptação do cabo da escova dental com escova para unhas.",
          youtubeUrl: "https://www.youtube.com/watch?v=qZE0Db7v9PA",
          audience
        }
      ]
    },
    {
      id: "abridor",
      title: "MONTE SEU ABRIDOR DE BOCA",
      description: "Conheça 03 opções de abridores de boca.",
      animation: {
        id: "abridor-animacao",
        title: "Animação do abridor de boca",
        url: videoUrl("abridor-animacao.mp4"),
        audience
      },
      items: [
        {
          id: "abridor-palito-madeira",
          title: "ABRIDOR DE BOCA MANUFATURADO COM PALITOS DE MADEIRA",
          description: "Abridor de boca manufaturado com palitos de madeira.",
          youtubeUrl: "https://www.youtube.com/watch?v=G49ozQxXPcc",
          audience
        },
        {
          id: "abridor-sugador-odontologico",
          title: "ABRIDOR DE BOCA COM SUGADOR ODONTOLÓGICO",
          description: "Abridor de boca com sugador odontológico.",
          youtubeUrl: "https://www.youtube.com/watch?v=TmqWSWNs9BI",
          audience
        },
        {
          id: "abridor-garrafa-pet",
          title: "ABRIDOR DE BOCA COM GARRAFA PET",
          description: "Abridor de boca com garrafa PET.",
          youtubeUrl: "https://www.youtube.com/watch?v=vF-9TocYqko",
          audience
        }
      ]
    }
  ]
};

const localVideos = videoHub.tracks.flatMap((track) => track.items);

const router = express.Router();

router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    return res.json({ hub: videoHub, videos: localVideos });
  } catch (error) {
    return next(error);
  }
});

export default router;
