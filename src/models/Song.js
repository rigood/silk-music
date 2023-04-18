import mongoose from "mongoose";

const TARGET_ARTIST = "진욱";

const songSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  album: {
    type: String,
    default: function () {
      if (this.artist) {
        return this.artist;
      } else {
        return "앨범명 없음";
      }
    },
  },
  coverUrl: {
    type: String,
    default: "/public/client/img/defaultSongCover.png",
  },
  youtubeId: { type: String, required: true },
  playTime: { type: Number, required: true },
  releasedAt: { type: Date, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
  point: {
    type: Number,
    default: function () {
      if (this.artist.includes(TARGET_ARTIST)) return 1;
      else return 0;
    },
  },
  views: { type: Number, default: 0 },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Like" }],
});

const Song = mongoose.model("Song", songSchema);

export default Song;
