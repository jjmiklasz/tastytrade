<script lang="ts">
	interface SymbolData {
		symbol: string;
		description: string;
	}

	let searchText = $state('');
	let suggestions: SymbolData[] = $state([]);
	let loading = $state(false);
	let error = $state('');
	let active = $state(false);
	let highlightedIndex = $state(-1);
	let { addSymbolToWatchlist } = $props();
	let debounceTimeout: ReturnType<typeof setTimeout>;

	async function fetchSuggestion() {
		if (!searchText.trim()) {
			suggestions = [];
			error = '';
			loading = false;
			return;
		}
		loading = true;
		error = '';
		try {
			const response = await fetch(`/api/search?q=${encodeURIComponent(searchText)}`);
			if (!response.ok) {
				suggestions = [];
				error = `Error: ${response.status}`;
			}
			const data = await response.json();

			if (data.data.items.length > 0) {
				suggestions = data.data.items.map((item: SymbolData) => ({
					symbol: item.symbol,
					description: item.description
				}));
			} else {
				suggestions = [];
			}
		} catch (error) {
			suggestions = [];
			error = 'Fetch error';
		} finally {
			loading = false;
		}
	}

	function handleInput() {
		clearTimeout(debounceTimeout);
		debounceTimeout = setTimeout(fetchSuggestion, 300);
		active = true;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && suggestions) {
			e.preventDefault();
			addSymbolToWatchlist(suggestions[highlightedIndex].symbol);
			searchText = '';
			active = false;
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			highlightedIndex = (highlightedIndex + 1) % suggestions.length;
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			highlightedIndex = (highlightedIndex - 1 + suggestions.length) % suggestions.length;
		} else if (e.key === 'Escape') {
			active = false;
		}
	}

	function handleClick(symbol: string) {
		addSymbolToWatchlist(symbol);
		searchText = '';
		active = false;
	}
</script>

<input
	type="text"
	bind:value={searchText}
	oninput={handleInput}
	onkeydown={handleKeydown}
	placeholder="Search a symbol..."
	autocomplete="off"
	class="searchbox"
/>

{#if loading}
	<div>Loading...</div>
{/if}

{#if error}
	<div style="color: red;">{error}</div>
{/if}

{#if active && suggestions}
	<ul class="suggestions">
		{#each suggestions as { symbol, description }, i}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<li
				class="suggestion-item"
				class:highlighted={highlightedIndex === i}
				onclick={() => handleClick(symbol)}
			>
				<span class="symbol">{symbol}</span>
				<span class="description">{description}</span>
			</li>
		{/each}
	</ul>
{/if}

<style>
	.searchbox {
		width: 200px;
		padding: 0.5rem 0.75rem;
		background: #1e1e1e;
		color: #d4d4d4;
		border: none;
		border-radius: 0;
		outline: none;
		font-size: 1rem;
	}

	.suggestions {
		list-style: none;
		margin: 0;
		padding: 0.5rem 0.75rem;
		background: #1e1e1e;
		border: 1px solid #333;
		max-height: 300px;
		max-width: 200px;
		overflow-y: auto;
		scrollbar-width: none;
	}

	.suggestion-item {
		display: flex;
		gap: 0.5rem;
		padding: 0.5rem;
		cursor: pointer;
		align-items: center;
		font-size: small;
	}

	.suggestion-item:hover {
		background: #2a2a2a;
	}

	.symbol {
		font-weight: bold;
		color: #d4d4d4;
		flex-shrink: 0;
	}

	.description {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		color: #aaaaaa;
		flex-grow: 1;
	}

	li:hover,
	li.highlighted {
		background: #333;
	}
</style>
