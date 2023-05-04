import express from "express";
import {
  toggleSongLike,
  updateSongView,
  addPoint,
  getSong,
} from "../controllers/songController";
import {
  getAddSongToPlaylist,
  postAddSongToPlaylist,
  postRemoveSongFromPlaylist,
  getPlaylistSongs,
} from "../controllers/playlistController";
import { privateOnlyMiddleware } from "../middlewares";

const apiRouter = express.Router();

apiRouter.route("/song/:songId([0-9a-f]{24})/like").post(toggleSongLike);

apiRouter.route("/song/:youtubeId/view").post(updateSongView);

apiRouter.route("/song/:youtubeId/point").post(addPoint);

apiRouter.route("/song/:songId([0-9a-f]{24})").get(getSong);

apiRouter
  .route("/playlist/add-song")
  .get(getAddSongToPlaylist)
  .post(postAddSongToPlaylist);

apiRouter
  .route("/playlist/remove-song")
  .all(privateOnlyMiddleware)
  .post(postRemoveSongFromPlaylist);

apiRouter.route("/playlist/:playlistId([0-9a-f]{24})").get(getPlaylistSongs);

export default apiRouter;
