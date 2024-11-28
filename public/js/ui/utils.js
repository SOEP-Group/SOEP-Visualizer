export function isMobileDevice() {
  return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

export function getLocation(locationField) {
  return new Promise((resolve, reject) => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude.toFixed(5);
          const longitude = position.coords.longitude.toFixed(5);
          if (locationField) {
            locationField.value = `Lat: ${latitude}, Long: ${longitude}`;
          }
          resolve({ latitude, longitude });
        },
        (error) => {
          if (locationField) {
            locationField.value =
              "Unable to retrieve location. Please allow location access.";
          }
          reject("Unable to retrieve location.");
        }
      );
    } else {
      if (locationField) {
        locationField.value = "Geolocation not supported by your browser.";
      }
      reject("Geolocation not supported by your browser.");
    }
  });
}