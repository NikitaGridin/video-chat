import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import { updateRoomsList } from "./update-room-list.js";
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const PORT = process.env.PORT || 4000;

const rooms = {};

io.on("connection", (socket) => {
  socket.on("createRoom", (roomName) => {
    const roomId = uuidv4();
    rooms[roomId] = { name: roomName, users: [] };
    updateRoomsList(io, rooms);
  });

  socket.on("joinRoom", ({ roomId, peerId }) => {
    if (rooms[roomId]) {
      socket.join(roomId);
      rooms[roomId].users.push(peerId);
      io.to(roomId).emit("userJoined", rooms[roomId].users);
      updateRoomsList(io, rooms);
    }
  });

  socket.on("leaveRoom", ({ roomId, peerId }) => {
    if (rooms[roomId]) {
      const index = rooms[roomId].users.indexOf(peerId);
      if (index !== -1) {
        rooms[roomId].users.splice(index, 1);
        io.to(roomId).emit("userLeft", peerId);
        updateRoomsList(io, rooms);
      }
    }
  });

  socket.on("getRooms", () => {
    updateRoomsList(socket, rooms);
  });

  socket.on("disconnect", () => {});
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
