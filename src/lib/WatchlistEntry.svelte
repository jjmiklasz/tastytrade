<script lang="ts">
	import { fail } from '@sveltejs/kit';
	import { Trash2 } from 'lucide-svelte';
	import { onMount } from 'svelte';
	interface MarketData {
		symbol: string;
		instrumentType: string;
		bid: number;
		ask: number;
		last: number;
	}

	let { entry, removeSymbolFromWatchlist } = $props();

	let entryData: MarketData | undefined = $state();

	async function fetchMarketData() {
		const response = await fetch(`/api/marketData?q=${encodeURIComponent(entry.symbol)}`);
		if (!response.ok) {
			return fail(422, 'Error fetching market data');
		}
		const result = await response.json();
		entryData = result[0];
	}

	let intervalId: number;

	function startPolling() {
		clearInterval(intervalId);
		fetchMarketData();
		intervalId = setInterval(fetchMarketData, 5000);
	}

	function deleteEntry() {
		clearInterval(intervalId);
		removeSymbolFromWatchlist(entry.symbol);
	}

	onMount(() => {
		startPolling();

		return () => {
			entryData = undefined;
			clearInterval(intervalId);
		};
	});

	$effect(() => {
		if (entry?.symbol) {
			startPolling();
		}
	});
</script>

{#if entryData}
	<td>{entryData.symbol ? entryData.symbol : '--'}</td>
	<td>{entryData.instrumentType ? entryData.instrumentType : '--'}</td>
	<td>{entryData.bid ? entryData.bid.toFixed(2) : '--'}</td>
	<td>{entryData.ask ? entryData.ask.toFixed(2) : '--'}</td>
	<td>{entryData.last ? entryData.last.toFixed(2) : '--'}</td>
	<td>
		<button onclick={deleteEntry}>
			<Trash2 size="16" color="#f5f5f5" />
		</button>
	</td>
{:else}
	<td>No Data</td>
{/if}

<style>
	td {
		padding: 20px;
	}

	button {
		background: none;
		border: none;
		padding: 0;
		margin: 0;
		cursor: pointer;
		color: inherit;
		font: inherit;
		background-color: #1e1e1e;
	}

	button:hover {
		background-color: #353535;
	}
</style>
