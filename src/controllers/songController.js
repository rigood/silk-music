import Song from "../models/Song";
import User from "../models/User";
import Playlist from "../models/Playlist";
import Like from "../models/Like";

export const home = async (req, res) => {
  const pageTitle = "홈";

  // 인기음악 (조회수 순으로 정렬 후 4곡 반환)
  const popularSongs = await Song.find({ artist: "진욱" })
    .sort({ views: "desc" })
    .limit(4)
    .populate("likes");

  // 최신음악 (발매일, 조회수 순으로 정렬 후 8곡 반환)
  const latestSongs = await Song.find({})
    .sort({ releasedAt: "desc", views: "asc" })
    .populate("likes")
    .limit(8);

  // 로그인 되어 있으면, 좋아요 여부 표시하여 인기음악·최신음악 반환
  const userId = req.session?.user?._id;

  let popularSongsWithLike;
  let latestSongsWithLike;

  if (userId) {
    popularSongsWithLike = popularSongs.map((song) => ({
      song,
      isLiked:
        song.likes?.filter((like) => String(like.user._id) === userId)
          .length === 1
          ? true
          : false,
    }));
    latestSongsWithLike = latestSongs.map((song) => ({
      song,
      isLiked:
        song.likes?.filter((like) => String(like.user._id) === userId)
          .length === 1
          ? true
          : false,
    }));
  } else {
    popularSongsWithLike = popularSongs.map((song) => ({
      song,
      isLiked: false,
    }));
    latestSongsWithLike = latestSongs.map((song) => ({
      song,
      isLiked: false,
    }));
  }

  // 추천 플레이리스트 (닉네임이 rigood인 유저의 플레이리스트)
  const recommendedPlaylists = await Playlist.find({
    user: "6440f301e7c3b7001452611d",
  }).populate("user");

  return res.render("home", {
    pageTitle,
    popularSongs: popularSongsWithLike,
    latestSongs: latestSongsWithLike,
    recommendedPlaylists,
  });
};

export const chart = async (req, res) => {
  const pageTitle = "인기 차트";

  // 조회수, 발매일 순으로 정렬 후 TOP30 곡 반환
  const songs = await Song.find({})
    .sort({ views: "desc", releasedAt: "desc" })
    .populate("likes")
    .limit(30);

  // 로그인 되어 있으면, 좋아요 여부 표시하여 TOP30 곡 반환
  const userId = req.session?.user?._id;

  let songsWithLike;
  if (userId) {
    songsWithLike = songs.map((song) => ({
      song,
      isLiked:
        song.likes?.filter((like) => String(like.user._id) === userId)
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
    pageTitle,
    songs: songsWithLike,
  });
};

export const getSearch = (req, res) => {
  return res.render("search", { pageTitle: "검색" });
};

export const postSearch = async (req, res) => {
  const pageTitle = "검색";

  const { keyword } = req.body;

  // 제목, 아티스트로 검색
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

  // 로그인 되어 있으면, 좋아요 여부 표시하여 검색된 곡 반환
  const userId = req.session?.user?._id;

  let songsWithLike;
  if (userId) {
    songsWithLike = songs.map((song) => ({
      song,
      isLiked:
        song.likes?.filter((like) => String(like.user._id) === userId)
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
    pageTitle,
    keyword,
    songs: songsWithLike,
    count: songs.length,
  });
};

export const getUploadSong = (req, res) => {
  return res.render("uploadSong", { pageTitle: "노래 등록" });
};

export const postUploadSong = async (req, res) => {
  const pageTitle = "노래 등록";

  const { youtubeUrl, youtubeId, title, artist, album, releasedAt, playTime } =
    req.body;

  // 미리보기 하지 않은 경우
  if (!youtubeId || !playTime) {
    req.flash("warning", "미리보기 버튼을 눌러주세요.");
    return res.render("uploadSong", {
      pageTitle,
      youtubeUrl,
      youtubeId,
      title,
      artist,
      album,
      releasedAt,
      playTime,
    });
  }

  // 노래 중복 확인
  const songExists = await Song.findOne({ youtubeId });
  if (songExists) {
    req.flash("error", "이미 DB에 등록된 곡입니다.");
    return res.status(409).render("uploadSong", {
      pageTitle,
      errorMsg: "🚫 이미 DB에 등록된 곡입니다.",
    });
  }

  // 노래 등록
  await Song.create({
    title,
    artist,
    album: album === "" ? undefined : album,
    youtubeId,
    playTime,
    releasedAt: releasedAt === "" ? undefined : releasedAt,
  });

  req.flash("ok", "곡이 등록되었습니다.");
  return res.redirect("/");
};

export const toggleSongLike = async (req, res) => {
  // 유저 확인
  if (!req.session.user) {
    return res.json({ ok: false, errorMsg: "로그인 후 이용해주세요." });
  }

  const {
    params: { songId },
    session: {
      user: { _id: userId },
    },
  } = req;

  // 노래 확인
  const song = await Song.findById(songId);
  if (!song) {
    req.flash("error", "해당 곡이 존재하지 않습니다.");
    return res
      .status(404)
      .json({ ok: false, errorMsg: "해당 곡이 존재하지 않습니다." });
  }

  // 유저 확인
  const user = await User.findById(userId);
  if (!user) {
    req.flash("error", "존재하지 않는 회원입니다.");
    return res
      .status(404)
      .json({ ok: false, errorMsg: "존재하지 않는 회원입니다." });
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

  // 좋아요 개수
  const likes = await Like.find({ song: songId });
  const count = likes.length;

  return res.json({
    ok: true,
    like: like ? true : false,
    count,
  });
};

export const updateSongView = async (req, res) => {
  const { youtubeId } = req.params;

  // 노래 확인
  const song = await Song.findOne({ youtubeId });
  if (!song) {
    return res.sendStatus(404);
  }

  // 조회수 증가
  song.views += 1;
  await song.save();

  return res.sendStatus(200);
};

export const addPoint = async (req, res) => {
  // 유저 확인
  if (!req.session.user) {
    return res.end();
  }

  const {
    params: { youtubeId },
    session: {
      user: { _id: userId },
    },
  } = req;

  // 유저 확인
  const user = await User.findById(userId);
  if (!user) {
    return res.sendStatus(404);
  }

  // 노래 확인
  const song = await Song.findOne({ youtubeId });
  if (!song) {
    return res.sendStatus(404);
  }

  // 포인트 추가
  const point = song.point;

  if (point === 0) {
    return res.end();
  }

  user.points = user.points + point;
  await user.save();

  return res.sendStatus(200);
};

export const getSong = async (req, res) => {
  const { songId } = req.params;

  // 노래 확인
  const song = await Song.findById(songId);
  if (!song) {
    return res.status(404).json({ ok: false });
  }

  return res.json({ ok: true, song });
};
