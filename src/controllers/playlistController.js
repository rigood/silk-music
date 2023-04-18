import Playlist from "../models/Playlist";
import User from "../models/User";

export const my = async (req, res) => {
  const pageTitle = "내 플레이리스트";

  const {
    session: {
      user: { _id: userId },
    },
  } = req;

  try {
    // 내 플레이리스트 찾기
    const playlists = await Playlist.findById(userId).populate("user");

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

export const playlist = async (req, res) => {
  const { id: playlistId } = req.params;

  try {
    // 해당 플레이리스트 찾기
    const playlist = await Playlist.findById(playlistId)
      .populate("songs")
      .populate("user");

    // 렌더링
    return res.render("playlist/playlist", {
      pageTitle: playlist.name,
      playlist,
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
    await Playlist.create({
      name,
      user,
      coverUrl: coverUrl === "" ? undefined : coverUrl,
    });

    return res.redirect("/my");

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
    return res.json({ ok: false, errorMsg: "로그인이 필요합니다." });
  }

  const {
    session: {
      user: { _id: userId },
    },
  } = req;

  // 내 플레이리스트 목록 반환
  const playlists = await Playlist.find({ user: userId });

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
  const { playlistid, songId } = req.body;

  // 플레이리스트 찾기
  const playlist = await Playlist.findById(playlistid);

  // 노래 삭제
  playlist.songs.splice(playlist.songs.indexOf(songId), 1);
  await playlist.save();

  return res.json({ ok: true });
};

export const getPlaylistSongs = async (req, res) => {
  const { id: playlistId } = req.params;

  // 플레이리스트 찾기
  const playlist = await Playlist.findById(playlistId).populate("songs");

  // 플레이리스트 내 노래 목록 반환
  return res.json({ ok: true, songs: playlist.songs });
};
