const form = document.getElementById("uploadSongForm");

const youtubeUrlInput = document.getElementById("uploadSongYoutubeUrlInput");
const youtubeIdInput = document.getElementById("uploadSongYoutubeIdInput");
const previewBtn = document.getElementById("uploadSongPreviewBtn");

const youtubeWrapper = document.getElementById("uploadSongYoutubeWrapper");
const youtubeIframe = document.getElementById("uploadSongYoutubeIframe");

const titleInput = document.getElementById("uploadSongTitleInput");
const artistInput = document.getElementById("uploadSongArtistInput");
const albumInput = document.getElementById("uploadSongAlbumInput");
const releasedAtInput = document.getElementById("uploadSongReleasedAtInput");
const playTimeInput = document.getElementById("uploadSongPlayTimeInput");

previewBtn.addEventListener("click", showYoutubePreview);

function showYoutubePreview() {
  const youtubeUrl = youtubeUrlInput.value;

  const regExp =
    /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;

  const match = youtubeUrl.match(regExp);

  if (match && match[7].length === 11) {
    const youtubeId = match[7];
    youtubeIdInput.value = youtubeId;
    onPlayPreviewById(youtubeId);
  } else {
    alert("유튜브 영상 ID를 다시 한번 확인해주세요.");
  }
}

let previewPlayer;

function onPlayPreviewById(youtubeId) {
  if (previewPlayer) {
    previewPlayer.destroy();
  }
  previewPlayer = new YT.Player("uploadSongYoutubeIframe", {
    videoId: youtubeId,
    playerVars: { autoplay: 0 },
    events: {
      onReady: onPreviewPlayerReady,
    },
  });
}

function onPreviewPlayerReady(event) {
  titleInput.value = event.target.playerInfo.videoData.title;
  artistInput.value = event.target.playerInfo.videoData.author;
  playTimeInput.value = event.target.getDuration();
}
