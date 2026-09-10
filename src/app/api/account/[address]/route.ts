import { type NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  const address = params.address;
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  try {
    const response = await fetch(`${backendUrl}/api/account/${address}`, {
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
