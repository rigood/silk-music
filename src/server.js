import express from "express";
import "express-async-errors";
import morgan from "morgan";
import session from "express-session";
import MongoStore from "connect-mongo";
import flash from "express-flash";
import { localsMiddleware } from "./middlewares";

import rootRouter from "./routers/rootRouter";
import userRouter from "./routers/userRouter";
import playlistRouter from "./routers/playlistRouter";
import apiRouter from "./routers/apiRouter";

const app = express();

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const logger = morgan("dev");
app.use(logger);

app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
  })
);

app.use(flash());

app.use(localsMiddleware);

app.use("/static", express.static("assets"));
app.use("/public", express.static("src"));

app.use("/", rootRouter);
app.use("/user", userRouter);
app.use("/playlist", playlistRouter);
app.use("/api", apiRouter);

app.use(function (req, res, next) {
  res.status(404).render("error", {
    pageTitle: "에러",
    message: "페이지를 찾을 수 없습니다.",
  });
});

app.use(function (err, req, res, next) {
  console.error(`💥 에러 발생 \n ${err.stack}`);
  res.status(500).render("error", {
    pageTitle: "오류",
    message: "서버 오류가 발생하였습니다.",
  });
});

export default app;
