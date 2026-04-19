const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const http = require('http');
const { Server } = require('socket.io');
const { initCronJobs } = require('./utils/cronJobs');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: true, credentials: true }
});

// Make io accessible in our routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

io.on('connection', (socket) => {
  console.log('🔌 Socket connected:', socket.id);
  
  // Clients emit 'joinRoom' with their user ID upon login
  socket.on('joinRoom', (userId) => {
    socket.join(userId);
    console.log(`👤 User ${userId} joined personal socket room.`);
  });

  socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected:', socket.id);
  });
});

// Initialize Cron Jobs
initCronJobs();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Hardened CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001', 'http://127.0.0.1:3001'];

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Routes ───────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/universities', require('./routes/universities'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/counsellors', require('./routes/counsellors'));
app.use('/api/finance', require('./routes/finance'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/university-portal', require('./routes/universityPortal'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/scholarships', require('./routes/scholarships'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 UAFMS Backend running on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
});
