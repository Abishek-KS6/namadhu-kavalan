const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const http     = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const authRoutes    = require('./routes/authRoutes');
const caseRoutes    = require('./routes/caseRoutes');
const personRoutes  = require('./routes/personRoutes');
const searchRoutes  = require('./routes/searchRoutes');
const uploadRoutes  = require('./routes/uploadRoutes');
const statsRoutes   = require('./routes/statsRoutes');

const app    = express();
const server = http.createServer(app);

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  process.env.FRONTEND_URL || 'http://localhost:3000',
];

const io = new Server(server, {
  cors: { origin: ALLOWED_ORIGINS, methods: ['GET', 'POST'], credentials: true }
});

app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth',    authRoutes);
app.use('/api/cases',   caseRoutes);
app.use('/api/persons', personRoutes);
app.use('/api/search',  searchRoutes);
app.use('/api/upload',  uploadRoutes);
app.use('/api/stats',   statsRoutes);

app.get('/', (req, res) => res.json({
  status: 'Namadhu Kavalan API running ✅',
  version: '1.0.0',
}));

io.on('connection', (socket) => {
  console.log(`[Socket] Connected: ${socket.id}`);
  socket.on('join_case', (caseId) => socket.join(`case_${caseId}`));
  socket.on('disconnect', () => console.log(`[Socket] Disconnected: ${socket.id}`));
});

app.set('io', io);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('[MongoDB] Connected ✅');
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`[Server] Running on http://localhost:${PORT} 🚀`));
  })
  .catch((err) => {
    console.error('[MongoDB] Failed ❌', err.message);
    process.exit(1);
  });
