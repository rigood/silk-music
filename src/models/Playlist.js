import mongoose from "mongoose";

const PlaylistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  user: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  coverUrl: {
    type: String,
    default: "/public/client/img/defaultPlaylistCover.png",
  },
  isDefault: { type: Boolean, default: false },
  createdAt: { type: Date, required: true, default: Date.now },
  songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
});

const Playlist = mongoose.model("Playlist", PlaylistSchema);

export default Playlist;
