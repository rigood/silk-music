import express from "express";
import { getSong, toggleSongLike } from "../controllers/songController";
import { getPlaylistSongs } from "../controllers/playlistController";

const apiRouter = express.Router();

apiRouter.route("/song/:id([0-9a-f]{24})").get(getSong);

apiRouter.route("/playlist/:id([0-9a-f]{24})").get(getPlaylistSongs);

apiRouter.route("/song/:id([0-9a-f]{24})/like").post(toggleSongLike);

export default apiRouter;
