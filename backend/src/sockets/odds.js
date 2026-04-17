const MIN_ODDS = 1.01;
const MAX_ODDS = 10.0;

function nextOdds(current) {
  const delta = (Math.random() - 0.5) * 0.6;
  const raw = current + delta;
  const clamped = Math.min(MAX_ODDS, Math.max(MIN_ODDS, raw));
  return Math.round(clamped * 100) / 100;
}

function startOddsEmitter(io, { intervalMs = 3000 } = {}) {
  let currentOdds = 2.0;

  io.on('connection', (socket) => {
    // Give new clients an immediate value so they don't wait up to 3s for the
    // first tick; direction flash kicks in on the next update.
    socket.emit('odds:update', { value: currentOdds, at: Date.now() });
  });

  const timer = setInterval(() => {
    currentOdds = nextOdds(currentOdds);
    io.emit('odds:update', { value: currentOdds, at: Date.now() });
  }, intervalMs);

  return function stop() {
    clearInterval(timer);
  };
}

module.exports = { startOddsEmitter, nextOdds };
