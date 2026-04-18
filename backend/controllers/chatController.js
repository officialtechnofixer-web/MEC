// File: backend/controllers/chatController.js
const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Get conversation history with a specific user
// @route   GET /api/chat/:userId
const getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, recipient: userId },
        { sender: userId, recipient: currentUserId },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send a new message
// @route   POST /api/chat/:userId
const sendMessage = async (req, res) => {
  try {
    const { userId } = req.params;
    const { content } = req.body;
    const currentUserId = req.user._id;

    if (!content) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const message = await Message.create({
      sender: currentUserId,
      recipient: userId,
      content,
    });

    // Populate sender info before emitting via socket
    const populatedMessage = await Message.findById(message._id).populate('sender', 'firstName lastName');

    // Emit via Socket.io to the recipient's room
    if (req.io) {
      req.io.to(userId.toString()).emit('receiveMessage', populatedMessage);
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getConversation, sendMessage };
