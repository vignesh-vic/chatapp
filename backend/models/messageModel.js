const mongoose = require('mongoose')
const messageModel = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, trim: true },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
    isDeleted: { type: Boolean, default: false }, 
    notifi: { type: Array }
}, {
    timestamps: true
})

const Message = mongoose.model("Message", messageModel)
module.exports = Message