document.addEventListener('DOMContentLoaded', () => {
    fetch('/views/popup.html')
        .then(response => response.text())
        .then(html => {
            const container = document.getElementById('popup-container');
            if (container) {
                container.innerHTML = html;

                const closeButton = document.getElementById('close-popup');
                if (closeButton) {
                    closeButton.addEventListener('click', () => {
                        const popup = document.getElementById('satellite-popup');
                        if (popup) {
                            popup.classList.add('hidden');
                        }
                    });
                } else {
                    console.error('Close button not found');
                }
            } else {
                console.error('Popup container not found');
            }
        })
        .catch(error => console.error('Error loading popup HTML:', error));
});

function openPopup(data) {
    const nameElement = document.getElementById('satellite-name');
    const launchDateElement = document.getElementById('launch-date');

    if (nameElement && launchDateElement) {
        nameElement.textContent = data.name || 'N/A';
        launchDateElement.textContent = data.launchDate || 'N/A';
        const popup = document.getElementById('satellite-popup');
        if (popup) {
            popup.classList.remove('hidden'); // Show popup
        }
    } else {
        console.error('Popup elements not found');
    }
}

function closePopup() {
    document.getElementById('satellite-popup').classList.add('hidden');
}


fetch('/views/popup.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('popup-container').innerHTML = html;
    })
    .catch(error => console.error('Error loading popup HTML:', error));