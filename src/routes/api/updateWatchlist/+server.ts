import { fail } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
    const data = await request.json();

    const sessionToken = cookies.get('session-token')
    const watchlistName = data.name
    const response = await fetch(`https://api.cert.tastyworks.com/watchlists/${watchlistName}`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `${sessionToken}`,
            },
            body: JSON.stringify(data),
        })

    if (!response.ok) {
        fail(422, 'There was an issue updating a watch list')
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
};

export const GET: RequestHandler = async () => {
    return new Response();
};