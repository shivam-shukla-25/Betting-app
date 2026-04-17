require('dotenv').config();

const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');

const connectDb = require('./config/db');
const betRoutes = require('./routes/bet.routes');
const { startOddsEmitter } = require('./sockets/odds');

async function bootstrap() {
  await connectDb();

  const app = express();
  app.use(cors({ origin: process.env.FRONTEND_ORIGIN || '*' }));
  app.use(express.json());

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/', betRoutes);

  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

  const server = http.createServer(app);

  const io = new Server(server, {
    cors: { origin: process.env.FRONTEND_ORIGIN || '*' },
  });

  const stopEmitter = startOddsEmitter(io, {
    intervalMs: Number(process.env.ODDS_INTERVAL_MS) || 3000,
  });

  const port = Number(process.env.PORT) || 4000;
  server.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
  });

  const shutdown = (signal) => {
    console.log(`${signal} received, shutting down`);
    stopEmitter();
    io.close();
    server.close(() => process.exit(0));
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
