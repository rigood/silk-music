const addSongForm = document.getElementById("addSongForm");
const addSongYoutubeUrlInput = document.getElementById(
  "addSongYoutubeUrlInput"
);
const addSongyoutubeIdInput = document.getElementById("addSongYoutubeIdInput");
const addSongPreviewBtn = document.getElementById("addSongPreviewBtn");
const addSongYoutubeWrapper = document.getElementById("addSongYoutubeWrapper");
const addSongYoutubeIframe = document.getElementById("addSongYoutubeIframe");
const addSongTitleInput = document.getElementById("addSongTitleInput");
const addSongArtistInput = document.getElementById("addSongArtistInput");
const addSongAlbumInput = document.getElementById("addSongAlbumInput");
const addSongReleasedAtInput = document.getElementById(
  "addSongReleasedAtInput"
);
const addSongPlayTimeInput = document.getElementById("addSongPlayTimeInput");

addSongPreviewBtn.addEventListener("click", showYoutubePreview);

function showYoutubePreview() {
  const addSongYoutubeUrl = addSongYoutubeUrlInput.value;

  const regExp =
    /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;

  const match = addSongYoutubeUrl.match(regExp);

  if (match && match[7].length === 11) {
    const youtubeId = match[7];
    addSongyoutubeIdInput.value = youtubeId;
    onPlayPreviewById(youtubeId);
  } else {
    alert("유튜브 영상 ID를 다시 한번 확인해주세요.");
  }
}

let previewPlayer;

function onPlayPreviewById(addSongYoutubeId) {
  if (previewPlayer) {
    previewPlayer.destroy();
  }
  previewPlayer = new YT.Player("addSongYoutubeIframe", {
    videoId: addSongYoutubeId,
    playerVars: { autoplay: 0 },
    events: {
      onReady: onPreviewPlayerReady,
    },
  });
}

function onPreviewPlayerReady(event) {
  addSongTitleInput.value = event.target.playerInfo.videoData.title;
  addSongArtistInput.value = event.target.playerInfo.videoData.author;
  addSongPlayTimeInput.value = event.target.getDuration();
}
