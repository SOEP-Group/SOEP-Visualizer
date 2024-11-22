self.onmessage = function (event) {
  const { positions, speeds, startIndex, endIndex, deltaTime, command } =
    event.data;

  if (command === "update") {
    // const posArray = new Float32Array(positions);
    // const speedArray = new Float32Array(speeds);
    // Update positions for the assigned range
    // for (let i = startIndex; i < endIndex; i++) {
    //   const idx = i * 3;
    //   posArray[idx] += speedArray[idx] * deltaTime;
    //   posArray[idx + 1] += speedArray[idx + 1] * deltaTime;
    //   posArray[idx + 2] += speedArray[idx + 2] * deltaTime;
    // }
    // Send the updated buffer back to the main thread
    // self.postMessage({ buffer: positions }, [positions]);
  }
};
