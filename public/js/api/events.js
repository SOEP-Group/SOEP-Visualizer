const applicationId = 'APPLICATION_ID';
const applicationSecret = 'APPLICATION_SECRET';

const authString = btoa(`${applicationId}:${applicationSecret}`);

const baseURL = 'https://api.astronomyapi.com/v2/bodies/events/';

function fetchEvents() {
    console.log('Simulating API response...');
    const mockData = [
        {
            name: 'Lunar Eclipse',
            date: '2024-11-19',
            description: 'The Moon will pass into Earth\'s shadow, creating a spectacular eclipse.'
        },
        {
            name: 'Meteor Shower',
            date: '2024-12-13',
            description: 'Peak night for the Geminids meteor shower.'
        }
    ];
    displayEvents(mockData);
}

function displayEvents(events) {
    console.log('Displaying events:', events);
    const container = document.querySelector('.tab-content .tab-panel');
    container.innerHTML = '';

    if (!events || events.length === 0) {
        container.innerHTML = '<p>No upcoming events found.</p>';
        return;
    }

    events.forEach(event => {
        const eventElement = document.createElement('div');
        eventElement.classList.add('event');
        eventElement.innerHTML = `
            <h2>${event.name}</h2>
            <p><strong>Date:</strong> ${event.date}</p>
            <p>${event.description || 'No description available.'}</p>
        `;
        container.appendChild(eventElement);
    });
}

fetchEvents();
