import OddsDisplay from '../components/OddsDisplay';

export default function Home() {
  return (
    <main className="page">
      <header className="page__header">
        <h1>Live Odds</h1>
        <p>Streaming from the backend every 3 seconds.</p>
      </header>
      <OddsDisplay />
    </main>
  );
}
