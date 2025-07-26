const express = require('express');
const router = express.Router();
const ChatSession = require('../models/ChatSession');
const ChatMessage = require('../models/ChatMessage');
const { generateResponse } = require('../services/chatbotService');
const { authenticateToken } = require('../middleware/auth');

// Get all chat sessions for the current user
router.get('/sessions', authenticateToken, async (req, res) => {
  try {
    const sessions = await ChatSession.find({ 
      userId: req.user._id 
    })
    .sort({ updatedAt: -1 })
    .select('-messages');
    
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    res.status(500).json({ message: 'Failed to fetch chat sessions' });
  }
});

// Create a new chat session
router.post('/sessions', authenticateToken, async (req, res) => {
  try {
    const { title = 'New Conversation' } = req.body;
    
    const session = new ChatSession({
      userId: req.user._id,
      title
    });
    
    await session.save();
    
    res.status(201).json(session);
  } catch (error) {
    console.error('Error creating chat session:', error);
    res.status(500).json({ message: 'Failed to create chat session' });
  }
});

// Get messages for a specific chat session
router.get('/sessions/:sessionId', authenticateToken, async (req, res) => {
  try {
    const session = await ChatSession.findOne({
      _id: req.params.sessionId,
      userId: req.user._id
    });
    
    if (!session) {
      return res.status(404).json({ message: 'Chat session not found' });
    }
    
    // Fetch all messages in this session
    const messages = await ChatMessage.find({
      _id: { $in: session.messages }
    }).sort({ createdAt: 1 });
    
    // Return just the messages array
    res.json(messages);
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ message: 'Failed to fetch chat messages' });
  }
});

// Send a message in a chat session
router.post('/sessions/:sessionId/messages', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Message content is required' });
    }
    
    // Find the session
    const session = await ChatSession.findOne({
      _id: req.params.sessionId,
      userId: req.user._id
    });
    
    if (!session) {
      return res.status(404).json({ message: 'Chat session not found' });
    }
    
    // Create user message
    const userMessage = new ChatMessage({
      userId: req.user._id,
      content,
      isBot: false
    });
    
    await userMessage.save();
    
    // Get previous messages for context (limit to last 10 messages)
    const previousMessages = await ChatMessage.find({
      _id: { $in: session.messages }
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .sort({ createdAt: 1 });
    
    // We'll simplify and just use the latest user message for now
    console.log('Previous messages count:', previousMessages.length);
    
    // Generate bot response using Gemini - just pass the user message
    let botResponseContent;
    try {
      // For simplicity, we're not using history for now
      botResponseContent = await generateResponse(
        content, 
        req.user?.name || 'student',
        [] // Empty history for now
      );
    } catch (geminiError) {
      console.error('Error from Gemini API:', geminiError);
      botResponseContent = 'Sorry, I encountered an error while processing your request. Please try again later.';
    }
    
    // Create bot message
    const botMessage = new ChatMessage({
      userId: req.user._id,
      content: botResponseContent,
      isBot: true
    });

    await botMessage.save();
    
    // Update session with both messages
    session.messages.push(userMessage._id);
    session.messages.push(botMessage._id);
    await session.save();
    
    // Make sure we're returning properly formatted objects
    res.json({ 
      userMessage: {
        _id: userMessage._id,
        content: userMessage.content,
        isBot: userMessage.isBot,
        createdAt: userMessage.createdAt
      },
      botResponse: {
        _id: botMessage._id,
        content: botMessage.content,
        isBot: botMessage.isBot,
        createdAt: botMessage.createdAt
      },
      sessionUpdated: {
        _id: session._id,
        title: session.title
      }
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

// Delete a chat session
router.delete('/sessions/:sessionId', authenticateToken, async (req, res) => {
  try {
    const session = await ChatSession.findOne({
      _id: req.params.sessionId,
      userId: req.user._id
    });
    
    if (!session) {
      return res.status(404).json({ message: 'Chat session not found' });
    }
    
    // Delete all messages in the session
    await ChatMessage.deleteMany({ _id: { $in: session.messages } });
    
    // Delete the session
    await ChatSession.deleteOne({ _id: session._id });
    
    res.json({ message: 'Chat session deleted successfully' });
  } catch (error) {
    console.error('Error deleting chat session:', error);
    res.status(500).json({ message: 'Failed to delete chat session' });
  }
});

// Get bot response without saving (for quick questions)
router.post('/quick-response', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Message content is required' });
    }
    
    // Generate bot response
    const response = await generateResponse(content, req.user.name);
    
    res.json({ response });
  } catch (error) {
    console.error('Error getting quick response:', error);
    res.status(500).json({ message: 'Failed to get response' });
  }
});

module.exports = router;
