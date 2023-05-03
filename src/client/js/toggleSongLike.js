// 좋아요 버튼 선택
const likeBtns = document.querySelectorAll(".like");
likeBtns.forEach((likeBtn) =>
  likeBtn.addEventListener("click", toggleSongLike)
);

// 좋아요 버튼 토글 처리
async function toggleSongLike(event) {
  const songId = event.currentTarget.parentElement.dataset.id;

  const result = await (
    await fetch(`/api/song/${songId}/like`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
  ).json();

  if (result.ok) {
    const target = event.target.querySelector("i") || event.target;

    if (result.like) {
      target.className = "fa fa-heart isLiked";
    } else {
      target.className = "far fa-heart";

      if (location.pathname === "/playlist/like") {
        window.location.reload();
      }
    }
  }

  if (!result.ok && result.errorMsg) {
    alert(result.errorMsg);
  }
}
