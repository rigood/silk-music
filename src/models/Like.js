import mongoose from "mongoose";

const LikeSchema = new mongoose.Schema({
  user: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  song: { type: mongoose.Types.ObjectId, required: true, ref: "Song" },
  createdAt: { type: Date, required: true, default: Date.now },
});

const Like = mongoose.model("Like", LikeSchema);

export default Like;
