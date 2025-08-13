import type { RequestHandler } from './$types';

interface SymbolData {
    symbol: string;
    description: string;
}

export const GET: RequestHandler = async ({ url, cookies, fetch }) => {
    const query = url.searchParams.get('q');

    if (!query) return new Response(JSON.stringify({}), { status: 200 });

    const token = cookies.get('session-token');

    if (!token) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    const res = await fetch(`https://api.cert.tastyworks.com/symbols/search/${encodeURIComponent(query)}`,
        {
            headers: { Authorization: token, Accept: 'application/json' }
        });

    if (!res.ok) return new Response(JSON.stringify({ error: 'API error' }), { status: res.status });

    const data: SymbolData = await res.json();

    return new Response(JSON.stringify(data ? data : {}), { status: 200 });
};