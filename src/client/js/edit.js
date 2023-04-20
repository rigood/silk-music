const editCoverPreviewInput = document.getElementById("editCoverPreviewInput");
const editCoverPreviewBtn = document.getElementById("editCoverPreviewBtn");
const editCoverPreview = document.getElementById("editCoverPreview");
const deletePlaylistBtn = document.getElementById("deletePlaylistBtn");

editCoverPreviewBtn.addEventListener("click", showEditCoverPreview);

function showEditCoverPreview() {
  editCoverPreview.innerHTML = "";

  const coverUrl = editCoverPreviewInput.value;

  const regExp =
    /(https:\/\/)([^\s(["<,>/]*)(\/)[^\s[",><]*(.png|.jpg|.jpeg|.gif|.webp|.svg)(\?[^\s[",><]*)?/;

  const match = coverUrl.match(regExp);

  if (match) {
    const img = document.createElement("img");
    img.src = coverUrl;
    editCoverPreview.append(img);
  } else if (coverUrl === "") {
    return;
  } else {
    alert("이미지 주소를 다시 한번 확인해주세요.");
  }
}

deletePlaylistBtn.addEventListener("click", deletePlaylist);

async function deletePlaylist(event) {
  const playlistId = event.target.dataset.id;

  const result = await (
    await fetch("/playlist/delete", {
      method: "POST",
      body: JSON.stringify({
        playlistId,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
  ).json();

  if (result.ok) {
    alert("플레이리스트가 정상적으로 삭제되었습니다.");
    window.location.href = "/playlist/my";
  }

  if (!result.ok && result.errorMsg) {
    alert(result.errorMsg);
  }
}
