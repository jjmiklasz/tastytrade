import type { Action, Actions, PageServerLoad } from "./$types";
import { fail, redirect } from "@sveltejs/kit";


export const load: PageServerLoad = async ({ cookies }) => {

    const sessionToken = cookies.get('session-token')

    const response = await fetch('https://api.cert.tastyworks.com/watchlists',
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `${sessionToken}`,
            },
        })


    const result = await response.json()

    if (!response.ok) {
        return fail(response.status, response.statusText)
    }

    return { data: result.data }
}

const logout: Action = async ({ cookies }) => {

    const sessionToken = cookies.get('session-token')
    const response = await fetch('https://api.cert.tastyworks.com/sessions/',
        {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `${sessionToken}`,
            },
        })

    if (response.status === 204) {

        cookies.delete('session-token', { path: '/' })
        throw redirect(303, '/login');
    } else {
        fail(422, 'There was an issue logging out')
    }
}

const createWatchlist: Action = async ({ request, cookies }) => {

    const formData = await request.formData()
    const watchlistName = formData.get('createNewWatchlist')

    const sessionToken = cookies.get('session-token')
    const response = await fetch('https://api.cert.tastyworks.com/watchlists/',
        {
            method: 'POST',
            body: JSON.stringify({
                "name": watchlistName,
                "group-name": "string",
                "order-index": 9999,
                "watchlist-entries": []
            }),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `${sessionToken}`,
            },
        })

    if (!response.ok) {
        fail(422, 'There was an issue creating a watch list')
    }

    const result = await response.json()

    return { data: result.data }
}

const deleteWatchlist: Action = async ({ request, cookies }) => {
    const formData = await request.formData()
    const watchlistName = formData.get('deleteWatchlist')

    const sessionToken = cookies.get('session-token')
    const response = await fetch(`https://api.cert.tastyworks.com/watchlists/${watchlistName}`,
        {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `${sessionToken}`,
            },
        })

    if (!response.ok) {
        fail(422, 'There was an issue deleting a watch list')
    }

    return { success: true }
}




export const actions: Actions = { logout, createWatchlist, deleteWatchlist }