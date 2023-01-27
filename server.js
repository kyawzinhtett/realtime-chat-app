const path = require("path");
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const formatMessage = require("./utils/message");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");

const app = express();
const server = createServer(app);
const io = new Server(server);

const port = 3000;

// Serve static file
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);

    // Welcome user
    socket.emit("broadcast", "Welcome to Chat App!");

    // Broadcast when user connects
    socket.broadcast
      .to(user.room)
      .emit("broadcast", `${user.username} has joined the room`);

    // Send room users
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  // Emit chat messages
  socket.on("message", (msg) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });

  // Broadcast when user disconnects
  socket.on("disconnect", function () {
    const user = userLeave(socket.id);

    if (user) {
      socket.broadcast
        .to(user.room)
        .emit("broadcast", `${user.username} has left the room`);

      // Send room users
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

server.listen(port, () => console.log(`Server running on port: ${port}`));
