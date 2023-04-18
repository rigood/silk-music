import Song from "../models/Song";
import User from "../models/User";
import Playlist from "../models/Playlist";
import Like from "../models/Like";

export const home = async (req, res) => {
  return res.render("home", { pageTitle: "Home" });
};
