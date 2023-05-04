import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minLength: 4 },
  name: {
    type: String,
    required: true,
    minLength: 1,
    maxLength: 10,
    default: function () {
      return this.email.split("@")[0].substring(0, 10);
    },
  },
  avatarUrl: { type: String, required: true },
  points: { type: Number, required: true, default: 0 },
  createdAt: { type: Date, required: true, default: Date.now },
  playlists: [
    { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Playlist" },
  ],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Like" }],
});

userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 5);
  }
});

const User = mongoose.model("User", userSchema);

export default User;
