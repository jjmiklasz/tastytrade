<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import SymbolSearch from '$lib/SymbolSearch.svelte';
	import Watchlist from '$lib/Watchlist.svelte';
	import { ArrowLeft, ArrowRight, Trash2 } from 'lucide-svelte';

	interface WatchlistEntry {
		symbol: string;
		instrumentType: string;
	}

	interface Watchlist {
		name: string;
		'group-name': string;
		'order-index': number;
		'watchlist-entries': WatchlistEntry[];
	}

	let { data } = $props();

	let watchLists: Watchlist[] = $state(data.data.items);
	// svelte-ignore state_referenced_locally
	let currentWatchlistIndex = $state(watchLists ? 0 : -1);

	function updateWatchlist(updatedWatchlist: Watchlist) {
		fetch('/api/updateWatchlist', {
			method: 'POST',
			body: JSON.stringify({
				name: updatedWatchlist.name,
				'group-name': updatedWatchlist['group-name'],
				'order-index': updatedWatchlist['order-index'],
				'watchlist-entries': updatedWatchlist['watchlist-entries']
			}),
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json'
			}
		});
	}

	function addSymbolToWatchlist(event: any) {
		const symbol = event.detail.symbol;

		watchLists = watchLists.map((watchlist: Watchlist, index: number) => {
			if (index === currentWatchlistIndex) {
				return {
					...watchlist,
					'watchlist-entries': watchlist['watchlist-entries']
						? [...watchlist['watchlist-entries'], { symbol, instrumentType: '' }]
						: [{ symbol, instrumentType: '' }]
				};
			}
			return watchlist;
		});

		updateWatchlist(watchLists[currentWatchlistIndex]);
	}

	function removeSymbolFromWatchlist(symbol: string) {
		watchLists = watchLists.map((watchlist: Watchlist, index: number) => {
			if (index === currentWatchlistIndex) {
				return {
					...watchlist,
					'watchlist-entries': watchlist['watchlist-entries']
						? watchlist['watchlist-entries'].filter((entry) => {
								return entry.symbol !== symbol;
							})
						: []
				};
			}
			return watchlist;
		});

		updateWatchlist(watchLists[currentWatchlistIndex]);
	}

	function handleDeleteSuccess() {
		watchLists.splice(currentWatchlistIndex, 1);

		if (watchLists.length === 0) {
			currentWatchlistIndex = -1;
		} else {
			currentWatchlistIndex = currentWatchlistIndex % watchLists.length;
		}
	}

	function handleAddSuccess(data: string) {
		const newWatchlist: Watchlist = {
			name: data,
			'group-name': '',
			'order-index': 9999,
			'watchlist-entries': []
		};
		watchLists.push(newWatchlist);
		currentWatchlistIndex = watchLists.length - 1;
	}
</script>

<nav class="nav">
	<form method="POST" action="?/logout">
		<button type="submit">Logout</button>
	</form>
</nav>

<div class="watchlist-container">
	<div class="watchlist-header">
		<form
			method="POST"
			action="?/createWatchlist"
			class="create-watchlist-inline"
			use:enhance={(data) => {
				const formData = data.formData.get('createNewWatchlist');
				if (formData) {
					handleAddSuccess(formData.toString());
				}
			}}
		>
			<input type="text" name="createNewWatchlist" placeholder="Create a new watchlist" />
			<button type="submit">Create</button>
		</form>

		{#if currentWatchlistIndex !== -1 && watchLists.length > 0}
			<div class="watchlist-btn-group">
				<button
					class="arrow-btn"
					onclick={() => {
						currentWatchlistIndex = (currentWatchlistIndex + 1) % watchLists.length;
					}}
				>
					<ArrowLeft /></button
				>
				<button
					class="arrow-btn"
					onclick={() => {
						currentWatchlistIndex =
							(currentWatchlistIndex - 1 + watchLists.length) % watchLists.length;
					}}><ArrowRight /></button
				>
				<form
					class="delete-btn"
					method="POST"
					action="?/deleteWatchlist"
					use:enhance={() => {
						return async ({ result }) => {
							if (result.type === 'success') {
								handleDeleteSuccess();
							}
						};
					}}
				>
					<input
						type="hidden"
						name="deleteWatchlist"
						value={watchLists[currentWatchlistIndex].name}
					/>
					<button class="delete-btn" title="Delete watchlist">
						Delete this watchlist
						<Trash2 size="18" />
					</button>
				</form>
			</div>
		{/if}
	</div>
	{#if currentWatchlistIndex !== -1 && watchLists.length > 0}
		<div class="market-data">
			<div class="symbol-search-header">
				<SymbolSearch on:symbolSelected={addSymbolToWatchlist} />
			</div>
			<div class="watchlist-wrapper">
				<Watchlist
					watchlistEntries={watchLists[currentWatchlistIndex]['watchlist-entries']}
					{removeSymbolFromWatchlist}
					name={watchLists[currentWatchlistIndex].name}
				/>
			</div>
		</div>
	{/if}
</div>

<style>
	.nav {
		height: 4vh;
		background-color: #bb3636;
		display: flex;
		flex-direction: row-reverse;
		align-items: center;
		padding: 0 1rem;
	}

	.nav button {
		background-color: #bb3636;
		color: #cecece;
		padding: 0.4rem 0.8rem;
		border: 1px solid #cecece;
		border-radius: 4px;
		cursor: pointer;
	}

	.nav button:hover {
		background-color: #b86868;
	}

	.create-watchlist-inline {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 0.5rem;
	}

	.create-watchlist-inline input[type='text'] {
		background: transparent;
		border: 1px solid #bb3636;
		color: #f5f5f5;
		padding: 0.3rem 0.5rem;
		border-radius: 4px;
		font-size: 1rem;
		flex: 1;
	}

	.create-watchlist-inline input[type='text']:focus {
		outline: none;
		border-color: #b86868;
		box-shadow: 0 0 3px 1px rgba(184, 104, 104, 0.6);
	}

	.create-watchlist-inline button[type='submit'] {
		background-color: #bb3636;
		color: #f5f5f5;
		border: none;
		padding: 0.4rem 1rem;
		border-radius: 4px;
		font-weight: 600;
		cursor: pointer;
		transition: background-color 0.3s ease;
	}

	.create-watchlist-inline button[type='submit']:hover {
		background-color: #b86868;
	}

	.create-watchlist-inline button[type='submit']:focus {
		outline: 2px solid #b86868;
		outline-offset: 2px;
	}

	.watchlist-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-top: 2rem;
		width: 100%;
		height: 80vh;
	}

	.watchlist-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		background-color: #2a2a2a;
		color: #cecece;
		width: 90%;
		padding: 0.6rem;
		font-weight: bold;
		font-size: 1.2rem;
		border-radius: 6px 6px 0 0;
	}

	.watchlist-btn-group {
		display: flex;
		flex-direction: row;
	}

	.symbol-search-header {
		text-align: center;
		font-size: 1.2rem;
		margin: 0.5rem 0 0.5rem 0.5rem;
		font-weight: bold;
		color: #bb3636;
	}

	.watchlist-wrapper {
		display: flex;
		justify-content: center;
		margin: 0.5rem 0 0.5rem 0;
		padding: 0;
		width: 80%;
		height: fit-content;
	}

	.market-data {
		display: flex;
		flex-direction: row-reverse;
		width: 90%;
		height: 100%;
		margin-top: 2rem;
	}

	.delete-btn,
	.arrow-btn {
		cursor: pointer;
		border: 0;
		color: #cecece;
		background-color: #2a2a2a;
		gap: 0.3rem;
		display: flex;
		align-items: center;
		margin: 0 1.5rem;
	}

	.arrow-btn:hover,
	.delete-btn:hover {
		background-color: #353535;
	}
</style>
