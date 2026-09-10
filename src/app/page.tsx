'use client';

import { useState } from 'react';

export default function Home() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(`/api/account/${address}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Account Inspector</h2>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="GABC...XYZ"
            className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Inspect'}
          </button>
        </div>
      </form>

      {error && (
        <div className="rounded-lg border border-red-800 bg-red-900/20 p-4 text-red-400">
          {error}
        </div>
      )}

      {result && (
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Account Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Address</p>
              <p className="text-white font-mono">{result.address}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">XLM Balance</p>
              <p className="text-white">{result.xlm_balance} XLM</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Minimum Reserve</p>
              <p className="text-white">{result.minimum_reserve} XLM</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Available</p>
              <p className="text-green-400">{result.available} XLM</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Sequence</p>
              <p className="text-white font-mono">{result.sequence}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Transactions</p>
              <p className="text-white">{result.transactions}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
