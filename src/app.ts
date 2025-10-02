import { config } from "dotenv";
config();
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import cookieParser from "cookie-parser";
import router from "./routes";
import passport from "passport";
import { resMiddleware } from "./middlewares/res";
import session from "express-session";
import { timeInMs } from "./utils/manipulate/number";
import { CLIENT_URL, NODE_ENV } from "./config";
import { AppError } from "./services/error/AppError";
import "./services/auth/passport";
import "./services/db/index";
import "./utils/extends";
import { handleError } from "./services/error/handleError";

const app = express();
app.set("trust proxy", ["loopback", "linklocal"]);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(helmet());
app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: CLIENT_URL,
  })
);
app.use(
  rateLimit({
    windowMs: timeInMs({ minute: 1 }),
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      title: "Too many requests",
      message: "Too many requests, please try again later",
      code: "TOO_MUCH_REQUEST",
    },
  })
);
app.use(
  session({
    secret: process.env.SESSION_SECRET_KEY!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: timeInMs({ hour: 6 }),
    },
  })
);
app.use(passport.initialize());
app.use(resMiddleware);

app.use("/api", router);

app.use((req) => {
  throw new AppError("NOT_FOUND", { item: `Can not ${req.method} ${req.url}` });
});

app.use(handleError);

const PORT = parseInt(process.env.PORT || "5000");
const HOST = process.env.HOST || "localhost";

app.listen(PORT, HOST, () => {
  const box = `
  🚀 Server is running
  @ Hoshify

  Host    : ${HOST}
  Port    : ${PORT}
  Network : ${NODE_ENV === "production" ? "https" : "http"}://${HOST}:${PORT}
  `;
  console.log(box);
});
