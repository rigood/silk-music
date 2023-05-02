import express from "express";
import {
  likedPlaylist,
  myPlaylist,
  playlistPage,
  getCreatePlaylist,
  postCreatePlaylist,
  getEditPlaylist,
  postEditPlaylist,
  postDeletePlaylist,
} from "../controllers/playlistController";
import { privateOnlyMiddleware } from "../middlewares";

const playlistRouter = express.Router();

playlistRouter.route("/like").all(privateOnlyMiddleware).get(likedPlaylist);

playlistRouter.route("/my").all(privateOnlyMiddleware).get(myPlaylist);

playlistRouter.route("/:playlistId([0-9a-f]{24})").get(playlistPage);

playlistRouter
  .route("/create")
  .all(privateOnlyMiddleware)
  .get(getCreatePlaylist)
  .post(postCreatePlaylist);

playlistRouter
  .route("/:playlistId([0-9a-f]{24})/edit")
  .all(privateOnlyMiddleware)
  .get(getEditPlaylist)
  .post(postEditPlaylist);

playlistRouter
  .route("/:playlistId([0-9a-f]{24})/delete")
  .all(privateOnlyMiddleware)
  .post(postDeletePlaylist);

export default playlistRouter;
