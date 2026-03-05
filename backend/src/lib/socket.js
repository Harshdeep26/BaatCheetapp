import {Server} from 'socket.io';
import http from 'http';
import express from 'express';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"],
    },
});

export function getRecieverSocketId(userId){
    return userSocketMap[userId]; // Return the socket ID for the given userId
};

const userSocketMap = {}; // Map to store online users and their socket IDs {userId: socketId}

io.on('connection', (socket) => {
    console.log("A user connected",socket.id);

    const userId = socket.handshake.query.userId; // Assuming client sends userId as a query parameter during connection
    if (userId) userSocketMap[userId] = socket.id; // Store the mapping of userId to socketId

    // io.emit is used to send events to all connected clients, while socket.emit is used to send events to the specific client that initiated the connection. In this case, we want to notify all clients about the updated list of online users whenever a new user connects or disconnects, so we use io.emit to broadcast the event to everyone.
    io.emit("getOnlineUsers", Object.keys(userSocketMap)); // Emit the updated list of online users to all clients

    socket.on('disconnect', () => {
        console.log("A user disconnected",socket.id);
        delete userSocketMap[userId]; // Remove the user from the online users map on disconnect
        io.emit("getOnlineUsers", Object.keys(userSocketMap)); // Emit the updated list of online users to all clients
    });
});

export {io , app , server};