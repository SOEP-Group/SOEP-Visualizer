import { getLocation } from "./utils.js";
import { globalState } from "../globalState.js";

export function initPredictions() {
    document.getElementById("passing-prediction-header").addEventListener("click", function () {
        toggleSection('passing-content', 'arrow-passing');
    });

    document.getElementById("pass-prediction-header").addEventListener("click", function () {
        toggleSection('pass-content', 'arrow-pass');
    });

    document.getElementById("re-entry-prediction-header").addEventListener("click", function () {
        toggleSection('re-entry-content', 'arrow-re-entry');
    });

    const location_btns = document.querySelectorAll(".get-location-btn");

    location_btns.forEach((btn) => {
        btn.addEventListener("click", function (event) {

            const locationField = event.target.parentElement.getElementsByClassName("location-field")[0];
            getLocation(locationField);
        });
    });

    const selectLocationBtn = document.querySelectorAll(".select-location-button");
    selectLocationBtn.forEach((btn) => {
        btn.addEventListener("click", function (event) {
            let picking = globalState.get("pickingLocation");
            if(picking == null) {
                picking = false;
            }
            globalState.set({ pickingLocation: !picking });

            for (let i = 0; i < selectLocationBtn.length; i++) {
                if (picking) {
                    selectLocationBtn[i].innerText = "Select Location";
                } else {            
                    selectLocationBtn[i].innerText = "Click on earth (Press here to Cancel)";
                }
            }

            
        });
    });
    
    document.addEventListener("click", function (event) {
        if (event.target && event.target.id === "select-location-button") {
            let picking = globalState.get("pickingLocation");
            if(picking == null) {
                picking = false;
            }
            globalState.set({ pickingLocation: !picking });
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
}

function toggleSection(contentId, arrowId) {
    const contentElement = document.getElementById(contentId);
    const arrowElement = document.getElementById(arrowId);

    contentElement.classList.toggle('hidden');

    // Rotate the arrow icon based on visibility
    if (contentElement.classList.contains('hidden')) {
        arrowElement.querySelector('svg').classList.remove('rotate-90');
    } else {
        arrowElement.querySelector('svg').classList.add('rotate-90');
    }
}

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
