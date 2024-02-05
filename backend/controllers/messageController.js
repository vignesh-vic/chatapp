const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");


const sendMessage = asyncHandler(async (req, res) => {
    const { content, chatId, notifi } = req.body

    if (!content || !chatId) {
        console.log("Invalid data passed into request");
        return res.sendStatus(400);
    }
    var newMessage = {
        sender: req.user._id,
        content: content,
        chat: chatId,
        notifi: [notifi]
    };
    try {
        var message = await Message.create(newMessage);
        message = await message.populate("sender", "name picture");
        message = await message.populate("chat");
        message = await User.populate(message, {
            path: "chat.users",
            select: "name picture email",
        });
        await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });
        res.json(message);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
})



// const allMessage = asyncHandler(async (req, res) => {
//     try {
//         const messages = await Message.find({ chat: req.params.chatId })
//             .populate("sender", "name picture email")
//             .populate("chat")
//         res.json(messages)
//     } catch (error) {
//         res.status(400);
//         throw new Error(error.message);
//     }

// })

const allMessage = asyncHandler(async (req, res) => {
    const { skip, limit } = req.query;

    try {
        const messages = await Message.find({ chat: req.params.chatId })
            .populate("sender", "name picture email")
            .populate("chat")
            // .sort({ createdAt: -1 }) // Ensure newer messages come first
            // .skip(parseInt(skip) || 0)
            // .limit(parseInt(limit) || 20); // Default limit to 20 if not specified

        res.json(messages);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

const markNotificationsAsSeen = async (req, res) => {
    const { chatId } = req.body;
    const userId = req.user._id; // Assuming you have the user's ID from authentication middleware

    try {
        await User.updateOne(
            { _id: userId, "notifications.chatId": chatId },
            { $set: { "notifications.$.seen": true } }
        );
        res.json({ message: 'Notification marked as seen' });
    } catch (error) {
        console.error('Error marking notification as seen:', error);
        res.status(500).send('Error updating notification status');
    }
};



const deleteMessage = asyncHandler(async (req, res, next) => {
    const messageId = req.params.messageId;

    try {

        const message = await Message.findById(messageId);
        if (!message) {
            // Instead of returning a response here, call next with an error.
            return next(new Error('Message not found', 404));
        }

        message.isDeleted = true;
        await message.save();
        return res.status(200).json({ message: 'Message deleted' });

    } catch (error) {
        next(error);
    }
});


module.exports = { sendMessage, allMessage, markNotificationsAsSeen, deleteMessage }