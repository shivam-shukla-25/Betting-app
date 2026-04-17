import './globals.css';

export const metadata = {
  title: 'Live Odds',
  description: 'Real-time odds feed powered by Socket.io',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
