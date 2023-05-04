import Playlist from "../models/Playlist";
import User from "../models/User";
import Song from "../models/Song";

export const likedPlaylist = async (req, res) => {
  const pageTitle = "좋아요 누른 곡";

  const {
    session: {
      user: { _id: userId },
    },
  } = req;

  // 유저 확인
  const user = await User.findById(userId);
  if (!user) {
    req.flash("error", "존재하지 않는 회원입니다.");
    return res.redirect("/");
  }

  // 좋아요 누른 곡 찾기
  const likes = user.likes;

  const songs = await Song.find({ likes: { $in: likes } })
    .populate("likes")
    .sort({ views: "desc" });

  let songsWithLike = songs.map((song) => ({
    song,
    isLiked:
      song.likes?.filter((like) => String(like.user._id) === userId).length ===
      1
        ? true
        : false,
  }));

  return res.render("playlist/likedPlaylist", {
    pageTitle,
    songs: songsWithLike,
  });
};

export const myPlaylist = async (req, res) => {
  const pageTitle = "내 플레이리스트";

  const {
    session: {
      user: { _id: userId },
    },
  } = req;

  // 유저 확인
  const user = await User.findById(userId);
  if (!user) {
    req.flash("error", "존재하지 않는 회원입니다.");
    return res.redirect("/");
  }

  // 생성일 순으로 정렬
  const playlists = await Playlist.find({ user: userId })
    .populate("user")
    .sort({ createdAt: "desc" });

  return res.render("playlist/myPlaylist", { pageTitle, playlists });
};

export const playlistPage = async (req, res) => {
  const { playlistId } = req.params;

  // 플레이리스트 확인
  const playlist = await Playlist.findById(playlistId)
    .populate({
      path: "songs",
      populate: {
        path: "likes",
        model: "Like",
        populate: {
          path: "user",
          model: "User",
        },
      },
    })
    .populate("user");

  if (!playlist) {
    req.flash("error", "존재하지 않는 플레이리스트입니다.");
    return res.redirect("/");
  }

  // 로그인 되어 있으면, 좋아요 여부 표시하여 플레이리스트 노래 목록 반환
  const userId = req.session?.user?._id;

  let songsWithLike;
  let playlistWithSongsLiked = JSON.parse(JSON.stringify(playlist));

  if (userId) {
    songsWithLike = playlistWithSongsLiked.songs.map((song) => ({
      song,
      isLiked:
        song.likes?.filter((like) => String(like.user._id) === userId)
          .length === 1
          ? true
          : false,
    }));
  } else {
    songsWithLike = playlistWithSongsLiked.songs.map((song) => ({
      song,
      isLiked: false,
    }));
  }
  playlistWithSongsLiked.songs = songsWithLike;

  return res.render("playlist/playlistPage", {
    pageTitle: playlist.name,
    playlist: playlistWithSongsLiked,
  });
};

export const getCreatePlaylist = (req, res) => {
  return res.render("playlist/createPlaylist", {
    pageTitle: "새 플레이리스트 만들기",
  });
};

export const postCreatePlaylist = async (req, res) => {
  const {
    session: {
      user: { _id: userId },
    },
    body: { name, coverUrl },
  } = req;

  // 유저 확인
  const user = await User.findById(userId);
  if (!user) {
    req.flash("error", "존재하지 않는 회원입니다.");
    return res.redirect("/");
  }

  // 플레이리스트 커버 이미지 주소 확인
  const regExp =
    /(https:\/\/)([^\s(["<,>/]*)(\/)[^\s[",><]*(.png|.jpg|.jpeg|.gif|.webp|.svg)(\?[^\s[",><]*)?/;

  const isCoverUrlValid = coverUrl.match(regExp);

  // 플레이리스트 생성
  const playlist = await Playlist.create({
    name,
    user,
    coverUrl: isCoverUrlValid ? coverUrl : undefined,
  });

  await user.playlists.push(playlist);
  await user.save();

  return res.redirect("/playlist/my");
};

export const getEditPlaylist = async (req, res) => {
  const pageTitle = "플레이리스트 편집";

  const {
    params: { playlistId },
    session: {
      user: { _id: userId },
    },
  } = req;

  // 플레이리스트 확인
  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    req.flash("error", "존재하지 않는 플레이리스트입니다.");
    return res.redirect("/playlist/my");
  }

  // 유저 확인
  if (userId !== String(playlist.user._id)) {
    req.flash("error", "잘못된 접근입니다.");
    return res.redirect("/");
  }

  return res.render("playlist/editPlaylist", { pageTitle, playlist });
};

export const postEditPlaylist = async (req, res) => {
  const {
    params: { playlistId },
    body: { name, coverUrl },
  } = req;

  // 플레이리스트 커버 이미지 주소 확인
  const regExp =
    /(https:\/\/)([^\s(["<,>/]*)(\/)[^\s[",><]*(.png|.jpg|.jpeg|.gif|.webp|.svg)(\?[^\s[",><]*)?/;

  const isCoverUrlValid = coverUrl.match(regExp);

  const defaultCoverUrl = "/public/client/img/defaultPlaylistCover.png";

  // 플레이리스트 업데이트
  const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId, {
    name,
    coverUrl: isCoverUrlValid ? coverUrl : defaultCoverUrl,
  });

  // 플레이리스트 확인
  if (!updatedPlaylist) {
    req.flash("error", "존재하지 않는 플레이리스트입니다.");
    return res.redirect("/playlist/my");
  }

  req.flash("ok", "플레이리스트가 수정되었습니다.");
  return res.redirect(`/playlist/${playlistId}`);
};

export const postDeletePlaylist = async (req, res) => {
  const {
    params: { playlistId },
    session: {
      user: { _id: userId },
    },
  } = req;

  // 플레이리스트 확인
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    req.flash("error", "이미 삭제되었거나 존재하지 않는 플레이리스트입니다.");
    return res.redirect("/playlist/my");
  }

  // 유저 확인
  const user = await User.findById(userId);
  if (!user) {
    req.flash("error", "존재하지 않는 회원입니다.");
    return res.redirect("/");
  }

  // 기본 플레이리스트 삭제 불가
  if (playlist.isDefault) {
    req.flash(
      "warning",
      "회원가입 시 자동으로 부여된\n기본 플레이리스트는 삭제할 수 없습니다."
    );
    return res.redirect("/playlist/my");
  }

  // 플레이리스트 삭제
  await Playlist.findByIdAndDelete(playlistId);

  await user.playlists.splice(user.playlists.indexOf(playlistId), 1);
  await user.save();

  req.flash("ok", "플레이리스트가 삭제되었습니다.");
  return res.redirect("/playlist/my");
};

export const getAddSongToPlaylist = async (req, res) => {
  // 유저 확인
  if (!req.session.user) {
    return res.json({ ok: false, errorMsg: "로그인 후 이용해주세요." });
  }

  const {
    session: {
      user: { _id: userId },
    },
  } = req;

  // 내 플레이리스트 목록 반환
  const playlists = await Playlist.find({ user: userId }).sort({
    createdAt: "desc",
  });

  return res.json({ ok: true, playlists });
};

export const postAddSongToPlaylist = async (req, res) => {
  const { playlistId, songId } = req.body;

  // 플레이리스트 확인
  const playlist = await Playlist.findById(playlistId).populate("songs");

  if (!playlist) {
    return res.json({
      ok: false,
      errorMsg: "존재하지 않는 플레이리스트입니다.",
    });
  }

  // 플레이리스트 내 노래 중복 확인
  const songExists = playlist.songs.some(
    (song) => song._id.toString() === songId
  );

  if (songExists) {
    return res.json({ ok: false, errorMsg: "이미 추가된 곡입니다." });
  }

  // 중복 없으면 저장
  await playlist.songs.push(songId);
  await playlist.save();

  return res.json({ ok: true });
};

export const postRemoveSongFromPlaylist = async (req, res) => {
  const { playlistId, songId } = req.body;

  // 플레이리스트 확인
  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    return res.json({
      ok: false,
      errorMsg: "존재하지 않는 플레이리스트입니다.",
    });
  }

  // 노래 삭제
  playlist.songs.splice(playlist.songs.indexOf(songId), 1);
  await playlist.save();

  return res.json({ ok: true });
};

export const getPlaylistSongs = async (req, res) => {
  const { playlistId } = req.params;

  // 플레이리스트 확인
  const playlist = await Playlist.findById(playlistId).populate("songs");

  if (!playlist) {
    return res.json({
      ok: false,
      errorMsg: "존재하지 않는 플레이리스트입니다.",
    });
  }

  // 플레이리스트 내 노래 목록 반환
  return res.json({ ok: true, songs: playlist.songs });
};
