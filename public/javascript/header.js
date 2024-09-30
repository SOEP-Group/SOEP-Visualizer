document.addEventListener('DOMContentLoaded', function () {
    const predictionTrigger = document.querySelector('.prediction-dropdown-trigger');
    const predictionDropdown = document.getElementById('prediction-dropdown');

    const satelliteTrigger = document.querySelector('.satellite-dropdown-trigger');
    const satelliteDropdown = document.getElementById('satellite-dropdown');
    const searchInput = document.getElementById('search-input');

    // prediction dropdown
    predictionTrigger.addEventListener('click', function () {
        predictionDropdown.classList.toggle('show'); // open
        satelliteDropdown.classList.remove('show'); // close
    });

    // satellite dropdown
    satelliteTrigger.addEventListener('click', function () {
        satelliteDropdown.classList.toggle('show');
        predictionDropdown.classList.remove('show');
    });

    // filter satellite options based on search input
    searchInput.addEventListener('keyup', function () {
        const filter = searchInput.value.toUpperCase();
        const satelliteLinks = satelliteDropdown.getElementsByTagName("a");

        for (let i = 0; i < satelliteLinks.length; i++) {
            const txtValue = satelliteLinks[i].textContent || satelliteLinks[i].innerText;

            if (txtValue.toUpperCase().startsWith(filter)) {
                satelliteLinks[i].style.display = ""; // show matching item
            } else {
                satelliteLinks[i].style.display = "none"; // hide non-matching item
            }
        }
    });

    // close dropdown if clicked outside
    window.addEventListener('click', function (event) {
        if (!event.target.matches('.prediction-dropdown-trigger') &&
            !event.target.matches('.satellite-dropdown-trigger') &&
            !event.target.matches('#search-input')) {
            predictionDropdown.classList.remove('show');
            satelliteDropdown.classList.remove('show');
        }
    });
});

// burger menu
const dropdownButton = document.getElementById('menu__toggle');
const dropdownMenu = document.querySelector('.menu__box');
const menuItems = dropdownMenu.querySelectorAll('.menu__item');

dropdownButton.addEventListener('click', function () {
    dropdownMenu.classList.toggle('active');
    dropdownButton.classList.toggle('active');
});

document.addEventListener('click', function (event) {
    if (!dropdownButton.contains(event.target) && !dropdownMenu.contains(event.target)) {
        dropdownMenu.classList.remove('active');
        dropdownButton.classList.remove('active');
    }
});

// close dropdown if clicked outside
menuItems.forEach(item => {
    item.addEventListener('click', function () {
        dropdownMenu.classList.remove('active');
        dropdownButton.classList.remove('active');
    });
});
