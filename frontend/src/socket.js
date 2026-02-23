// Socket.io client setup for frontend
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:8080";

export const socket = io(SOCKET_URL, {
  withCredentials: true,
});

// Usage: import { socket } from './socket';
// socket.emit('event', data); socket.on('event', cb);
