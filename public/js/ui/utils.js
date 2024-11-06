export function isMobileDevice() {
  return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

export function getLocation() {
  const locationInput = document.getElementById("location");

  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude.toFixed(5);
        const longitude = position.coords.longitude.toFixed(5);
        locationInput.value = `Lat: ${latitude}, Long: ${longitude}`;
      },
      (error) => {
        locationInput.value = "Unable to retrieve location. Please allow location access.";
      }
    );
  } else {
    locationInput.value = "Geolocation not supported by your browser.";
  }
}