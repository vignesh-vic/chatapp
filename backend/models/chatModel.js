//create --chat app
//chatName
//isGroupChat
//users
//latestMessage
//groupAdmin
const moment = require('moment'); // Import moment
const mongoose = require('mongoose')

const chatModel = new mongoose.Schema({
    chatName: { type: String, trim: true },
    isGroupChat: { type: Boolean, default: false },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    latestMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    groupAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'

    },
    lastSeen: {
        type: Date,
        default: () => moment().toDate() // Set default to current date and time
    }
}, {
    timestamps: true
})


const Chat = mongoose.model("Chat", chatModel)

module.exports = Chat