import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import "./core/types/express";
import { errorHandler } from "./core/errors/errorHandler.middleware";
import { correlationId } from "./core/middleware/correlationId.middleware";
import healthRouter from "./core/routes/health.route";
import routes from "./core/routes";

const app: Application = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(healthRouter);

app.use(correlationId);

app.use(routes);

app.use(errorHandler);

export default app;
