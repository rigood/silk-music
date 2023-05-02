const coverPreviewInput = document.getElementById("coverPreviewInput");
const coverPreviewBtn = document.getElementById("coverPreviewBtn");
const coverPreview = document.getElementById("coverPreview");

coverPreviewBtn.addEventListener("click", showCoverPreview);

function showCoverPreview() {
  coverPreview.innerHTML = "";

  const coverUrl = coverPreviewInput.value;

  const regExp =
    /(https:\/\/)([^\s(["<,>/]*)(\/)[^\s[",><]*(.png|.jpg|.jpeg|.gif|.webp|.svg)(\?[^\s[",><]*)?/;

  const match = coverUrl.match(regExp);

  if (match) {
    const img = document.createElement("img");
    img.src = coverUrl;
    coverPreview.append(img);
  } else if (coverUrl === "") {
    return;
  } else {
    alert("이미지 주소를 다시 한번 확인해주세요.");
  }
}
