import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Stellar Inspector',
  description: 'Inspect and analyze Stellar transactions',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-white">Stellar Inspector</h1>
              </div>
              <div className="flex items-center space-x-4">
                <a href="/" className="text-gray-300 hover:text-white">Account</a>
                <a href="/transaction" className="text-gray-300 hover:text-white">Transaction</a>
              </div>
            </div>
          </div>
        </nav>
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </body>
    </html>
  );
}
