'use client'
import { socket } from '@/shared/socket'
import Link from 'next/link'
import { useEffect, useState } from 'react'

function App() {
  const [rooms, setRooms] = useState<any[]>([])

  useEffect(() => {
    socket.emit('getRooms')

    socket.on('roomsList', (roomsList) => {
      console.log(roomsList)

      setRooms(roomsList)
    })
  }, [])

  const createRoom = () => {
    const roomName = prompt('Enter room name:')
    if (roomName) socket.emit('createRoom', roomName)
  }

  return (
    <div className="p-4 space-y-4">
      <button
        onClick={createRoom}
        className="px-4 py-2 rounded-lg bg-gray-100 border"
      >
        Create Room
      </button>
      <div>
        <h1>Rooms List</h1>

        <div className="flex gap-5 flex-wrap">
          {rooms.map((room) => (
            <Link
              key={room.id}
              href={`/room/${room.id}`}
              className="border py-2 px-4 rounded-lg shadow-md transition-all active:scale-95"
            >
              {room.name}
              <div>users: {room.users?.length ?? 0}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App
