'use client'
import Peer from 'peerjs'
import { useEffect, useState } from 'react'

export function usePeerId() {
  const [peerId, setPeerId] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [peerInstance, setPeerInstance] = useState<Peer>()

  useEffect(() => {
    const loadPeer = async () => {
      setIsLoading(true)

      try {
        const { default: Peer } = await import('peerjs')
        const peer = new Peer()
        setPeerInstance(peer)
        peer.on('open', (id: string) => {
          setPeerId(id)
          setIsLoading(false)
        })
      } catch (error) {
        setIsError(true)
        setIsLoading(false)
      }
    }
    loadPeer()
  }, [])

  return { peerId, isLoading, isError, peerInstance }
}
