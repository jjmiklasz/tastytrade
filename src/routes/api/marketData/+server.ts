import type { RequestHandler } from './$types';

interface MarketDataRaw {
    data: {
        symbol: string;
        'instrument-type': string;
        bid: string;
        ask: string;
        last: string;
    };
}

interface MarketData {
    symbol: string;
    instrumentType: string;
    bid: number;
    ask: number;
    last: number;
}

export const GET: RequestHandler = async ({ url, cookies, fetch }) => {
    const query = url.searchParams.get('q');
    if (!query) {
        return new Response(JSON.stringify([]), { status: 200 });
    }


    const token = cookies.get('session-token');
    if (!token) {
        return new Response(JSON.stringify({ error: 'No session token' }), { status: 401 });
    }

    const response = await fetch(`https://api.cert.tastyworks.com/market-data/${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: token
        }
    });

    if (!response.ok) {
        return new Response(JSON.stringify({ error: 'Upstream API failed' }), { status: response.status });
    }

    const rawData: MarketDataRaw = await response.json();

    const normalized: MarketData[] = [{
        symbol: rawData.data.symbol,
        instrumentType: rawData.data['instrument-type'],
        bid: parseFloat(rawData.data.bid),
        ask: parseFloat(rawData.data.ask),
        last: parseFloat(rawData.data.last),
    }];

    return new Response(JSON.stringify(normalized), { status: 200 });
};
