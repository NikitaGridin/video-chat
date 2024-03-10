import socketIOClient from 'socket.io-client'

const ENDPOINT = process.env.NEXT_PUBLIC_ENV_BACKEND_URL ?? '' // Change to your server address
export const socket = socketIOClient(ENDPOINT)
