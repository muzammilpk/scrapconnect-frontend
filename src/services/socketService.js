import { io } from 'socket.io-client';

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, '')
    : 'http://localhost:5000');

let socket = null;

export const getSocket = () => {
  if (!socket) {
    const token = localStorage.getItem('scrapconnect_token');
    socket = io(SOCKET_URL, {
      auth: { token },
      query: { token },
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log('🔌 Connected to ScrapConnect Socket.IO server:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
