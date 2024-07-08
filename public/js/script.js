const socket = io(); // Connect to your server

const map = L.map("map").setView([0, 0], 16); // Initial view set to a wider range

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "Dev Yousuf",
}).addTo(map);

const markers = {};

socket.on("received-location", (position) => {
  const { id, latitude, longitude } = position;

  // If a marker for this id doesn't exist, create one
  if (!markers[id]) {
    markers[id] = L.marker([latitude, longitude]).addTo(map);
  } else {
    // Otherwise, update the position of the existing marker
    markers[id].setLatLng([latitude, longitude]);
  }

  // Optionally, set the map view to the first received location
  if (id === socket.id) {
    map.setView([latitude, longitude], 16);
  }
});

// Handle user disconnection
socket.on("user-disconnected", (id) => {
  if (markers[id]) {
    map.removeLayer(markers[id]);
    delete markers[id];
  }
});

// Get current location
if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      socket.emit("send-location", { latitude, longitude });
    },
    (error) => {
      console.error("Error getting location", error);
    },
    { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
  );
} else {
  console.error("Geolocation is not supported by this browser.");
}
