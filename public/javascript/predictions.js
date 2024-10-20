const dropdownTrigger = document.querySelector('.prediction-dropdown-trigger');
const dropdownContent = document.getElementById('prediction-dropdown');
const sideWindow = document.getElementById('side-window');
const windowContent = document.getElementById('window-content');
const closeWindowButton = document.getElementById('close-window');
const dropdownItems = document.querySelectorAll('.dropdown-item');

const MIN_WIDTH = 150;
let lastWidth = 300;

function getContent(itemType) {
    switch (itemType) {
        case 'collision':
            return `
                <h2>Collision Prediction</h2>
                <div class="form-container">
                    <input type="text" id="satellite1" placeholder="Satellite 1" class="input-box">
                    <input type="text" id="satellite2" placeholder="Satellite 2" class="input-box">
                    <button id="calculate-button" class="calculate-button">Calculate</button>
                </div>
            `;
        case 'pass':
            return `
                <h2>Pass Prediction</h2>
                <div class="form-container">
                    <input type="text" id="satellite1" placeholder="Satellite 1" class="input-box">
                    <input type="text" id="satellite2" placeholder="Location" class="input-box">
                    <button id="calculate-button" class="calculate-button">Calculate</button>
                </div>
            `;
        case 'reentry':
            return `
                <h2>Re-entry Prediction</h2>
                <div class="form-container">
                    <input type="text" id="satellite1" placeholder="Satellite 1" class="input-box">
                    <button id="calculate-button" class="calculate-button">Calculate</button>
                </div>
            `;
        default:
            return '';
    }
}

dropdownTrigger.addEventListener('click', (event) => {
    event.stopPropagation();
    dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
    sideWindow.classList.remove('open');
    sideWindow.style.width = "0";
});

dropdownItems.forEach(item => {
    item.addEventListener('click', (event) => {
        event.preventDefault();
        const itemType = event.target.getAttribute('data-type');

        windowContent.innerHTML = getContent(itemType);
        sideWindow.style.width = `${lastWidth}px`;
        sideWindow.classList.add('open');
        dropdownContent.style.display = 'none';
    });
});

closeWindowButton.addEventListener('click', () => {
    sideWindow.classList.remove('open');
    sideWindow.style.width = "0";
});

document.addEventListener('click', (event) => {
    if (!sideWindow.contains(event.target) && !dropdownContent.contains(event.target) && !dropdownTrigger.contains(event.target)) {
        sideWindow.classList.remove('open');
        dropdownContent.style.display = 'none';
        sideWindow.style.width = "0";
    }
});