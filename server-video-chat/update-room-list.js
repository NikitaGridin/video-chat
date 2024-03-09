export function updateRoomsList(socket, rooms) {
  socket.emit(
    "roomsList",
    Object.keys(rooms).map((roomId) => ({
      id: roomId,
      name: rooms[roomId].name,
      users: rooms[roomId].users,
    }))
  );
}
