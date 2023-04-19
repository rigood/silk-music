import Song from "../models/Song";
import User from "../models/User";
import Playlist from "../models/Playlist";
import Like from "../models/Like";

export const home = async (req, res) => {
  // 인기음악 (조회수 기준 정렬)
  const popularSongs = await Song.find({ artist: "진욱" })
    .sort({ views: "desc" })
    .limit(5)
    .populate("likes");

  // 최신음악 (발매일, 조회수 기준 정렬)
  const latestSongs = await Song.find({})
    .sort({ releasedAt: "desc", views: "asc" })
    .limit(9)
    .populate("likes");

  // 로그인 되어있으면, 좋아요 여부 표시하여 최신음악 반환
  const userId = req.session?.user?._id;

  let popularSongsWithLike = popularSongs;
  if (userId) {
    popularSongsWithLike = popularSongs.map((song) => ({
      song,
      isLiked:
        song.likes?.filter((like) => String(like?.user?._id) === String(userId))
          .length === 1
          ? true
          : false,
    }));
  } else {
    popularSongsWithLike = popularSongs.map((song) => ({
      song,
      isLiked: false,
    }));
  }

  let latestSongsWithLike = latestSongs;
  if (userId) {
    latestSongsWithLike = latestSongs.map((song) => ({
      song,
      isLiked:
        song.likes?.filter((like) => String(like?.user?._id) === String(userId))
          .length === 1
          ? true
          : false,
    }));
  } else {
    latestSongsWithLike = latestSongs.map((song) => ({
      song,
      isLiked: false,
    }));
  }

  // 추천 플레이리스트
  const recommendedPlaylists = await Playlist.find({}).populate("user");

  return res.render("home", {
    pageTitle: "홈",
    popularSongs: popularSongsWithLike,
    latestSongs: latestSongsWithLike,
    recommendedPlaylists,
  });
};

export const chart = async (req, res) => {
  // 조회수, 발매일 기준 정렬 후 노래 목록 반환
  const songs = await Song.find({})
    .sort({ views: "desc", releasedAt: "desc" })
    .populate("likes");

  // 로그인 되어있으면, 좋아요 여부 표시하여 노래 목록 반환
  const userId = req.session?.user?._id;

  let songsWithLike = songs;
  if (userId) {
    songsWithLike = songs.map((song) => ({
      song,
      isLiked:
        song.likes?.filter((like) => String(like?.user?._id) === String(userId))
          .length === 1
          ? true
          : false,
    }));
  } else {
    songsWithLike = songs.map((song) => ({
      song,
      isLiked: false,
    }));
  }

  return res.render("chart", {
    pageTitle: "인기 차트",
    songs: songsWithLike,
  });
};

export const getSearch = (req, res) => {
  return res.render("search", { pageTitle: "검색" });
};

export const postSearch = async (req, res) => {
  const { keyword } = req.body;

  // 검색어 없는 경우
  if (!keyword) {
    req.flash("error", "검색어를 입력해주세요.");
    return res.redirect("/search");
  }

  // 제목, 아티스트로 노래 검색
  const songs = await Song.find({
    $or: [
      {
        title: {
          $regex: new RegExp(keyword, "i"),
        },
      },
      {
        artist: {
          $regex: new RegExp(keyword, "i"),
        },
      },
    ],
  }).populate("likes");

  // 검색된 곡 개수
  const count = songs.length;

  // 로그인 , 좋아요 여부 표시하여 노래 목록 반환
  const userId = req.session?.user?._id;

  let songsWithLike = songs;
  if (userId) {
    songsWithLike = songs.map((song) => ({
      song,
      isLiked:
        song.likes?.filter((like) => String(like?.user?._id) === userId)
          .length === 1
          ? true
          : false,
    }));
  } else {
    songsWithLike = songs.map((song) => ({
      song,
      isLiked: false,
    }));
  }

  return res.render("search", {
    pageTitle: "검색 결과",
    keyword,
    songs: songsWithLike,
    count,
  });
};

export const getSong = async (req, res) => {
  const { id: songId } = req.params;

  // 노래 찾기
  const song = await Song.findById(songId);

  if (!song) {
    return res.status(404).json({ ok: false });
  }

  return res.json({ ok: true, song });
};

export const toggleSongLike = async (req, res) => {
  // 유저 확인
  if (!req.session.user) {
    return res.json({ ok: false, errorMsg: "로그인 후 이용해주세요." });
  }

  const {
    session: {
      user: { _id: userId },
    },
    params: { songId },
  } = req;

  const song = await Song.findById(songId);
  const user = await User.findById(userId);

  if (!song) {
    req.flash("error", "해당 곡이 존재하지 않습니다.");
    return res.redirect("/");
  }

  if (!user) {
    req.flash("error", "잘못된 접근입니다.");
    return res.redirect("/");
  }

  // 좋아요 찾기
  let like = await Like.findOne({ $and: [{ song: songId }, { user: userId }] });

  // 좋아요 생성
  if (!like) {
    like = await Like.create({
      user: userId,
      song: songId,
    });

    await song.likes.push(like._id);
    await song.save();
    await user.likes.push(like._id);
    await user.save();

    // 좋아요 삭제
  } else {
    await Like.findOneAndDelete({ $and: [{ song: songId }, { user: userId }] });

    await song.likes.splice(song.likes.indexOf(like._id), 1);
    await song.save();
    await user.likes.splice(user.likes.indexOf(like._id), 1);
    await user.save();
    like = null;
  }

  // 좋아요 개수 반환
  const likes = await Like.find({ song: songId });
  const count = likes.length;

  return res.status(200).json({
    ok: true,
    like: like ? true : false,
    count,
  });
};

export const registerView = async (req, res) => {
  const { youtubeId } = req.params;

  const song = await Song.findOne({ youtubeId });

  if (!song) {
    return res.sendStatus(404).json({ ok: false });
  }

  song.views += 1;
  await song.save();

  return res.status(200).json({ ok: true, views: song.views });
};

export const getPoint = async (req, res) => {
  // 유저 확인
  if (!req.session.user) {
    return res.json({ ok: false });
  }

  const {
    session: {
      user: { _id: userId },
    },
    params: { youtubeId },
  } = req;

  const user = await User.findById(userId);
  const song = await Song.findOne({ youtubeId });

  if (!song || !user) {
    return res.json({ ok: false });
  }

  const point = song.point;

  if (point === 0) {
    return res.json({ ok: false });
  }

  user.points = user.points + point;
  await user.save();

  return res.status(200).json({ ok: true });
};

export const getAddSong = async (req, res) => {
  const pageTitle = "곡 등록";

  return res.render("add-song", { pageTitle });
};

export const postAddSong = async (req, res) => {
  const pageTitle = "곡 등록";

  const { youtubeId, title, artist, album, releasedAt, playTime } = req.body;

  const songExists = await Song.findOne({ youtubeId: youtubeId });

  if (songExists) {
    return res.status(409).render("add-song", {
      pageTitle,
      errorMsg: "😂 이미 DB에 등록된 곡입니다.",
      ok: false,
    });
  }

  await Song.create({
    title,
    artist,
    album: album || artist,
    coverUrl: `https://img.youtube.com/vi/${youtubeId}/sddefault.jpg`,
    youtubeId,
    playTime,
    releasedAt: releasedAt || Date.now(),
  });

  req.flash("ok", "곡이 정상적으로 등록되었습니다.");
  return res.redirect("/");
};
