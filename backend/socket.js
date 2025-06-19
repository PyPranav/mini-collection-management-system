const { Server } = require("socket.io");

let io = null;

function setupSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
}

function broadcastNotification(message) {
  if (io) {
    io.emit("notification", message);
  }
}

module.exports = {
  setupSocket,
  broadcastNotification,
}; 