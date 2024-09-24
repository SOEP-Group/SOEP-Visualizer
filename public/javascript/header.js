// satellite dropdown 
document.addEventListener('DOMContentLoaded', function () {
    const satelliteDropdownToggle = document.querySelector('.dropdown-trigger');
    const satelliteDropdown = document.getElementById("satellite-dropdown");
    const searchInput = document.getElementById("search-input");

    satelliteDropdownToggle.addEventListener('click', function () {
        satelliteDropdown.classList.toggle("show");
    });

    // filter satellite options based on search input
    searchInput.addEventListener('keyup', function () {
        const filter = searchInput.value.toUpperCase();
        const a = satelliteDropdown.getElementsByTagName("a");

        for (let i = 0; i < a.length; i++) {
            const txtValue = a[i].textContent || a[i].innerText;

            if (txtValue.toUpperCase().startsWith(filter)) {
                a[i].style.display = "";
            } else {
                a[i].style.display = "none";
            }
        }
    });

    // close satellite dropdown if clicked outside
    document.addEventListener('click', function (event) {
        if (!satelliteDropdown.contains(event.target) && !satelliteDropdownToggle.contains(event.target)) {
            satelliteDropdown.classList.remove('show');
        }
    });

    // burger menu
    const dropdownButton = document.getElementById('dropdownButton');
    const dropdownMenu = document.getElementById('dropdownMenu');

    dropdownButton.addEventListener('click', function () {
        dropdownMenu.classList.toggle('hidden');
    });

    // close burger menu if clicked outside
    document.addEventListener('click', function (event) {
        if (!dropdownButton.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.classList.add('hidden');
        }
    });
});