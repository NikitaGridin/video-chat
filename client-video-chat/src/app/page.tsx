'use client'
import { socket } from '@/shared/socket'
import Link from 'next/link'
import { useEffect, useState } from 'react'

function App() {
  const [rooms, setRooms] = useState<any[]>([])

  useEffect(() => {
    socket.emit('getRooms')

    const handleRoomsList = (roomsList: any) => {
      setRooms(roomsList)
    }

    socket.on('roomsList', handleRoomsList)

    return () => {
      socket.off('roomsList', handleRoomsList)
    }
  }, [])

  const createRoom = () => {
    const roomName = prompt('Enter room name:')
    if (roomName) socket.emit('createRoom', roomName)
  }

  return (
    <div className="p-4 space-y-4">
      <button
        onClick={createRoom}
        className="px-4 py-2 rounded-lg bg-black text-white"
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
              className="border py-2 px-4 rounded-lg shadow-md transition-all active:scale-95 block"
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
