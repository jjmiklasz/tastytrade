<script lang="ts">
	import WatchlistEntry from './WatchlistEntry.svelte';
	let { watchlistEntries, removeSymbolFromWatchlist, name } = $props();
</script>

<table>
	<caption>{name}</caption>
	<thead>
		<tr>
			<th>Symbol</th>
			<th>Instrument Type</th>
			<th>Bid</th>
			<th>Ask</th>
			<th>Last</th>
			<th></th>
		</tr>
	</thead>
	<tbody>
		{#each watchlistEntries as entry}
			<tr>
				<WatchlistEntry {entry} {removeSymbolFromWatchlist}></WatchlistEntry>
			</tr>
		{/each}
	</tbody>
</table>

<style>
	table {
		width: 100%;
		border-collapse: collapse;
		margin: 0 auto;
		background-color: #1e1e1e;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
		border-radius: 8px;
		overflow: hidden;
		color: #cecece;
	}

	caption {
		font-size: 1.4rem;
		font-weight: bold;
		color: #cecece;
		padding: 0.75rem;
		text-align: center;
		background-color: #2a2a2a;
	}

	thead {
		background-color: #bb3636;
		color: #cecece;
	}

	th {
		padding: 0.75rem 1rem;
		text-align: left;
		border-bottom: 1px solid #444; /* darker border */
		font-weight: 600;
	}
</style>
