/// <reference path="./types/global.d.ts" />
import { config } from "dotenv";
config();
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import cookieParser from "cookie-parser";
import router from "./routes";
import { connectDB, URI } from "./utils/database/connectDB";
import passport from "passport";
import { resMiddleware } from "./middlewares/res";
import session from "express-session";
import MongoStore from "connect-mongo";
import "./services/auth/passport";
import "./utils/extends";
import "./utils/database/extends";

export const { NODE_ENV, HOSHIFY_ICON, ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } = process.env;
export const CLIENT_URL = NODE_ENV === "development" ? process.env.CLIENT_URL_DEV : process.env.CLIENT_URL;

const app = express();
connectDB();
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
    windowMs: 60 * 1000,
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
    store: MongoStore.create({ mongoUrl: URI! }),
  })
);
app.use(passport.initialize());
app.use(resMiddleware);

app.use("/api", router);

const PORT = parseInt(process.env.PORT || "5000");
const HOST = process.env.HOST || "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Accessible on network via http://${HOST}:${PORT} (or your actual network IP)`);
});
