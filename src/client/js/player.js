import "regenerator-runtime";
import defaultTracks from "../data/defaultTracks.json";

const APP_KEY = "silk_music";
const APP_VOLUME = "silk_music_volume";
const APP_THEME = "silk_music_theme";
let currentVolume;

// 플레이어 선택
const player = document.getElementById("player");
const screen = document.getElementById("screen");
const controller = document.getElementById("controller");

// info 관련 요소 선택
const cover = controller.querySelector("#cover");
const title = controller.querySelector("#title");
const artist = controller.querySelector("#artist");

// control 관련 요소 선택
const randomBtn = controller.querySelector("#randomBtn");
const prevBtn = controller.querySelector("#prevBtn");
const playBtn = controller.querySelector("#playBtn");
const nextBtn = controller.querySelector("#nextBtn");
const repeatBtn = controller.querySelector("#repeatBtn");

// time, progress 관련 요소 선택
const currentTime = controller.querySelector("#currentTime");
const duration = controller.querySelector("#duration");
const progressArea = controller.querySelector(".progress-area");
const progressBar = controller.querySelector("#progressBar");
const timeTooltip = controller.querySelector("#timeTooltip");

// volume 관련 요소 선택
const volumeBtn = controller.querySelector("#volumeBtn");
const volumeBarArea = controller.querySelector("#volumeBar-area");
const volumeBar = controller.querySelector("#volumeBar");

// 플레이어 toggle 아이콘 선택
const bar1 = controller.querySelector("#bar1");
const bar2 = controller.querySelector("#bar2");
const bar3 = controller.querySelector("#bar3");

// 플레이리스트 선택
const screenToggleBtn = screen.querySelector("#screenToggleBtn");
const playlist = screen.querySelector("#playlist");

// 시간 변환
function formatTime(seconds) {
  if (seconds < 3600) {
    return new Date(seconds * 1000).toISOString().slice(14, 19);
  } else {
    return new Date(seconds * 1000).toISOString().slice(11, 19);
  }
}

// localStorage 데이터 불러오기
function getLocal() {
  return JSON.parse(localStorage.getItem(APP_KEY));
}

// localStorage 데이터 불러오기 (테마)
function getLocalTheme() {
  return localStorage.getItem(APP_THEME);
}

// localStorage 데이터 저장하기
function setLocal(data) {
  return localStorage.setItem(APP_KEY, JSON.stringify(data));
}

// 노래 불러오기
function loadTracks() {
  let config, nowTrack, tracks;
  const local = getLocal();

  if (local) {
    tracks = local.tracks;
    const nowTrack = local.nowTrack;

    cover.src = nowTrack.targetTrack.coverUrl;
    title.innerText = nowTrack.targetTrack.title;
    artist.innerText = nowTrack.targetTrack.artist;
    duration.innerText = formatTime(nowTrack.targetTrack.playTime);
  } else {
    config = {
      isRandom: false,
      repeat: "off",
      isPlay: false,
      isPause: false,
      isBuffer: false,
      nowTime: 0,
      totalTime: 0,
    };
    nowTrack = {
      targetTrack: defaultTracks[0],
      trackIndex: 0,
    };
    tracks = defaultTracks;

    const data = { config, nowTrack, tracks };
    setLocal(data);

    localStorage.setItem(APP_VOLUME, 50);

    cover.src = "/public/client/img/defaultSongCover.png";
    title.innerText = "오늘 뭐 듣지?";
    artist.innerText = "플레이어를 열고 음악을 감상해보세요.";
  }

  tracks.forEach((track) => addTrack(track));

  updateVolume();
  updateRandomBtn();
  updateRepeatBtn();
}
loadTracks();

// 노래 추가
function addTrack(track) {
  const li = document.createElement("li");

  const imgWrapper = document.createElement("div");
  imgWrapper.className = "imgWrapper";

  const img = document.createElement("img");
  img.src = track.coverUrl;

  const overlay = document.createElement("div");
  overlay.className = "overlay";

  const bar1 = document.createElement("span");
  const bar2 = document.createElement("span");
  const bar3 = document.createElement("span");
  const bar4 = document.createElement("span");
  const bar5 = document.createElement("span");
  bar1.className = "bar1";
  bar2.className = "bar2";
  bar3.className = "bar3";
  bar4.className = "bar4";
  bar5.className = "bar5";

  overlay.append(img, bar1, bar2, bar3, bar4, bar5);
  imgWrapper.append(img, overlay);

  const info = document.createElement("div");
  info.className = "info";

  const title = document.createElement("span");
  title.innerText = track.title;
  title.className = "title";

  const artist = document.createElement("span");
  artist.innerText = track.artist;
  artist.className = "artist";

  info.append(title, artist);

  const i = document.createElement("i");
  i.className = "fa fa-xmark";
  i.addEventListener("click", function (event) {
    event.stopPropagation();

    let local = getLocal();
    const oldTracks = local.tracks;

    // 삭제 대상 인덱스 구하기
    let delTrackidx;
    oldTracks.map((oldTrack, index) =>
      oldTrack._id === track._id ? (delTrackidx = index) : null
    );

    // 현재 재생중인 인덱스 구하기
    const nowTrack = local.nowTrack;
    let nowTrackIdx = local.nowTrack.trackIndex;

    // 현재 재생중인 인덱스는 삭제 불가 -> 클릭 시 alert 팝업
    if (delTrackidx === nowTrackIdx) {
      alert("현재 재생 중인 곡은 삭제할 수 없습니다.");
      return;
    }

    // 삭제 후 새로운 플레이리스트
    const newTracks = oldTracks.filter((track, index) => index !== delTrackidx);

    // 삭제 후 현재 재생중인 인덱스 업데이트
    newTracks.map((track, index) =>
      track._id === nowTrack.targetTrack._id ? (nowTrackIdx = index) : null
    );

    // 로컬스토리지에 저장
    local.nowTrack.trackIndex = nowTrackIdx;
    local.tracks = newTracks;
    setLocal(local);

    // DOM에서 삭제
    li.remove();
  });

  li.append(imgWrapper, info, i);

  li.addEventListener("click", (event) => clickTrack(event, track));

  playlist.appendChild(li);
}

// volume 업데이트
function updateVolume() {
  currentVolume = localStorage.getItem(APP_VOLUME);

  if (youtube) {
    youtube.setVolume(currentVolume);
  }

  volumeBar.style.width = currentVolume + "%";
}

// randomBtn 업데이트
function updateRandomBtn() {
  const isRandom = getLocal().config.isRandom;
  const theme = getLocalTheme();

  if (isRandom) {
    randomBtn.setAttribute("data-random", "on");
    randomBtn.style.color = theme === "dark" ? "#f6c2ce" : "#f43f5e";
  } else {
    randomBtn.setAttribute("data-random", "off");
    randomBtn.style.color = "#4b4b4b";
  }
}

// repeatBtn 업데이트
function updateRepeatBtn() {
  const repeat = getLocal().config.repeat;
  const theme = getLocalTheme();

  switch (repeat) {
    case "off":
      repeatBtn.setAttribute("data-repeat", "off");
      repeatBtn.className = "fa fa-repeat";
      repeatBtn.style.color = "#4b4b4b";
      break;
    case "on":
      repeatBtn.setAttribute("data-repeat", "on");
      repeatBtn.className = "fa fa-repeat";
      repeatBtn.style.color = theme === "dark" ? "#f6c2ce" : "#f43f5e";
      break;
    case "one":
      repeatBtn.setAttribute("data-repeat", "one");
      repeatBtn.className = "fa fa-1";
      repeatBtn.style.color = theme === "dark" ? "#f6c2ce" : "#f43f5e";
      break;
  }
}

// 플레이어 스크린 열고 닫기
function toggleScreen() {
  screen.classList.toggle("show");
  bar1.classList.toggle("show");
  bar2.classList.toggle("show");
  bar3.classList.toggle("show");
  document.body.classList.toggle("scrollHide");
}
player.addEventListener("click", toggleScreen);

// 노래 클릭
function clickTrack(event, track) {
  event.stopPropagation();

  const localTracks = getLocal().tracks;

  let currentIdx;
  localTracks.map((localTrack, index) =>
    localTrack._id === track._id ? (currentIdx = index) : null
  );

  playTrack(track, currentIdx);
}

// 노래 재생
function playTrack(track, idx) {
  let data = getLocal();
  const nowTrack = {
    targetTrack: track,
    trackIndex: idx,
  };
  data.nowTrack = nowTrack;

  setLocal(data);

  if (youtube) {
    youtube.destroy();
  }

  const nowTrackIdx = nowTrack.trackIndex;

  cover.src = track.coverUrl;
  title.innerText = track.title;
  artist.innerText = track.artist;

  const tracks = playlist.querySelectorAll("li");
  tracks.forEach((track) => (track.className = ""));

  const targetTrack = playlist.querySelectorAll("li")[nowTrackIdx];
  targetTrack.className = "nowPlaying";

  youtube = new YT.Player("youtubeIframe", {
    videoId: track.youtubeId,
    playerVars: { controls: 0 },
    events: {
      onReady: onPlayerReady,
      onStateChange: (event) => onPlayerStateChange(event, idx),
    },
  });
}

// 유튜브
let youtube;

// 유튜브 재생
function onPlayerReady(event) {
  // control 업데이트
  playBtn.className = "fa fa-pause";

  let time_update_interval;
  clearInterval(time_update_interval);

  // time, progress 업데이트
  updateTimerDisplay();
  updateProgressBar();

  time_update_interval = setInterval(function () {
    updateTimerDisplay();
    updateProgressBar();
  }, 1000);

  // volume 업데이트
  updateVolume();

  // 재생
  event.target.playVideo();
  screenToggleBtn.style.display = "block";
  screenToggleBtn.innerText = "유튜브 숨기기";
}

// time 업데이트
function updateTimerDisplay() {
  if (!youtube) return;

  if (typeof youtube.getPlayerState !== "function") return;

  const state = youtube.getPlayerState();
  if (state === 3) return;

  currentTime.innerText = formatTime(youtube.getCurrentTime());
  duration.innerText = formatTime(youtube.getDuration());

  const local = getLocal();
  local.config.nowTime = formatTime(youtube.getCurrentTime());
  local.config.totalTime = formatTime(youtube.getDuration());
  setLocal(local);
}

// progress 업데이트
function updateProgressBar() {
  if (typeof youtube.getPlayerState !== "function") return;

  progressBar.style.width =
    (youtube.getCurrentTime() / youtube.getDuration()) * 100 + "%";
}

// progress 클릭
function setTime(event) {
  event.stopPropagation();

  const totalWidth = progressArea.clientWidth;
  const clickedWidth = event.offsetX;
  const newTime = youtube.getDuration() * (clickedWidth / totalWidth);
  youtube.seekTo(newTime);
}
progressArea.addEventListener("click", setTime);

// progress 진입하면 time 표시
function showCurrentTime(event) {
  if (!youtube) return;

  const totalWidth = progressArea.clientWidth;
  const clickedWidth = event.offsetX;
  const newTime = youtube.getDuration() * (clickedWidth / totalWidth);

  timeTooltip.style.display = "block";
  timeTooltip.style.left = clickedWidth - 12 + "px";
  timeTooltip.style.top = "25px";
  timeTooltip.innerText = formatTime(newTime);
}
progressArea.addEventListener("mouseover", showCurrentTime);
progressArea.addEventListener("mousemove", showCurrentTime);

// progress 벗어나면 time 숨기기
function hideCurrentTime() {
  timeTooltip.style.display = "none";
}
progressArea.addEventListener("mouseleave", hideCurrentTime);

// volume 조절
function setVolume(event) {
  event.stopPropagation();

  const totalWidth = volumeBarArea.clientWidth;
  const clickedWidth = event.offsetX;
  const newVolume = (clickedWidth / totalWidth) * 100;

  if (volumeBtn.className === "fa fa-volume-xmark") {
    if (youtube) {
      youtube.unMute();
    }
    volumeBtn.className = "fa fa-volume-high";
  }

  if (newVolume === 0) {
    if (youtube) {
      youtube.mute();
    }
    volumeBtn.className = "fa fa-volume-xmark";
  } else {
    volumeBtn.className = "fa fa-volume-high";
  }

  currentVolume = newVolume;
  if (youtube) {
    youtube.setVolume(newVolume);
  }
  volumeBar.style.width = newVolume + "%";

  localStorage.setItem(APP_VOLUME, currentVolume);
}
volumeBarArea.addEventListener("click", setVolume);

// volume 토글
function toggleMute(event) {
  event.stopPropagation();

  if (volumeBtn.className === "fa fa-volume-xmark") {
    if (youtube) {
      youtube.unMute();
      youtube.setVolume(currentVolume);
    }
    volumeBtn.className = "fa fa-volume-high";
    volumeBar.style.width = currentVolume + "%";
    localStorage.setItem(APP_VOLUME, currentVolume);
  } else {
    if (youtube) {
      currentVolume = youtube.getVolume();
      youtube.mute();
    }
    volumeBtn.className = "fa fa-volume-xmark";
    volumeBar.style.width = 0 + "%";
    localStorage.setItem(APP_VOLUME, 0);
  }
}
volumeBtn.addEventListener("click", toggleMute);

// playBtn 클릭
playBtn.addEventListener("click", function (event) {
  event.stopPropagation();

  if (!youtube) {
    const nowTrackIdx = getLocal().nowTrack.trackIndex;
    const nowTrack = playlist.querySelectorAll("li")[nowTrackIdx];
    nowTrack.click();
    return;
  }

  const state = youtube.getPlayerState();

  // when playing
  if (state === 1) {
    youtube.pauseVideo();

    // when paused or ended
  } else if (state === 2 || state === 0) {
    youtube.playVideo();
  }
});

// prevBtn 클릭
prevBtn.addEventListener("click", function (event) {
  event.stopPropagation();

  const totalTrackNum = getLocal().tracks.length;
  let prevTrackIdx = getLocal().nowTrack.trackIndex - 1;

  if (prevTrackIdx < 0) {
    prevTrackIdx = totalTrackNum - 1;
  }

  const prevTrack = playlist.querySelectorAll("li")[prevTrackIdx];
  prevTrack.click();
});

// nextBtn 클릭
nextBtn.addEventListener("click", function (event) {
  event.stopPropagation();

  const repeat = getLocal().config.repeat;
  const totalTrackNum = getLocal().tracks.length;
  let nextTrackIdx = getLocal().nowTrack.trackIndex + 1;

  if (youtube) {
    const state = youtube.getPlayerState();

    // 노래 끝났는데, 다음 곡이 없고, 반복 off 일 때 종료
    if (state === 0 && nextTrackIdx === totalTrackNum && repeat === "off")
      return;
  }

  // 다음 곡이 없을 때 맨 처음 노래 선택
  if (nextTrackIdx === totalTrackNum) {
    nextTrackIdx = 0;
  }

  const nextTrack = playlist.querySelectorAll("li")[nextTrackIdx];
  nextTrack.click();
});

// randomBtn 클릭
randomBtn.addEventListener("click", function (event) {
  event.stopPropagation();
  const local = getLocal();
  const theme = getLocalTheme();

  switch (randomBtn.dataset.random) {
    case "off":
      randomBtn.setAttribute("data-random", "on");
      randomBtn.style.color = theme === "dark" ? "#f6c2ce" : "#f43f5e";
      local.config.isRandom = true;
      break;
    case "on":
      randomBtn.setAttribute("data-random", "off");
      randomBtn.style.color = "#4b4b4b";
      local.config.isRandom = false;
      break;
  }

  setLocal(local);
});

// repeatBtn 클릭
repeatBtn.addEventListener("click", function (event) {
  event.stopPropagation();
  const local = getLocal();
  const theme = getLocalTheme();

  switch (repeatBtn.dataset.repeat) {
    case "off":
      repeatBtn.setAttribute("data-repeat", "on");
      repeatBtn.className = "fa fa-repeat";
      repeatBtn.style.color = theme === "dark" ? "#f6c2ce" : "#f43f5e";
      local.config.repeat = "on";
      break;
    case "on":
      repeatBtn.setAttribute("data-repeat", "one");
      repeatBtn.className = "fa fa-1";
      repeatBtn.style.color = theme === "dark" ? "#f6c2ce" : "#f43f5e";
      local.config.repeat = "one";
      break;
    case "one":
      repeatBtn.setAttribute("data-repeat", "off");
      repeatBtn.className = "fa fa-repeat";
      repeatBtn.style.color = "#4b4b4b";
      local.config.repeat = "off";
      break;
  }
  setLocal(local);
});

// 플레이어 상태
async function onPlayerStateChange(event, idx) {
  const data = getLocal();
  const nowTrackIdx = data.nowTrack.trackIndex;
  const targetTrack = playlist.querySelectorAll("li")[nowTrackIdx];

  // ended
  if (event.data === 0) {
    playBtn.className = "fa fa-play";
    targetTrack.classList.remove("nowPlayingBar");

    // 조회수 증가
    const youtubeId = event.target.getVideoData().video_id;

    await fetch(`/api/song/${youtubeId}/view`, {
      method: "POST",
    });

    // 포인트 적립 (로그인한 경우)

    await fetch(`/api/song/${youtubeId}/point`, {
      method: "POST",
    });

    const repeat = getLocal().config.repeat;

    const nowTrackIdx = getLocal().nowTrack.trackIndex;

    if (repeat === "one") {
      playlist.querySelectorAll("li")[nowTrackIdx].click();
      return;
    }

    const random = getLocal().config.isRandom;

    if (random) {
      const totalTrackNum = getLocal().tracks.length;
      let randomIdx = Math.floor(Math.random() * totalTrackNum);

      while (totalTrackNum !== 1 && randomIdx === idx) {
        randomIdx = Math.floor(Math.random() * totalTrackNum);
      }

      const randomTrack = getLocal().tracks[randomIdx];
      playTrack(randomTrack, randomIdx);
      return;
    }

    nextBtn.click();
  }

  // playing
  if (event.data === 1) {
    playBtn.className = "fa fa-pause";
    targetTrack.classList.add("nowPlayingBar");
  }

  // paused
  if (event.data === 2) {
    playBtn.className = "fa fa-play";
    targetTrack.classList.remove("nowPlayingBar");
  }
}

const playBtns = document.querySelectorAll(".play-btn");
if (playBtns) {
  playBtns.forEach((playBtn) =>
    playBtn.addEventListener("click", playSongOnPlayer)
  );
}

async function playSongOnPlayer(event) {
  event.stopPropagation();

  const songId = event.currentTarget.parentElement.dataset.id;
  const result = await (await fetch(`/api/song/${songId}`)).json();

  if (result.ok) {
    let local = getLocal();
    const oldTracks = local.tracks;

    // 플레이리스트 내 존재하는지 확인 -> 있으면 해당 곡으로 이동하여 재생
    let alreadyTrackIdx;
    oldTracks.forEach((oldTrack, index) =>
      oldTrack._id === result.song._id ? (alreadyTrackIdx = index) : null
    );

    if (alreadyTrackIdx !== undefined) {
      alert(
        "이미 플레이리스트에 존재하는 곡입니다.\n해당 곡으로 이동하여 재생합니다."
      );
      const alreadyTrack = playlist.querySelectorAll("li")[alreadyTrackIdx];
      alreadyTrack.click();
      return;
    }

    // 플레이리스트에 없으면 플레이리스트 맨 첫곡으로 추가하여 재생
    const newTracks = [result.song, ...local.tracks];
    const newNowTrack = {
      targetTrack: result.song,
      trackIndex: 0,
    };
    local.nowTrack = newNowTrack;
    local.tracks = newTracks;
    setLocal(local);
    resetTracks();
    loadTracks();

    const firstTrack = playlist.querySelectorAll("li")[0];
    firstTrack.click();
  } else {
    alert("서버 오류로 곡을 재생할 수 없습니다.\n잠시 후 다시 시도해주세요.");
  }
}

const playAllBtn = document.querySelector(".play-all");
if (playAllBtn) {
  playAllBtn.addEventListener("click", playAllSongsOnPlaylist);
}

async function playAllSongsOnPlaylist(event) {
  event.stopPropagation();

  const playlistId = event.currentTarget.dataset.id;
  const result = await (await fetch(`/api/playlist/${playlistId}`)).json();

  if (result.ok) {
    let local = getLocal();
    local.tracks = result.songs;
    local.nowTrack.targetTrack = result.songs[0];
    local.nowTrack.trackIndex = 0;
    setLocal(local);
    resetTracks();
    loadTracks();

    const firstTrack = playlist.querySelectorAll("li")[0];
    firstTrack.click();
  }

  if (!result.ok && result.errorMsg) {
    alert(result.errorMsg);
  }
}

function resetTracks() {
  while (playlist.firstChild) {
    playlist.removeChild(playlist.firstChild);
  }
}

screenToggleBtn.addEventListener("click", toggleYoutube);

function toggleYoutube(event) {
  event.stopPropagation();

  if (screenToggleBtn.innerText === "유튜브 숨기기") {
    youtubeIframe.style.visibility = "hidden";
    screenToggleBtn.innerText = "유튜브 보기";
  } else {
    youtubeIframe.style.visibility = "visible";
    screenToggleBtn.innerText = "유튜브 숨기기";
  }
}
