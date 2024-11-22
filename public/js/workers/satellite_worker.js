let orbit_data = [];

function fetchOrbitData(){
  
}

self.onmessage = function (event) {
  const { positions, speeds, startIndex, endIndex, deltaTime, command } = event.data;

  if (command === "update") {
    const positionsWriteView = new Float32Array(positions);
    const speedsView = new Float32Array(speeds);

    // Update positions for the assigned range
    for (let i = startIndex; i < endIndex; i++) {
      const idx = i * 3;
      positionsWriteView[idx] += speedsView[idx] * deltaTime;
      positionsWriteView[idx + 1] += speedsView[idx + 1] * deltaTime;
      positionsWriteView[idx + 2] += speedsView[idx + 2] * deltaTime;
    }

    postMessage("Buffers updated!");
  }
};