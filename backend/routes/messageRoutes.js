const express = require('express')
const { protect } = require('../middleware/authMiddleware')
const { sendMessage, allMessage, markNotificationsAsSeen, deleteMessage } = require('../controllers/messageController')
const router = express.Router()
router.route('/').post(protect, sendMessage)
router.route('/:chatId').get(protect, allMessage)

router.route('/:messageId').put( protect, deleteMessage);



//notification

// Route to mark notifications as seen
router.route('/markAsSeen').post(protect, markNotificationsAsSeen);
module.exports = router