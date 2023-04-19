import express from "express";
import {
  getSong,
  toggleSongLike,
  registerView,
  getPoint,
} from "../controllers/songController";
import { getPlaylistSongs } from "../controllers/playlistController";

const apiRouter = express.Router();

apiRouter.route("/song/:id([0-9a-f]{24})").get(getSong);

apiRouter.route("/playlist/:id([0-9a-f]{24})").get(getPlaylistSongs);

apiRouter.route("/song/:songId([0-9a-f]{24})/like").post(toggleSongLike);

apiRouter.route("/song/:youtubeId/view").post(registerView);

apiRouter.route("/song/:youtubeId/point").post(getPoint);

export default apiRouter;
