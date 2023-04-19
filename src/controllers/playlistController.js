import Playlist from "../models/Playlist";
import User from "../models/User";
import Song from "../models/Song";

export const my = async (req, res) => {
  const pageTitle = "내 플레이리스트";

  const {
    session: {
      user: { _id: userId },
    },
  } = req;

  try {
    // 내 플레이리스트 찾기
    const playlists = await Playlist.find({ user: userId })
      .populate("user")
      .sort({ createdAt: "desc" });

    // 렌더링
    return res.render("playlist/my", { pageTitle, playlists });

    // 에러 핸들링
  } catch (error) {
    console.log("❌ 내 플레이리스트 오류 발생 : ", error);

    req.flash(
      "error",
      "서버 오류로 인해 페이지에 접근할 수 없습니다.\n잠시 후 다시 시도해주세요."
    );
    return res.redirect("/");
  }
};

export const like = async (req, res) => {
  const pageTitle = "좋아요 누른 곡";

  const {
    session: {
      user: { _id: userId },
    },
  } = req;

  const user = await User.findById(userId);
  const likes = user.likes;

  const songs = await Song.find({ likes: { $in: likes } }).populate("likes");

  let songsWithLike = songs.map((song) => ({
    song,
    isLiked:
      song.likes?.filter((like) => String(like?.user?._id) === String(userId))
        .length === 1
        ? true
        : false,
  }));

  return res.render("playlist/like", { pageTitle, songs: songsWithLike });
};

export const playlist = async (req, res) => {
  const { id: playlistId } = req.params;

  try {
    // 해당 플레이리스트 찾기
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

    // 로그인 되어있으면, 좋아요 여부 표시하여 플레이리스트 노래 목록 반환
    const userId = req.session?.user?._id;

    let songsWithLike;
    let playlistWithSongsLiked = JSON.parse(JSON.stringify(playlist));

    if (userId) {
      songsWithLike = playlistWithSongsLiked.songs.map((song) => ({
        song,
        isLiked:
          song.likes?.filter(
            (like) => String(like?.user?._id) === String(userId)
          ).length === 1
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

    // 렌더링
    return res.render("playlist/playlist", {
      pageTitle: playlist.name,
      playlist: playlistWithSongsLiked,
    });

    // 에러 핸들링
  } catch (error) {
    console.log("❌ 플레이리스트 페이지 오류 발생 : ", error);

    req.flash(
      "error",
      "서버 오류로 인해 페이지에 접근할 수 없습니다.\n잠시 후 다시 시도해주세요."
    );
    return res.redirect("/");
  }
};

export const getCreate = (req, res) => {
  return res.render("playlist/create", { pageTitle: "새 플레이리스트 추가" });
};

export const postCreate = async (req, res) => {
  const {
    session: {
      user: { _id: userId },
    },
    body: { name, coverUrl },
  } = req;

  try {
    // 유저 확인
    const user = await User.findById(userId);
    if (!user) {
      req.flash("error", "잘못된 접근입니다.");
      return res.redirect("/");
    }

    // 플레이리스트 생성
    const playlist = await Playlist.create({
      name,
      user,
      coverUrl: coverUrl === "" ? undefined : coverUrl,
    });

    await user.playlists.push(playlist);
    await user.save();

    return res.redirect("/playlist/my");

    // 에러 핸들링
  } catch (error) {
    console.log("❌ 새 플레이리스트 추가 오류 발생 : ", error);

    return res.status(500).render("playlist/create", {
      pageTitle,
      errorMsg: "서버 오류로 인해 실패했습니다.",
    });
  }
};

export const getAdd = async (req, res) => {
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

export const postAdd = async (req, res) => {
  const { playlistId, songId } = req.body;

  // 플레이리스트 찾기
  const playlist = await Playlist.findById(playlistId).populate("songs");

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

export const postRemove = async (req, res) => {
  const { playlistId, songId } = req.body;

  try {
    // 플레이리스트 찾기
    const playlist = await Playlist.findById(playlistId);

    // 노래 삭제
    playlist.songs.splice(playlist.songs.indexOf(songId), 1);
    await playlist.save();

    return res.json({ ok: true });

    // 에러 핸들링
  } catch (error) {
    console.log("❌ 플레이리스트로부터 곡 제거 오류 발생 : ", error);

    return res.json({
      ok: false,
      errorMsg: "서버 오류로 인해 실패했습니다.\n잠시 후 다시 시도해주세요.",
    });
  }
};

export const getPlaylistSongs = async (req, res) => {
  const { id: playlistId } = req.params;

  // 플레이리스트 찾기
  const playlist = await Playlist.findById(playlistId).populate("songs");

  // 플레이리스트 내 노래 목록 반환
  return res.json({ ok: true, songs: playlist.songs });
};
