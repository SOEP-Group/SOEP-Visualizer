import { getLocation } from "./utils.js";

export function initPredictions() {

    document.getElementById("pass-prediction-header").addEventListener("click", function () {
        toggleSection('pass-content', 'arrow-pass');
    });

    document.getElementById("re-entry-prediction-header").addEventListener("click", function () {
        toggleSection('re-entry-content', 'arrow-re-entry');
    });

    document.getElementById("passing-prediction-header").addEventListener("click", function () {
        toggleSection('passing-content', 'arrow-passing');
    });

}

function toggleSection(contentId, arrowId) {
    const contentElement = document.getElementById(contentId);
    const arrowElement = document.getElementById(arrowId);

    if (contentElement.innerHTML.trim() === "") {
        loadContent(contentId);
    }

    contentElement.classList.toggle('hidden');

    // Rotate the arrow icon based on visibility
    if (contentElement.classList.contains('hidden')) {
        arrowElement.querySelector('svg').classList.remove('rotate-90');
    } else {
        arrowElement.querySelector('svg').classList.add('rotate-90');
    }
}

function loadContent(contentId) {
    const contentContainer = document.getElementById(contentId);
    contentContainer.innerHTML = getContent(contentId);
}


document.addEventListener("click", function (event) {
    let locationField = null;

    if (event.target && (event.target.id === "get-location-button-1" || event.target.id === "get-location-button-2")) {
        const locationId = event.target.id === "get-location-button-1" ? "location-1" : "location-2";
        locationField = document.getElementById(locationId);
        if (locationField) {
            getLocation(locationField);
        }
    }
});

document.addEventListener("click", function (event) {
    if (event.target && event.target.id === "select-location-button") {
        // For future use
    }
});

document.addEventListener("click", function (event) {
    if (event.target && event.target.id === "calculate-pass-button") {
        // Future API call
    }
});

document.addEventListener("click", function (event) {
    if (event.target && event.target.id === "calculate-re-entry-button") {
        // Future API call
    }
});

document.addEventListener("click", function (event) {
    if (event.target.closest("#toggle-section")) {
        toggleIconState();
    }
});

export function toggleIconState() {
    const toggleText = document.getElementById("toggle-text");
    const togglePath = document.getElementById("toggle-path");

    if (toggleText.innerText === "Displaying All Satellites") {
        toggleText.innerText = "Displaying Passing Satellites";
        togglePath.setAttribute("d", "M192 64C86 64 0 150 0 256S86 448 192 448l192 0c106 0 192-86 192-192s-86-192-192-192L192 64zm192 96a96 96 0 1 1 0 192 96 96 0 1 1 0-192z");
    } else {
        toggleText.innerText = "Displaying All Satellites";
        togglePath.setAttribute("d", "M384 128c70.7 0 128 57.3 128 128s-57.3 128-128 128l-192 0c-70.7 0-128-57.3-128-128s57.3-128 128-128l192 0zM576 256c0-106-86-192-192-192L192 64C86 64 0 150 0 256S86 448 192 448l192 0c106 0 192-86 192-192zM192 352a96 96 0 1 0 0-192 96 96 0 1 0 0 192z");
    }
}

function getContent(itemId) {
    const input_form_styling = "flex flex-col items-center mt-4";
    const input_styling =
        "bg-gray-500 text-white border border-gray-700 rounded p-2 text-l mb-2 w-80 box-border focus:border-gray-400 focus:outline-none";
    const button_styling = "bg-sky-900 hover:border-teal-300 text-white hover:bg-sky-700 font-bold py-2 px-4 rounded mt-3";
    const location_button_styling = "bg-gray-900 text-white font-bold py-1 px-3 rounded mt-1 hover:bg-gray-700";
    switch (itemId) {
        case "pass-content":
            return `
                <div class="${input_form_styling}">
                    <input type="text" id="satellite-pass" placeholder="Satellite" class="${input_styling}">
                    <input type="text" id="location-1" placeholder="Location" class="${input_styling}">
                    <button data-ripple="true" id="get-location-button-1" class="${location_button_styling}">Use Current Location</button>
                    <button data-ripple="true" id="select-location-button" class="${location_button_styling}">Select Location</button>
                    <button data-ripple="true" id="calculate-pass-button" class="${button_styling}">Calculate</button>
                </div>
            `;
        case "re-entry-content":
            return `
                <div class="${input_form_styling}">
                    <input type="text" id="satellite-re-entry" placeholder="Satellite" class="${input_styling}">
                    <button data-ripple="true" id="calculate-re-entry-button" class="${button_styling}">Calculate</button>
                </div>
            `;
        case "passing-content":
            return `
                    <div class="${input_form_styling}">
                        <div id="toggle-section" class="flex items-center justify-between w-[300px]">
                            <span id="toggle-text" class="mr-2 text-left flex-1">Displaying All Satellites</span>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" class="w-8 h-8 cursor-pointer" id="toggle-svg">
                                <path id="toggle-path" fill="#ffffff" d="M384 128c70.7 0 128 57.3 128 128s-57.3 128-128 128l-192 0c-70.7 0-128-57.3-128-128s57.3-128 128-128l192 0zM576 256c0-106-86-192-192-192L192 64C86 64 0 150 0 256S86 448 192 448l192 0c106 0 192-86 192-192zM192 352a96 96 0 1 0 0-192 96 96 0 1 0 0 192z"/>
                            </svg>
                        </div>
                        <input type="text" id="location-2" placeholder="Location" class="${input_styling}">
                        <button data-ripple="true" id="get-location-button-2" class="${location_button_styling}">Use Current Location</button>
                        <button data-ripple="true" id="select-location-button" class="${location_button_styling}">Select Location</button>
                    </div>
                `;
        default:
            return "";
    }
}
