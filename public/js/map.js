const socket = io('http://localhost:4000'); // Connect to your server

socket.on('connect', () => {
  console.log('Connected to server:', socket.id);
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});

const map = L.map("map").setView([0, 0], 10);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "Dev Yousuf",
}).addTo(map);

const markers = {};

socket.on("received-location", (position) => {
  console.log('Received position:', position);
  const { id, latitude, longitude } = position;

  map.setView([latitude, longitude], 16);

  if (!markers[id]) {
    markers[id] = L.marker([latitude, longitude]).addTo(map);
  } else {
    markers[id].setLatLng([latitude, longitude]);
  }
});

if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      console.log("Sending location to server:", latitude, longitude);
      socket.emit("send-location", { latitude, longitude });
    },
    (error) => {
      console.error("Error getting location", error);
    },
    { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
  );
}