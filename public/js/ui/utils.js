export function isMobileDevice() {
  return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

export function getLocation(locationField) {

  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude.toFixed(5);
        const longitude = position.coords.longitude.toFixed(5);
        locationField.value = `Lat: ${latitude}, Long: ${longitude}`;
      },
      (error) => {
        locationField.value = "Unable to retrieve location. Please allow location access.";
      }
    );
  } else {
    locationField.value = "Geolocation not supported by your browser.";
  }
}