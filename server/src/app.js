import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import authRoutes from "./routes/auth.routes.js";
import checklistRoutes from "./routes/checklist.routes.js";
import guideRoutes from "./routes/guide.routes.js";
import healthRoutes from "./routes/health.routes.js";
import quizRoutes from "./routes/quiz.routes.js";
import userRoutes from "./routes/user.routes.js";
import videosRoutes from "./routes/videos.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const staticDirectory = path.resolve(__dirname, "../../code");

const app = express();

const allowedOrigins = env.frontendOrigin
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || !allowedOrigins.length || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origem nao autorizada"));
    }
  })
);

app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/checklists", checklistRoutes);
app.use("/api/guide", guideRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/videos", videosRoutes);
app.use("/api/user", userRoutes);

app.use(express.static(staticDirectory));

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next();
  }

  return res.sendFile(path.join(staticDirectory, "index.html"));
});

app.use(notFoundHandler);
app.use(errorHandler);

export { app };
