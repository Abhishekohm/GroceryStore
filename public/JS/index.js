const flashBtns = document.querySelectorAll(".flash button");
const flashs = document.querySelectorAll(".flash");

for (let flashBtn of flashBtns) {
  flashBtn.addEventListener("click", (e) => {
    flashBtn.parentElement.style.display = "none";
  });
}
