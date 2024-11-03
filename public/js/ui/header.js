// burger menu
const dropdownButton = document.getElementById("menu__toggle");
const dropdownMenu = document.getElementById("ham_menu");

export function initHeader() {
  const satelliteDropdown = document.getElementById("satellite-dropdown");

  const searchInput = document.getElementById("search-input");

  searchInput.addEventListener("keyup", function () {
    const filter = searchInput.value.toUpperCase();
    const satelliteLinks = satelliteDropdown.getElementsByTagName("a");

    for (let i = 0; i < satelliteLinks.length; i++) {
      const txtValue =
        satelliteLinks[i].textContent || satelliteLinks[i].innerText;

      if (txtValue.toUpperCase().startsWith(filter)) {
        satelliteLinks[i].style.display = ""; // show matching item
      } else {
        satelliteLinks[i].style.display = "none"; // hide non-matching item
      }
    }
  });

  dropdownButton.addEventListener("click", function () {
    const menuClosed = dropdownMenu.classList.contains("translate-x-full");
    if (menuClosed) {
      return openMenu();
    }
    closeMenu();
  });

  // document.addEventListener("click", function (event) {
  //   if (
  //     !dropdownButton.contains(event.target) &&
  //     !dropdownMenu.contains(event.target)
  //   ) {
  //     closeMenu();
  //   }
  // });

  // document
  //   .getElementById("settings-modal-close")
  //   .addEventListener("click", function (event) {
  //     document.getElementById("settings-modal").classList.add("hidden");
  //   });
}

function openMenu() {
  dropdownMenu.classList.remove("translate-x-full");
  dropdownMenu.classList.add("translate-x-0");
  dropdownButton.classList.add("tham-active");
}

function closeMenu() {
  dropdownMenu.classList.remove("translate-x-0");
  dropdownButton.classList.remove("tham-active");
  dropdownMenu.classList.add("translate-x-full");
}