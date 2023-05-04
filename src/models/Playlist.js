import mongoose from "mongoose";

const PlaylistSchema = new mongoose.Schema({
  name: { type: String, required: true, minLength: 1, maxLength: 20 },
  user: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  coverUrl: {
    type: String,
    required: true,
    default: "/public/client/img/defaultPlaylistCover.png",
  },
  isDefault: { type: Boolean, default: false },
  createdAt: { type: Date, required: true, default: Date.now },
  songs: [
    { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Song" },
  ],
});

const Playlist = mongoose.model("Playlist", PlaylistSchema);

export default Playlist;
