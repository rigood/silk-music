import express from "express";
import {
  home,
  chart,
  getSearch,
  postSearch,
  getAddSong,
  postAddSong,
} from "../controllers/songController";
import {
  getJoin,
  postJoin,
  getLogin,
  postLogin,
  rank,
} from "../controllers/userController";
import { publicOnlyMiddleware } from "../middlewares";

const rootRouter = express.Router();

rootRouter.route("/").get(home);

rootRouter.route("/chart").get(chart);

rootRouter.route("/search").get(getSearch).post(postSearch);

rootRouter.route("/add-song").get(getAddSong).post(postAddSong);

rootRouter.route("/join").all(publicOnlyMiddleware).get(getJoin).post(postJoin);

rootRouter
  .route("/login")
  .all(publicOnlyMiddleware)
  .get(getLogin)
  .post(postLogin);

rootRouter.route("/rank").get(rank);

export default rootRouter;
