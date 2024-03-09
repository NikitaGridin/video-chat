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
      setIsLoading(true) // Устанавливаем isLoading в true при начале загрузки

      try {
        const { default: Peer } = await import('peerjs')
        const peer = new Peer()
        setPeerInstance(peer)
        peer.on('open', (id: string) => {
          setPeerId(id)
          setIsLoading(false) // Устанавливаем isLoading в false после успешного получения peerId
        })
      } catch (error) {
        console.error('Error loading Peer:', error)
        setIsError(true) // Устанавливаем isError в true при возникновении ошибки
        setIsLoading(false) // Устанавливаем isLoading в false в случае ошибки
      }
    }
    loadPeer()
  }, [])

  return { peerId, isLoading, isError, peerInstance }
}
