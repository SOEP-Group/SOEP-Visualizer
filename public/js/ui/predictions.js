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

export function toggleSection(contentId, arrowId) {
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

// const predictionBtns = document.getElementsByClassName(
//   "prediction-dropdown-trigger"
// );
// const sideWindow = document.getElementById("side-left-window");
// const windowContent = document.getElementById("left-window-content");
// const closeWindowButton = document.getElementById("close-left-window");

// export function initPredictions() {
//   Array.from(predictionBtns).forEach((item) => {
//     item.addEventListener("click", function (event) {
//       sideWindow.classList.remove("-translate-x-full");
//       sideWindow.classList.add("translate-x-0");
//       windowContent.innerHTML = getContent(item.id);
//     });
//   });

//   closeWindowButton.addEventListener("click", () => {
//     sideWindow.classList.remove("translate-x-0");
//     sideWindow.classList.add("-translate-x-full");
//   });
// }

document.addEventListener("click", function (event) {
    if (event.target && event.target.id === "get-location-button") {
        getLocation();
    }
});

document.addEventListener("click", function (event) {
    if (event.target && event.target.id === "select-location-button") {
        // API call
    }
});

document.addEventListener("click", function (event) {
    if (event.target && event.target.id === "calculate-pass-button") {
        // API call, send things with it
    }
});

document.addEventListener("click", function (event) {
    if (event.target && event.target.id === "calculate-re-entry-button") {
        // API call, send things with it
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const toggleIcon = document.getElementById("toggle-icon");
    let isToggled = false;

    console.log("HI");
    toggleIcon.addEventListener("click", () => {
        isToggled = !isToggled; // Toggle the state

        // Change the color based on toggle state
        toggleIcon.querySelector("svg").setAttribute("fill", isToggled ? "#00FFC2" : "#FFFFFF");
        toggleIcon.querySelector("svg").setAttribute("stroke", isToggled ? "#00FFC2" : "#FFFFFF");
    });
});


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
                    <input type="text" id="satellite1" placeholder="Satellite" class="${input_styling}">
                    <input type="text" id="location" placeholder="Location" class="${input_styling}">
                    <button data-ripple="true" id="get-location-button" class="${location_button_styling}">Use Current Location</button>
                    <button data-ripple="true" id="select-location-button" class="${location_button_styling}">Select Location</button>
                    <button data-ripple="true" id="calculate-pass-button" class="${button_styling}">Calculate</button>
                </div>
            `;
        case "re-entry-content":
            return `
                <div class="${input_form_styling}">
                    <input type="text" id="satellite1" placeholder="Satellite" class="${input_styling}">
                    <button data-ripple="true" id="calculate-re-entry-button" class="${button_styling}">Calculate</button>
                </div>
            `;
        case "passing-content":
            return `
                    <div class="${input_form_styling}">
                        <div id="toggle-icon" class="cursor-pointer">
                        All Satellites/Custom
                            <svg fill="#FFFFFF" height="48px" width="48px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" stroke="#FFFFFF">
                                <path d="M23,8H9c-4.4,0-8,3.6-8,8s3.6,8,8,8h14c4.4,0,8-3.6,8-8S27.4,8,23,8z M9,21c-2.8,0-5-2.2-5-5s2.2-5,5-5s5,2.2,5,5 S11.8,21,9,21z"></path>
                            </svg>
                        </div>
                        <input type="text" id="location" placeholder="Location" class="${input_styling}">
                        <button data-ripple="true" id="get-location-button" class="${location_button_styling}">Use Current Location</button>
                        <button data-ripple="true" id="select-location-button" class="${location_button_styling}">Select Location</button>
                    </div>
                `;
        default:
            return "";
    }
}
