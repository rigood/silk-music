import mongoose from "mongoose";

const TARGET_ARTIST = "진욱";

const songSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  album: {
    type: String,
    required: true,
    default: function () {
      return this.artist + " 앨범";
    },
  },
  youtubeId: { type: String, required: true, unique: true },
  coverUrl: {
    type: String,
    required: true,
    default: function () {
      return `https://img.youtube.com/vi/${this.youtubeId}/sddefault.jpg`;
    },
  },
  playTime: { type: Number, required: true },
  releasedAt: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  createdAt: { type: Date, required: true, default: Date.now },
  point: {
    type: Number,
    required: true,
    default: function () {
      if (this.artist.includes(TARGET_ARTIST)) return 1;
      else return 0;
    },
  },
  views: { type: Number, required: true, default: 0 },
  likes: [
    { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Like" },
  ],
});

const Song = mongoose.model("Song", songSchema);

export default Song;
