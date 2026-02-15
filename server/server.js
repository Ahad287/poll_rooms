// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// 1. Setup Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins (for development)
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// 2. Database Connection (MongoDB)
// Replace with your OWN connection string or use local
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/poll-app';

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

// 3. Schemas (Data Models)
const PollSchema = new mongoose.Schema({
  question: String,
  options: [{
    text: String,
    votes: { type: Number, default: 0 }
  }]
});

const VoteSchema = new mongoose.Schema({
  pollId: String,
  ip: String,
  optionIndex: Number,
  createdAt: { type: Date, default: Date.now }
});

const Poll = mongoose.model('Poll', PollSchema);
const Vote = mongoose.model('Vote', VoteSchema);

// 4. Socket.io Logic
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Join a specific poll "room"
  socket.on('join_poll', (pollId) => {
    socket.join(pollId);
    console.log(`Socket ${socket.id} joined poll ${pollId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// 5. API Routes

// GET: Fetch a Poll
app.get('/api/polls/:id', async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ error: 'Poll not found' });
    res.json(poll);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: Create a Poll
app.post('/api/polls', async (req, res) => {
  try {
    const { question, options } = req.body;
    // Format options for DB
    const formattedOptions = options.map(opt => ({ text: opt, votes: 0 }));
    
    const newPoll = new Poll({ question, options: formattedOptions });
    await newPoll.save();
    
    res.status(201).json(newPoll);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: Vote on a Poll (The Core Real-time Logic)
app.post('/api/polls/:id/vote', async (req, res) => {
  const { id } = req.params;
  const { optionIndex } = req.body;
  const ip = req.ip || req.connection.remoteAddress; // Simple IP capture

  try {
    const poll = await Poll.findById(id);
    if (!poll) return res.status(404).json({ error: 'Poll not found' });

    // FAIRNESS CHECK 2: Check Database for existing IP
    // (We allow multiple votes from localhost for testing, remove this 'if' in production)
    const existingVote = await Vote.findOne({ pollId: id, ip: ip });
    if (existingVote && ip !== '::1' && ip !== '127.0.0.1') { 
       return res.status(403).json({ error: 'You have already voted.' });
    }

    // Record Vote
    poll.options[optionIndex].votes += 1;
    await poll.save();

    // Log the vote (for fairness check)
    await Vote.create({ pollId: id, ip, optionIndex });

    // 🔥 REAL-TIME UPDATE: Notify everyone in this poll's room
    io.to(id).emit('poll_updated', poll);

    res.json({ message: 'Vote recorded', poll });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});