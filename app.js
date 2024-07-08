const express = require("express");
const app = express();
const http = require("http").createServer(app);
const path = require("path");
const io = require("socket.io")(http);

// EJS setup
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

// Socket.io
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("send-location", (data) => {
    console.log("Location received:", data);
    io.emit("received-location", { id: socket.id, ...data });
  });

  socket.on("disconnect", () => {
    io.emit("user-disconnected", socket.id);
  });
});


const router = express.Router();

router.get("/", (req, res) => {
  res.render("index");
});

// Listen
app.use("/.netlify/functions/app", router);
module.exports.handler = serverless(app);
