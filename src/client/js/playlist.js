// 모달 요소 선택
const modal = document.getElementById("modal");
const modalTitle = modal.querySelector(".title");
const modalContents = modal.querySelector(".contents");

// 모달 제어
function showModal(title) {
  modal.style.display = "block";
  document.body.style.overflow = "hidden";
  modalTitle.innerText = title;
}

function hideModal() {
  modal.style.display = "none";
  document.body.style.overflow = "auto";
}

window.addEventListener("click", (e) => {
  e.target === modal ? hideModal() : false;
});

// 플레이리스트에 곡 추가 요소 선택
const addBtns = document.querySelectorAll(".add");
addBtns.forEach((addBtn) =>
  addBtn.addEventListener("click", showMyPlaylistsInModal)
);

// 모달에 내 플레이리스트 목록 표시
async function showMyPlaylistsInModal(event) {
  const songId = event.currentTarget.parentElement.dataset.id;

  const result = await (await fetch("/playlist/add")).json();

  if (result.ok) {
    showModal("내 플레이리스트에 추가");

    // 기존 모달에 있던 내용 제거
    while (modalContents.firstChild) {
      modalContents.removeChild(modalContents.firstChild);
    }

    // 모달에 플레이리스트 추가
    result.playlists.forEach((playlist) =>
      makePlaylistsInModal(playlist, songId)
    );
  }

  if (!result.ok) {
    alert(result.errorMsg);
  }
}

function makePlaylistsInModal(playlist, songId) {
  const li = document.createElement("li");
  li.dataset.playlist = playlist._id;

  const img = document.createElement("img");
  img.src = playlist.coverUrl;

  const span = document.createElement("span");
  span.innerText = playlist.name;

  li.append(img, span);

  li.addEventListener("click", () => addSongToPlaylist(playlist, songId));

  modalContents.append(li);
}

// 플레이리스트에 곡 추가 처리
async function addSongToPlaylist(playlist, songId) {
  const result = await (
    await fetch("/playlist/add", {
      method: "POST",
      body: JSON.stringify({
        playlistId: playlist._id,
        songId,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
  ).json();

  if (result.ok) {
    alert(`1곡을 ${playlist.name}에 추가하였습니다.`);
    hideModal();
  }

  if (!result.ok && result.errorMsg) {
    alert(result.errorMsg);
    hideModal();
  }
}

// 플레이리스트로부터 곡 제거 요소 선택
const removeBtns = document.querySelectorAll(".remove");
removeBtns.forEach((removeBtn) =>
  removeBtn.addEventListener("click", removeSongFromPlaylist)
);

// 플레이리스트로부터 곡 제거 처리
async function removeSongFromPlaylist(event) {
  const playlistId = event.currentTarget.parentElement.dataset.playlist;
  const songId = event.currentTarget.parentElement.dataset.id;

  const result = await (
    await fetch("/playlist/remove", {
      method: "POST",
      body: JSON.stringify({
        playlistId,
        songId,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
  ).json();

  if (result.ok) {
    window.location.reload();
  }

  if (!result.ok && result.errorMsg) {
    alert(errorMsg);
  }
}
