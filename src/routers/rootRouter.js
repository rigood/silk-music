import express from "express";
import {
  home,
  chart,
  getSearch,
  postSearch,
} from "../controllers/songController";
import {
  getJoin,
  postJoin,
  getLogin,
  postLogin,
} from "../controllers/userController";
import { publicOnlyMiddleware } from "../middlewares";

const rootRouter = express.Router();

rootRouter.route("/").get(home);

rootRouter.route("/chart").get(chart);

rootRouter.route("/search").get(getSearch).post(postSearch);

rootRouter.route("/join").all(publicOnlyMiddleware).get(getJoin).post(postJoin);

rootRouter
  .route("/login")
  .all(publicOnlyMiddleware)
  .get(getLogin)
  .post(postLogin);

export default rootRouter;
