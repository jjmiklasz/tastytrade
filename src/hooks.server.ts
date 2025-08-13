import { redirect, type Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {

    if (!event.cookies.get("session-token") && !(event.url.pathname === '/login')) {
        throw redirect(303, '/login')
    }
    const response = await resolve(event)

    return response
}