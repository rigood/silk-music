import "regenerator-runtime";
import "../scss/styles.scss";
import "./player.js";
import "./playlist.js";
import "./like.js";

const toggleThemeBtn = document.getElementById("toggleThemeBtn");
toggleThemeBtn.addEventListener("click", toggleTheme);

function toggleTheme(event) {
  if (event.target.className === "fa fa-sun") {
    document.documentElement.setAttribute("data-theme", "light");
    toggleThemeBtn.className = "fa fa-moon";
    localStorage.setItem("silk_music_theme", "light");
  } else if (event.target.className === "fa fa-moon") {
    document.documentElement.setAttribute("data-theme", "dark");
    toggleThemeBtn.className = "fa fa-sun";
    localStorage.setItem("silk_music_theme", "dark");
  }
}

const toggleNavBtn = document.getElementById("toggleNavBtn");
toggleNavBtn.addEventListener("click", toggleNav);
const nav = document.querySelector(".nav");
const miniNav = document.querySelector(".miniNav");
const navCloseBtn = document.getElementById("navCloseBtn");
navCloseBtn.addEventListener("click", closeNav);

function toggleNav() {
  nav.classList.toggle("show");
  miniNav.classList.toggle("hide");
  document.body.classList.toggle("scrollHide");
}

function closeNav() {
  nav.classList.toggle("show");
  miniNav.classList.toggle("hide");
  document.body.classList.toggle("scrollHide");
}
