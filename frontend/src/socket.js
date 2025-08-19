import { io } from 'socket.io-client';
const socket = io("https://health-management-and-information-system.onrender.com");

// Log connection status
socket.on('connect', () => {
  console.log('[Frontend Socket] Connected:', socket.id);
});
socket.on('disconnect', () => {
  console.log('[Frontend Socket] Disconnected');
});

// Log all events
socket.onAny((event, ...args) => {
  console.log('[Frontend Socket] Event:', event, args);
});

export default socket;
