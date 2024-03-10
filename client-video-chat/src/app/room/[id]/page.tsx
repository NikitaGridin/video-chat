'use client'
import { usePeerId } from '@/shared/hooks/peer-id'
import { socket } from '@/shared/socket'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

const constraints = {
  video: {
    width: { max: 320 },
    height: { max: 240 },
    frameRate: { max: 10 },
    facingMode: 'user'
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true
  }
}

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
          const mediaStream = await navigator.mediaDevices.getUserMedia(
            constraints
          )

          if (myVideoRef.current) {
            myVideoRef.current.srcObject = mediaStream
            myVideoRef.current.play()
          }

          call.answer(mediaStream)

          call.on('stream', (remoteStream: MediaStream) => {
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
        socket.disconnect()
      }
    }
  }, [peerId])

  useEffect(() => {
    const handleUnload = async () => {
      if (peerId) {
        socket.emit('leaveRoom', { roomId, peerId })
      }
    }

    window.addEventListener('unload', handleUnload)

    return () => {
      window.removeEventListener('unload', handleUnload)
    }
  }, [peerId])

  useEffect(() => {
    const callToAll = async () => {
      if (peerInstance && users.length > 0) {
        const mediaStream = await navigator.mediaDevices.getUserMedia(
          constraints
        )
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

  if (isLoading)
    return (
      <div className="h-screen flex justify-center items-center">
        Loading...
      </div>
    )
  if (isError) return <div>Something Broke!</div>
  if (!peerId) return <div>Not Id</div>

  return (
    <div className="p-4 flex flex-col gap-4 items-center min-h-screen justify-center">
      <div className="flex flex-col gap-2 xl:flex-row">
        <video
          ref={myVideoRef}
          className="rounded-lg"
          muted={true}
          style={{
            transform: 'rotateY(180deg)'
          }}
        />
        {users.map((userId) => {
          if (userId === peerId) return
          return (
            <video
              key={userId}
              ref={(video) => (otherVideosRef.current[userId] = video)}
              className="rounded-lg"
              style={{
                transform: 'rotateY(180deg)'
              }}
            />
          )
        })}
      </div>
      <button
        onClick={() => router.push('/')}
        className="px-4 py-2 rounded-lg bg-rose-500 text-white font-semibold"
      >
        Leave
      </button>
    </div>
  )
}
