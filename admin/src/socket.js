import { io } from 'socket.io-client';
const socket = io("https://health-management-and-information-system.onrender.com");

// Log connection status
socket.on('connect', () => {
  console.log('[Admin Socket] Connected:', socket.id);
});
socket.on('disconnect', () => {
  console.log('[Admin Socket] Disconnected');
});

// Log all events
socket.onAny((event, ...args) => {
  console.log('[Admin Socket] Event:', event, args);
});

export default socket;
