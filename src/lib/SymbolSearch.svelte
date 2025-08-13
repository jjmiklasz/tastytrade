<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	interface SymbolData {
		symbol: string;
		description: string;
	}

	let searchText = '';
	let suggestions: SymbolData[] | null = null;
	let loading = false;
	let error = '';
	let active = false;
	let debounceTimeout: ReturnType<typeof setTimeout>;
	let highlightedIndex = -1;

	async function fetchSuggestion() {
		if (!searchText.trim()) {
			suggestions = null;
			error = '';
			loading = false;
			return;
		}
		loading = true;
		error = '';
		try {
			const response = await fetch(`/api/search?q=${encodeURIComponent(searchText)}`);
			if (!response.ok) {
				suggestions = null;
				error = `Error: ${response.status}`;
			}
			const data = await response.json();

			if (data.data.items.length > 0) {
				suggestions = data.data.items.map((item) => ({
					symbol: item.symbol,
					description: item.description
				}));
			} else {
				suggestions = null;
			}
		} catch (error) {
			suggestions = null;
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

	function selectSymbol(symbol: string) {
		dispatch('symbolSelected', { symbol });
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && suggestions) {
			selectSymbol(suggestions[highlightedIndex].symbol);
			searchText = '';
			active = false;
			e.preventDefault();
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
		selectSymbol(symbol);
		searchText = '';
		active = false;
	}
</script>

<input
	type="text"
	bind:value={searchText}
	on:input={handleInput}
	on:keydown={handleKeydown}
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
			<li
				class="suggestion-item"
				class:highlighted={highlightedIndex === i}
				on:click={() => handleClick(symbol)}
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
