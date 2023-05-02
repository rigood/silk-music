import User from "../models/User";
import Playlist from "../models/Playlist";
import bcrypt from "bcrypt";

export const getJoin = (req, res) =>
  res.render("user/join", { pageTitle: "회원가입" });

export const postJoin = async (req, res) => {
  const pageTitle = "회원가입";

  const { email, password, name, avatarUrl } = req.body;

  // 이메일 중복 확인
  const emailExists = await User.exists({ email });
  if (emailExists) {
    req.flash("error", "이미 가입된 메일입니다.");
    return res.status(409).render("user/join", {
      pageTitle,
      errorMsg: "🚫 이미 가입된 이메일입니다.",
      email,
    });
  }

  // 유저 생성
  const user = await User.create({
    email,
    password,
    name: name === "" ? undefined : name,
    avatarUrl,
  });

  // 기본 플레이리스트 생성
  const defaultPlaylist = await Playlist.create({
    name: "기본 플레이리스트",
    user,
    coverUrl: undefined,
    isDefault: true,
  });
  await user.playlists.push(defaultPlaylist);
  await user.save();

  // 로그인 페이지로 이동
  req.flash("ok", "회원가입이 완료되었습니다.\n로그인 화면으로 이동합니다.");
  return res.redirect("/login");
};

export const getLogin = (req, res) =>
  res.render("user/login", { pageTitle: "로그인" });

export const postLogin = async (req, res) => {
  const pageTitle = "로그인";

  const { email, password } = req.body;

  // 유저 확인
  const user = await User.findOne({ email });
  if (!user) {
    req.flash("error", "존재하지 않는 이메일입니다.");
    return res.status(401).render("user/login", {
      pageTitle,
      errorMsg: "🚫 존재하지 않는 이메일입니다.",
      email,
    });
  }

  // 비밀번호 확인
  const pwMatch = await bcrypt.compare(password, user.password);
  if (!pwMatch) {
    req.flash("error", "비밀번호가 일치하지 않습니다.");
    return res.status(401).render("user/login", {
      pageTitle,
      errorMsg: "🚫 비밀번호가 일치하지 않습니다.",
      email,
    });
  }

  // 세션 저장 후 메인 페이지로 이동
  req.session.loggedIn = true;
  req.session.user = user;

  req.flash("ok", "환영합니다.");
  return res.redirect("/");
};

export const rank = async (req, res) => {
  const pageTitle = "스트리밍 랭킹";

  // 포인트, 가입일 순으로 정렬
  const members = await User.find({}).sort({
    points: "desc",
    createdAt: "desc",
  });

  return res.render("rank", { pageTitle, members });
};

export const logout = (req, res) => {
  req.session.destroy();
  return res.redirect("/");
};

export const getEdit = (req, res) => {
  return res.render("user/edit", { pageTitle: "프로필 수정" });
};

export const postEdit = async (req, res) => {
  const {
    session: {
      user: { _id: userId },
    },
    body: { avatarUrl, name },
  } = req;

  // 프로필 업데이트
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      avatarUrl,
      name,
    },
    { new: true }
  );

  // 유저 확인
  if (!updatedUser) {
    req.flash("error", "존재하지 않는 회원입니다.");
    return res.redirect("/");
  }

  // 세션 저장 후 메인 페이지로 이동
  req.session.user = updatedUser;

  req.flash("ok", "프로필이 수정되었습니다.");
  return res.redirect("/");
};

export const postChangePw = async (req, res) => {
  const pageTitle = "프로필 수정";

  const {
    session: {
      user: { _id: userId },
    },
    body: { oldPw, newPw },
  } = req;

  // 유저 확인
  const user = await User.findById(userId);
  if (!user) {
    req.flash("error", "존재하지 않는 회원입니다.");
    return res.redirect("/");
  }

  // 기존 비밀번호 확인
  const pwMatch = await bcrypt.compare(oldPw, user.password);
  if (!pwMatch) {
    req.flash("error", "기존 비밀번호가 일치하지 않습니다.");
    return res.status(401).render("user/edit", {
      pageTitle,
      errorMsg: "🚫 기존 비밀번호가 일치하지 않습니다.",
    });
  }

  // 새 비밀번호 확인
  if (oldPw === newPw) {
    req.flash("error", "기존 비밀번호와 새 비밀번호가 동일합니다.");
    return res.status(409).render("user/edit", {
      pageTitle,
      errorMsg: "🚫 기존 비밀번호와 새 비밀번호가 동일합니다.",
    });
  }

  // 비밀번호 업데이트
  user.password = newPw;
  await user.save();

  // 세션 초기화 후 로그인 페이지로 이동
  req.session.user = null;
  req.session.loggedIn = false;

  req.flash("ok", "비밀번호가 변경되었습니다.\n다시 로그인 해주세요.");
  return res.redirect("/login");
};
