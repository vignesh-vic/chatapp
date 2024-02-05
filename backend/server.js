const path = require('path')
const dotenv = require('dotenv');
const bodyParser = require("body-parser");
const express = require('express')
const { chats } = require('./data/data')
const connectDB = require("./config/db.js")
const app = express()

const userRoutes = require("./routes/userRoutes.js")
const chatRoutes = require("./routes/chatRoute.js")
const messageRoutes = require("./routes/messageRoutes.js")
const { notFound, errorHandler } = require("../backend/middleware/errorMiddleware.js")
dotenv.config({ path: path.join(__dirname, "/.env") })


connectDB();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use('/api/user', userRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/message', messageRoutes)

app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, function () {
    console.log(`Server is listening on port ${PORT}`);
});

const io = require("socket.io")(server, {
    // pingTimeout: 60000,
    cors: {
        origin: "http://localhost:3001",
        // credentials: true,
    },
});
// Middleware to attach io to req
app.use((req, res, next) => {
    req.io = io;
    next();
});

io.on("connection", (socket) => {
    console.log('connteced to socket io ');
    socket.on('setup', (userData) => {
        socket.join(userData._id)
        socket.emit('connected');
    })

    socket.on('join chat', (room) => {
        console.log(`User joined room: ${room}`);
        socket.join(room);
    })
    socket.on('typing', (room) => socket.in(room).emit('typing'))
    socket.on('stop typing', (room) => socket.in(room).emit('stop typing'))


    socket.on('new message', (newMessageReceived) => {
        var chat = newMessageReceived.chat
        if (!chat.users) return console.log('chat.users not defined');
        chat.users.forEach(user => {
            if (user._id === newMessageReceived.sender._id) return;
            socket.in(user._id).emit("message recieved", newMessageReceived);

        })
    })

    socket.on('delete', (messageId, chatId) => {
        socket.in(chatId).emit('delete',messageId)
    })



    socket.off("setup", () => {
        console.log("USER DISCONNECTED");
        socket.leave(userData._id);
    });

})


