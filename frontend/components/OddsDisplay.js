'use client';

import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';
const FLASH_DURATION_MS = 900;

export default function OddsDisplay() {
  const [odds, setOdds] = useState(null);
  const [direction, setDirection] = useState(null); // 'up' | 'down' | null
  const [delta, setDelta] = useState(0);
  const [connected, setConnected] = useState(false);

  // refs survive re-renders and are read inside socket callbacks without
  // making them depend on state (which would force listener re-binding)
  const previousOddsRef = useRef(null);
  const flashTimerRef = useRef(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
    });

    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);

    const handleUpdate = ({ value }) => {
      const previous = previousOddsRef.current;
      previousOddsRef.current = value;

      setOdds(value);

      if (previous !== null && value !== previous) {
        const nextDirection = value > previous ? 'up' : 'down';
        setDirection(nextDirection);
        setDelta(value - previous);

        if (flashTimerRef.current) {
          clearTimeout(flashTimerRef.current);
        }
        flashTimerRef.current = setTimeout(() => {
          setDirection(null);
        }, FLASH_DURATION_MS);
      }
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('odds:update', handleUpdate);

    return () => {
      if (flashTimerRef.current) {
        clearTimeout(flashTimerRef.current);
        flashTimerRef.current = null;
      }
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('odds:update', handleUpdate);
      socket.disconnect();
    };
  }, []);

  const modifier = direction ? `odds-card--${direction}` : '';
  const formattedOdds = odds === null ? '—' : odds.toFixed(2);
  const formattedDelta =
    direction && delta !== 0
      ? `${delta > 0 ? '▲' : '▼'} ${Math.abs(delta).toFixed(2)}`
      : '';

  return (
    <section className={`odds-card ${modifier}`.trim()} aria-live="polite">
      <span className="odds-card__label">Current Odds</span>
      <span className="odds-card__value">{formattedOdds}</span>
      <span className="odds-card__delta">{formattedDelta}</span>
      <span
        className={`odds-card__status ${
          connected ? 'odds-card__status--connected' : ''
        }`.trim()}
      >
        {connected ? 'Live' : 'Connecting…'}
      </span>
    </section>
  );
}
