'use client'
import { usePeerId } from '@/shared/hooks/peer-id'
import { socket } from '@/shared/socket'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export default function Room({ params }: { params: { id: string } }) {
  const [users, setUsers] = useState<string[]>([])
  const { isError, isLoading, peerId, peerInstance } = usePeerId()

  const router = useRouter()
  const roomId = params.id

  const myVideoRef = useRef<HTMLVideoElement | null>(null)
  const otherVideosRef = useRef<{ [userId: string]: HTMLVideoElement | null }>(
    {}
  )

  useEffect(() => {
    if (peerId) {
      socket.on('userJoined', (users) => {
        setUsers(users)
      })
      socket.on('userLeft', (peerId) => {
        setUsers((users) => users.filter((item) => item !== peerId))
      })

      socket.emit('joinRoom', { roomId, peerId })
      if (peerInstance) {
        peerInstance.on('call', async (call) => {
          const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
          })

          if (myVideoRef.current) {
            myVideoRef.current.srcObject = mediaStream
            myVideoRef.current.play()
          }

          call.answer(mediaStream)

          call.on('stream', (remoteStream: MediaStream) => {
            // Assuming userId is attached as metadata with the call
            const userId = call.metadata?.userId

            if (otherVideosRef.current[userId]) {
              const videoElement = otherVideosRef.current[userId]
              if (videoElement) {
                videoElement.srcObject = remoteStream
                videoElement.play()
              }
            }
          })
        })
      }
      return () => {
        socket.emit('leaveRoom', { roomId, peerId })
      }
    }
  }, [peerId])

  useEffect(() => {
    const handleDisconnect = () => {
      if (peerId) {
        socket.emit('leaveRoom', { roomId, peerId })
      }
    }

    window.addEventListener('beforeunload', handleDisconnect)

    return () => {
      window.removeEventListener('beforeunload', handleDisconnect)
    }
  }, [peerId])

  useEffect(() => {
    const callToAll = async () => {
      if (peerInstance && users.length > 0) {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        })

        users.forEach((userId) => {
          if (userId !== peerId) {
            const call = peerInstance.call(userId, mediaStream)
            call.on('stream', (remoteStream: MediaStream) => {
              if (otherVideosRef.current[userId]) {
                const videoElement = otherVideosRef.current[userId]
                if (videoElement) {
                  videoElement.srcObject = remoteStream
                  videoElement.play()
                }
              }
            })
          }
        })

        if (myVideoRef.current) {
          myVideoRef.current.srcObject = mediaStream
          myVideoRef.current.play()
        }
      }
    }

    callToAll()
  }, [peerInstance, users])

  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>Something Broke!</div>
  if (!peerId) return <div>Not Id</div>
  return (
    <div className="p-4">
      <h1>Room: {roomId}</h1>
      <div>Users in room: {users.length}</div>
      <button
        onClick={() => router.replace('/')}
        className="px-4 py-2 rounded-lg bg-gray-100 border"
      >
        Leave Room
      </button>
      <div>
        <video
          ref={myVideoRef}
          width={400}
          height={400}
          className="rounded-lg shadow-lg border"
          muted={true}
        />
        {users.map((userId) => {
          if (userId === peerId) return
          return (
            <video
              key={userId}
              ref={(video) => (otherVideosRef.current[userId] = video)}
              width={400}
              height={400}
              className="rounded-lg shadow-lg border"
            />
          )
        })}
      </div>
    </div>
  )
}
