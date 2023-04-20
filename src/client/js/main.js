import "regenerator-runtime";
import "../scss/styles.scss";
import "./player.js";
import "./playlist.js";
import "./like.js";

const modeToggleBtn = document.getElementById("modeToggleBtn");
modeToggleBtn.addEventListener("click", toggleModeBtn);

function toggleModeBtn(event) {
  if (event.target.className === "fa fa-sun") {
    // light 모드로 변경
    document.documentElement.setAttribute("data-mode", "light");
    event.target.className = "fa fa-moon";
  } else if (event.target.className === "fa fa-moon") {
    // dark 모드로 변경
    document.documentElement.setAttribute("data-mode", "dark");
    event.target.className = "fa fa-sun";
  }
}
