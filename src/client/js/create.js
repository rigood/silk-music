const createCoverPreviewInput = document.getElementById(
  "createCoverPreviewInput"
);
const createCoverPreviewBtn = document.getElementById("createCoverPreviewBtn");
const createCoverPreview = document.getElementById("createCoverPreview");

createCoverPreviewBtn.addEventListener("click", showCoverPreview);

function showCoverPreview() {
  createCoverPreview.innerHTML = "";

  const coverUrl = createCoverPreviewInput.value;

  const regExp =
    /(https:\/\/)([^\s(["<,>/]*)(\/)[^\s[",><]*(.png|.jpg|.jpeg|.gif|.webp|.svg)(\?[^\s[",><]*)?/;

  const match = coverUrl.match(regExp);

  if (match) {
    const img = document.createElement("img");
    img.src = coverUrl;
    createCoverPreview.append(img);
  } else if (coverUrl === "") {
    return;
  } else {
    alert("이미지 주소를 다시 한번 확인해주세요.");
  }
}
