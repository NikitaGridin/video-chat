'use client'
import Peer from 'peerjs'
import { useEffect, useRef, useState } from 'react'

export function VideoChat() {
  const [peerId, setPeerId] = useState('')
  const [peerInstance, setPeerInstance] = useState<Peer>()
  const [remoteUserId, setRemoteUserId] = useState('')
  const myVideoRef = useRef<HTMLVideoElement | null>(null)
  const otherViderRef = useRef<HTMLVideoElement | null>(null)
  const [callStarted, setCallStarted] = useState(false) // Состояние для отслеживания начала звонка
  const [isLoading, setisLoading] = useState(false)

  useEffect(() => {
    const loadPeer = async () => {
      const { default: Peer } = await import('peerjs')
      const peer = new Peer()

      peer.on('open', (id: string) => {
        setPeerId(id)
      })

      peer.on('call', async (call) => {
        setisLoading(true)
        setCallStarted(true)
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        })
        if (myVideoRef.current) {
          myVideoRef.current.srcObject = mediaStream
          myVideoRef.current.play()
        }
        if (otherViderRef.current) {
          otherViderRef.current.srcObject = mediaStream
          otherViderRef.current.play()
          call.on('stream', function (remoteStream: MediaStream) {
            if (otherViderRef.current) {
              otherViderRef.current.srcObject = remoteStream
            }
            otherViderRef.current?.play()
          })
        }
        call.answer(mediaStream)
        setisLoading(false)
      })

      setPeerInstance(peer)
    }

    loadPeer()
  }, [])

  const handleCall = async () => {
    setisLoading(true)

    setCallStarted(true)

    if (peerInstance) {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      if (myVideoRef.current) {
        myVideoRef.current.srcObject = mediaStream
        myVideoRef.current.play()
      }

      const call = peerInstance.call(remoteUserId, mediaStream)

      call.on('stream', (remoteStream: MediaStream) => {
        if (otherViderRef.current) {
          otherViderRef.current.srcObject = remoteStream
        }
        otherViderRef.current?.play()
      })
    }
    setisLoading(false)
  }

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert('Success copy')
    } catch (error) {
      alert('Something wrong')
    }
  }

  return (
    <div className="p-2">
      {isLoading && (
        <div className="absolute w-full h-screen bg-gray-600/50 text-3xl top-0 left-0 font-bold flex items-center justify-center text-white backdrop-blur-sm z-10">
          Loading...
        </div>
      )}
      <div className="flex flex-wrap gap-2 items-center">
        <div>{peerId ? peerId : 'Loading...'}</div>
        <button
          className="px-4 py-2 rounded-lg bg-black active:scale-95 transition-all text-white disabled:bg-black/50"
          onClick={() => {
            copyText(peerId)
          }}
        >
          Copy ID
        </button>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleCall()
        }}
        className="flex gap-2 mt-4"
      >
        <input
          className="border rounded-lg shadow-md max-w-[400px] w-full"
          type="text"
          value={remoteUserId}
          onChange={(e) => setRemoteUserId(e.target.value)}
        />
        <button
          disabled={!remoteUserId}
          type="submit"
          className="px-4 py-2 rounded-lg bg-black active:scale-95 transition-all text-white disabled:bg-black/50"
        >
          Call
        </button>
      </form>
      {callStarted && ( // Показываем теги video только если звонок начался
        <div className="flex justify-center gap-2 mt-10 flex-col xl:flex-row xl:gap-10 xl:mt-32">
          <video
            ref={myVideoRef}
            width={600}
            height={400}
            className="rounded-lg shadow-lg border"
            muted={true}
            style={{ transform: 'rotateY(180deg)' }}
          />
          <video
            ref={otherViderRef}
            width={600}
            height={400}
            className="rounded-lg shadow-lg border"
            style={{ transform: 'rotateY(180deg)' }}
          />
        </div>
      )}
    </div>
  )
}
