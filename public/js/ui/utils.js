export function isMobileDevice() {
  return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

export function isMobileScreen() {
  return window.innerWidth < 768;
}

export function getLocation() {
  return new Promise((resolve, reject) => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const long = position.coords.longitude;
          console.log(lat, long);
          resolve({ lat, long });
        },
        (error) => {
          console.error("Error getting location:", error);
          reject(null);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      reject(null);
    }
  });
}
