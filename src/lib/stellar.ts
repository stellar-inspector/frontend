import { Server } from '@stellar/stellar-sdk';

export function getServer(network: 'testnet' | 'mainnet' = 'testnet'): Server {
  const horizonUrl = network === 'mainnet'
    ? 'https://horizon.stellar.org'
    : 'https://horizon.stellar.org';

  return new Server(horizonUrl);
}

export function isValidStellarAddress(address: string): boolean {
  if (!address || address.length < 56) return false;
  return address.startsWith('G') || address.startsWith('M') || address.startsWith('S');
}

export function formatAmount(amount: string, decimals = 7): string {
  const num = parseFloat(amount);
  if (isNaN(num)) return '0';
  return num.toFixed(decimals);
}

export function stroopsToXlm(stroops: string): string {
  const s = parseFloat(stroops);
  if (isNaN(s)) return '0';
  return (s / 10_000_000).toFixed(7);
}
