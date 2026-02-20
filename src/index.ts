import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

import authRoutes from './routes/auth.routes';
import flashcardRoutes from './routes/flashcard.routes';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // For development. Update for production!
        methods: ['GET', 'POST'],
    },
});

const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Main Routes
app.use('/api/auth', authRoutes);
app.use('/api/flashcards', flashcardRoutes);

// Base Route
app.get('/', (req, res) => {
    res.send('StudyRoom Backend is Running! WebSocket and API server active.');
});

// Basic health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date() });
});

// Socket.io logic
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Join a specific room
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    // Handle chat messages
    socket.on('send-message', async (data) => {
        const { roomId, content, userId } = data;

        // Broadcast to room
        io.to(roomId).emit('receive-message', data);

        // Try to persist message if userId is provided
        if (userId) {
            try {
                await prisma.message.create({
                    data: {
                        content,
                        roomId,
                        userId
                    }
                });
            } catch (err) {
                console.error("Failed to save message to db", err);
            }
        }
    });

    // Handle whiteboard drawing
    socket.on('draw', (data) => {
        // Broadcast drawing data to everyone in the room EXCEPT the sender
        socket.to(data.roomId).emit('draw', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
});
