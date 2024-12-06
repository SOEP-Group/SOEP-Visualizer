export function initGraphs() {
    const graphContainer = document.getElementById("graphs-container");

    const mockData = {
        labels: ["0s", "1s", "2s", "3s", "4s", "5s", "6s"],
        speedData: [0, 5, 10, 15, 20, 15, 10],
        heightData: [500, 505, 510, 515, 520, 515, 510],
        latitudeData: [0, 1, 2, 3, 4, 3, 2],
        longitudeData: [10, 15, 20, 25, 30, 25, 20],
    };

    addSeparatorLine(graphContainer);
    renderGraph("Speed (km/h)", mockData.labels, mockData.speedData, graphContainer);
    addSeparatorLine(graphContainer);
    renderGraph("Height (km)", mockData.labels, mockData.heightData, graphContainer);
    addSeparatorLine(graphContainer);
    renderGraph("Latitude", mockData.labels, mockData.latitudeData, graphContainer);
    addSeparatorLine(graphContainer);
    renderGraph("Longitude", mockData.labels, mockData.longitudeData, graphContainer);
}

function renderGraph(title, labels, data, container) {
    const header = document.createElement("h3");
    header.innerText = title;
    header.style.textAlign = "left";
    header.style.color = "white";
    header.style.fontWeight = "bold";
    header.style.marginBottom = "10px";
    container.appendChild(header);

    const canvas = document.createElement("canvas");
    canvas.style.marginBottom = "20px";
    container.appendChild(canvas);

    new Chart(canvas.getContext("2d"), {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    label: title,
                    data: data,
                    borderColor: "rgba(75, 192, 192, 1)",
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                    borderWidth: 2,
                    tension: 0.3,
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false,
                },
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Time",
                        color: "white",
                    },
                    ticks: {
                        color: "white",
                    },
                    grid: {
                        color: "rgba(255, 255, 255, 0.2)",
                    },
                },
                y: {
                    title: {
                        display: true,
                        text: title,
                        color: "white",
                    },
                    ticks: {
                        color: "white",
                    },
                    grid: {
                        color: "rgba(255, 255, 255, 0.2)",
                    },
                },
            },
        },
    });
}

function addSeparatorLine(container) {
    const separator = document.createElement("hr");
    separator.style.border = "1px solid rgba(255, 255, 255, 0.2)";
    separator.style.margin = "20px auto";
    separator.style.width = "90%";
    container.appendChild(separator);
}
