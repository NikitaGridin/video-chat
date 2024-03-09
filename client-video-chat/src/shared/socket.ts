import socketIOClient from 'socket.io-client'

const ENDPOINT = 'http://localhost:4000' // Change to your server address
export const socket = socketIOClient(ENDPOINT)
