<script>
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';

	let error = $state('');
	let loading = $state(false);
</script>

<form
	action="?/login"
	method="POST"
	use:enhance={() => {
		loading = true;
		return async ({ result }) => {
			loading = false;
			if (result.type === 'success') {
				goto('/');
			} else if (result.status === 401) {
				error = 'You are not authorized to view this site';
			} else if (result.type === 'error') {
				error = result.error.message;
			}
		};
	}}
>
	<h1>Please enter your email and password to login</h1>
	<input type="email" name="email" placeholder="email" required />
	<input type="password" name="password" placeholder="password" required />
	<label class="remember-me" for="rememberMe">
		<input type="checkbox" name="rememberMe" id="rememberMe" />
		Remember Me?
	</label>
	<button type="submit">Sign in</button>
	{#if loading}
		<h3>loading...</h3>
	{/if}
	{#if error}
		<h3>{error}</h3>
	{/if}
</form>

<style>
	form {
		max-width: 400px;
		margin: 25vh auto 5vh auto;
		padding: 2rem;
		background: #121212;
		border-radius: 8px;
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.8);
		font-family: Arial, sans-serif;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		color: #eee;
	}

	h1 {
		margin-bottom: 1rem;
		font-weight: 600;
		text-align: center;
		color: #eee;
	}

	input[type='email'],
	input[type='password'] {
		font-size: 1rem;
		padding: 0.5rem;
		border: 1px solid #444;
		border-radius: 4px;
		width: 100%;
		box-sizing: border-box;
		background: #222;
		color: #eee;
		transition: border-color 0.2s ease;
	}

	input[type='email']:focus,
	input[type='password']:focus {
		outline: none;
		border-color: #d96c6c;
		box-shadow: 0 0 5px #d96c6c;
	}

	.remember-me {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9rem;
		color: #ccc;
		cursor: pointer;
		user-select: none;
	}

	input[type='checkbox'] {
		margin: 0;
		width: 16px;
		height: 16px;
		accent-color: #d96c6c;
		cursor: pointer;
	}

	button[type='submit'] {
		background-color: #d96c6c;
		color: white;
		font-weight: 600;
		padding: 0.75rem;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		transition: background-color 0.2s ease;
		font-size: 1.1rem;
		box-shadow: 0 4px 8px rgba(217, 108, 108, 0.6);
	}

	button[type='submit']:hover {
		background-color: #b85858;
	}

	h3 {
		text-align: center;
		color: #b85858;
		margin-top: 0;
	}
</style>
