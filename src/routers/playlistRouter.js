import express from "express";
import {
  like,
  my,
  playlist,
  getEdit,
  postEdit,
  postDelete,
  getCreate,
  postCreate,
  getAdd,
  postAdd,
  postRemove,
} from "../controllers/playlistController";
import { privateOnlyMiddleware } from "../middlewares";

const playlistRouter = express.Router();

playlistRouter.route("/like").all(privateOnlyMiddleware).get(like);

playlistRouter.route("/my").all(privateOnlyMiddleware).get(my);

playlistRouter.route("/:id([0-9a-f]{24})").get(playlist);

playlistRouter
  .route("/:id([0-9a-f]{24})/edit")
  .all(privateOnlyMiddleware)
  .get(getEdit)
  .post(postEdit);

playlistRouter.route("/delete").all(privateOnlyMiddleware).post(postDelete);

playlistRouter
  .route("/create")
  .all(privateOnlyMiddleware)
  .get(getCreate)
  .post(postCreate);

playlistRouter.route("/add").get(getAdd).post(postAdd);

playlistRouter.route("/remove").all(privateOnlyMiddleware).post(postRemove);

export default playlistRouter;
