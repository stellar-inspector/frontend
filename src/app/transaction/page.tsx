'use client';

import { useState } from 'react';

export default function TransactionPage() {
  const [hash, setHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(`/api/transaction/${hash}`);
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
      <h2 className="text-2xl font-bold text-white mb-6">Transaction Inspector</h2>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={hash}
            onChange={(e) => setHash(e.target.value)}
            placeholder="Transaction hash"
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
          <h3 className="text-lg font-semibold text-white mb-4">Transaction Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Hash</p>
              <p className="text-white font-mono text-sm">{result.hash}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Ledger</p>
              <p className="text-white">{result.ledger}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Created At</p>
              <p className="text-white">{result.created_at}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Source Account</p>
              <p className="text-white font-mono text-sm">{result.source_account}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Fee Charged</p>
              <p className="text-white">{result.fee_charged} stroops</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Operations</p>
              <p className="text-white">{result.operation_count}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
