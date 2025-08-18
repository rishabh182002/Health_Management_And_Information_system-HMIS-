// server.js
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import adminRouter from './routes/adminRoute.js';
import doctorRouter from './routes/doctorRoute.js';
import userRouter from './routes/userRoute.js';

import http from 'http';
import { Server } from 'socket.io';

// app config
const app = express();
const port = process.env.Port || 4000;

// connect DB and cloudinary
connectDB();
connectCloudinary();

// middleware
app.use(express.json());
app.use(cors());

// endpoints
app.use('/api/admin', adminRouter);
app.use('/api/doctor', doctorRouter);
app.use('/api/user', userRouter);

app.get('/', (req, res) => {
  res.send('API WORKING');
});

// create HTTP server and attach socket.io
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST'],
  },
});


// socket.io events for WebRTC signaling
io.on('connection', (socket) => {
  console.log('[Backend] Socket connected:', socket.id);

  // Log all events
  socket.onAny((event, ...args) => {
    console.log(`[Backend] Event: ${event}`, args);
  });

  socket.on('join-room', (roomId) => {
    console.log('[Backend] join-room', roomId, socket.id);
    socket.join(roomId);
    socket.to(roomId).emit('user-joined', socket.id);
  });

  socket.on('offer', (data) => {
    console.log('[Backend] offer', data.roomId, socket.id, data);
    // Send both offer and roomId
    socket.to(data.roomId).emit('receive-offer', { offer: data.offer, roomId: data.roomId });
  });

  socket.on('answer', (data) => {
    console.log('[Backend] answer', data.roomId, socket.id, data);
    // Send both answer and roomId
    socket.to(data.roomId).emit('receive-answer', { answer: data.answer, roomId: data.roomId });
  });

  socket.on('ice-candidate', (data) => {
    console.log('[Backend] ice-candidate', data.roomId, socket.id, data);
    // Send both candidate and roomId
    socket.to(data.roomId).emit('receive-ice-candidate', { candidate: data.candidate, roomId: data.roomId });
  });

  socket.on('call-end', (data) => {
    // Notify all in the room except sender
    if (data && data.roomId) {
      socket.to(data.roomId).emit('call-ended', { roomId: data.roomId });
    }
  });

  socket.on('disconnect', () => {
    console.log('[Backend] Socket disconnected:', socket.id);
  });
});

// start server
server.listen(port, () => console.log('Server + Socket.io running on port', port));