import { type NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { tx_hash: string } }
) {
  const txHash = params.tx_hash;
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  try {
    const response = await fetch(`${backendUrl}/api/transaction/${txHash}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return Response.json(data, { status: response.status });
  } catch (error) {
    return Response.json(
      { error: 'Failed to connect to backend' },
      { status: 500 }
    );
  }
}
