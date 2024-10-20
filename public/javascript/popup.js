document.addEventListener('DOMContentLoaded', () => {
    fetch('/views/popup.html')
        .then(response => response.text())
        .then(html => {
            const container = document.getElementById('popup-container');
            if (container) {
                container.innerHTML = html;

                const closeButtons = container.querySelectorAll('.close-btn');
                closeButtons.forEach(button => {
                    button.addEventListener('click', () => {
                        hidePopup();
                    });
                });

                document.addEventListener('click', (event) => {
                    const popup = document.getElementById('satellite-popup');
                    const isClickInside = popup.contains(event.target) || popup === event.target;

                    if (!isClickInside) {
                        hidePopup(); // Hide the popup if the click is outside
                    }
                });
            } else {
                console.error('Popup container not found');
            }
        })
        .catch(error => console.error('Error loading popup HTML:', error));
});

function hidePopup() {
    const popup = document.getElementById('satellite-popup');
    if (popup) {
        popup.classList.add('hidden'); // Hide popup
    }
}

function openPopup(data) {
    const nameElement = document.getElementById('satellite-name');
    const speedElement = document.getElementById('satellite-speed');
    const coordinatesElement = document.getElementById('satellite-coordinates');
    const launchDateElement = document.getElementById('launch-date');

    if (nameElement && launchDateElement && speedElement && coordinatesElement) {
        nameElement.textContent = data.name || 'N/A';
        speedElement.textContent = data.speed || 'N/A';
        coordinatesElement.textContent = data.position || 'N/A';
        launchDateElement.textContent = data.launchDate || 'N/A';

        const popup = document.getElementById('satellite-popup');
        if (popup) {
            popup.classList.remove('hidden'); // Show popup
        }
    } else {
        console.error('Popup elements not found');
    }
}
