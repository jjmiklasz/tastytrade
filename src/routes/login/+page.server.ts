import { fail, type Action, type Actions } from "@sveltejs/kit";

const login: Action = async ({ request, cookies }) => {

  const formData = await request.formData()

  const email = formData.get('email')
  const password = formData.get('password')
  const rememberMe = formData.get('rememberMe')

  if (!email || !password) {
    return fail(422, { message: 'Please enter your email and password' })
  }

  try {
    const response = await fetch('https://api.cert.tastyworks.com/sessions/',
      {
        method: 'POST',
        body: JSON.stringify({
          "login": `${email}`,
          "password": `${password}`,
          "remember-me": rememberMe
        }),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      })

    if (!response.ok) {
      return fail(response.status, response.statusText)
    }

    const result = await response.json()

    cookies.set('session-token', result.data["session-token"], {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 60 * 60 * 24
    })

    return { success: true }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw new Error(error.message);
  }

}


export const actions: Actions = { login }