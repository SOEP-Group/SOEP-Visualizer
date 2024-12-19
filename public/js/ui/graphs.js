import {
  twoline2satrec,
  propagate,
  gstime,
  eciToGeodetic,
} from "../../libs/satellite.js/dist/satellite.es.js";
import { subscribe } from "../eventBuss.js";
import { glState } from "../gl/index.js";
import { satellites } from "../gl/scene.js";

let currentCharts = [];
let graphContainer;

export function initGraphs() {
  graphContainer = document.getElementById("graphs-container");
  clearGraphs();
  showNoSatelliteMessage();
  subscribe("glStateChanged", onGlStateChanged);
}

function onGlStateChanged(prevState) {
  if ("clickedSatellite" in prevState) {
    const clickedSatellite = glState.get("clickedSatellite");

    if (clickedSatellite) {
      const tleData = satellites.getTLEData(clickedSatellite);

      if (tleData && tleData.first && tleData.second) {
        const simulation = generateFutureSimData(tleData.first, tleData.second);
        if (simulation) {
          clearGraphs();
          // add satellite name here
          addSeparatorLine(graphContainer);
          renderGraph(
            "Speed (km/h)",
            simulation.labels,
            simulation.speedData,
            simulation.times,
            graphContainer
          );
          addSeparatorLine(graphContainer);
          renderGraph(
            "Height (km)",
            simulation.labels,
            simulation.altitudeData,
            simulation.times,
            graphContainer
          );
          addSeparatorLine(graphContainer);
          renderGraph(
            "Latitude (°)",
            simulation.labels,
            simulation.latitudeData,
            simulation.times,
            graphContainer
          );
          addSeparatorLine(graphContainer);
          renderGraph(
            "Longitude (°)",
            simulation.labels,
            simulation.longitudeData,
            simulation.times,
            graphContainer
          );
        }
      } else {
        console.error(
          "No valid TLE data found for clicked satellite:",
          clickedSatellite
        );
        clearGraphs();
        showNoSatelliteMessage();
      }
    } else {
      clearGraphs();
      showNoSatelliteMessage();
    }
  }
}

function showNoSatelliteMessage() {
  const message = document.createElement("p");
  message.innerText = "No satellite is selected";
  message.style.textAlign = "center";
  message.style.color = "white";
  message.style.fontWeight = "bold";
  graphContainer.appendChild(message);
}

function renderGraph(title, labels, data, times, container) {
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

  const chart = new Chart(canvas.getContext("2d"), {
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
          pointRadius: 0,
          pointHoverRadius: 10,
          hitRadius: 10,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            title: (tooltipItems) => {
              const index = tooltipItems[0].dataIndex;
              return times[index];
            },
            label: (tooltipItem) => {
              return `${tooltipItem.dataset.label}: ${tooltipItem.formattedValue}`;
            },
          },
          displayColors: false,
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Time (min)",
            color: "white",
          },
          ticks: {
            color: "transparent",
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

  currentCharts.push(chart);
}

function addSeparatorLine(container) {
  const separator = document.createElement("hr");
  separator.style.border = "1px solid rgba(255, 255, 255, 0.2)";
  separator.style.margin = "20px auto";
  separator.style.width = "90%";
  container.appendChild(separator);
}

function clearGraphs() {
  currentCharts.forEach((chart) => chart.destroy());
  currentCharts = [];
  graphContainer.innerHTML = "";
}

function generateFutureSimData(tleLine1, tleLine2) {
  const satrec = twoline2satrec(tleLine1, tleLine2);
  if (!satrec) {
    console.error("Failed to parse TLE.");
    return null;
  }

  const steps = 60;
  const timeStep = 60;

  const labels = [];
  const speedData = [];
  const altitudeData = [];
  const latitudeData = [];
  const longitudeData = [];
  const times = [];

  const earthRadius = 6371;
  const startTime = new Date();

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  for (let i = 0; i <= steps; i++) {
    const futureTime = new Date(startTime.getTime() + i * timeStep * 1000);
    const positionAndVelocity = propagate(satrec, futureTime);

    labels.push(`${i}`);

    const m = monthNames[futureTime.getMonth()];
    const d = futureTime.getDate();
    const hh = String(futureTime.getHours()).padStart(2, "0");
    const mm = String(futureTime.getMinutes()).padStart(2, "0");
    const displayTime = `${d} ${m} ${hh}:${mm}`;
    times.push(displayTime);

    if (positionAndVelocity.position && positionAndVelocity.velocity) {
      const { x, y, z } = positionAndVelocity.position;
      const { x: vx, y: vy, z: vz } = positionAndVelocity.velocity;

      const speed_km_s = Math.sqrt(vx * vx + vy * vy + vz * vz);
      const speed_km_h = speed_km_s * 3600;

      const distance = Math.sqrt(x * x + y * y + z * z);
      const altitude = distance - earthRadius;

      const gmst = gstime(futureTime);
      const geo = eciToGeodetic({ x, y, z }, gmst);
      const latitude = geo.latitude * (180 / Math.PI);
      const longitude = geo.longitude * (180 / Math.PI);

      speedData.push(speed_km_h);
      altitudeData.push(altitude);
      latitudeData.push(latitude);
      longitudeData.push(longitude);
    } else {
      speedData.push(null);
      altitudeData.push(null);
      latitudeData.push(null);
      longitudeData.push(null);
    }
  }

  return {
    labels,
    times,
    speedData,
    altitudeData,
    latitudeData,
    longitudeData,
  };
}
