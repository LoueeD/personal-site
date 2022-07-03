<script lang="ts">
	import particles from '$lib/particles';
	import lines from '$lib/lines';
	import { DisplayMode } from '$lib/display-mode';
	import { mode } from '$lib/local';
	import {
		InfiniteCanvas,
		canvasNodes,
		wheelValue,
		canvasOffsetX,
		canvasOffsetY
	} from '$lib/infinite-canvas';
	import { onMount } from 'svelte';

	const modes = DisplayMode;
	const displayModeLists = DisplayMode.Modes;
	let openModes = false;

	const changeMode = (item: string) => {
		$mode = item;
		openModes = false;
	};

	let infiniteContainer: HTMLDivElement;
	let canvas: InfiniteCanvas;

	onMount(() => {
		canvas = new InfiniteCanvas(infiniteContainer);
	});

	$: onDrag = canvas?.drag;

	$: removeNode = canvas?.removeNode;
</script>

<svelte:head>
	<title>Loueed</title>
</svelte:head>
{#if modes.Particles === $mode}
	<canvas use:particles />
{/if}
{#if modes.Lines === $mode}
	<canvas use:lines />
{/if}
{#if modes.InfiniteCanvas === $mode && canvasNodes}
	<div
		class="infinite"
		bind:this={infiniteContainer}
		style:transform={`scale(${$wheelValue}) translate3d(${$canvasOffsetX}px, ${$canvasOffsetY}px, 0)`}
	>
		{#each $canvasNodes as node}
			{#if node.type === 'image'}
				<div
					class="node"
					on:mousedown={(e) => onDrag(e, node)}
					style="--x: {node.x}px; --y: {node.y}px;"
				>
					<img src={node.data} alt="Image Node" />
					<div class="remove" on:click={() => removeNode(node.id)}>&#x2715</div>
				</div>
			{/if}
			{#if node.type === 'text'}
				<div
					class="node node--text"
					on:mousedown={(e) => onDrag(e, node)}
					style="--x: {node.x}px; --y: {node.y}px;"
				>
					{@html node.data}
					<div class="remove" on:click={() => removeNode(node.id)}>&#x2715</div>
				</div>
			{/if}
		{/each}
	</div>
{/if}
<div class="home">
	<h1>Louis</h1>
	<h2>Personal site about web development, tech and design.</h2>
	<nav>
		<a href="https://twitter.com/imlwi">@imlwi</a>
		<a href="https://linkedin.com/in/louis-dickinson">LinkedIn</a>
	</nav>
	{#if $mode}
		<div class="mode" on:click={() => (openModes = !openModes)}>
			{$mode} <span class:open={openModes} />
		</div>
		{#if openModes}
			<ul class="modes-dropdown">
				{#each displayModeLists as item}
					<li on:click={() => changeMode(item)}>{item}</li>
				{/each}
			</ul>
		{/if}
	{/if}
</div>

<style lang="scss">
	canvas {
		position: fixed;
		top: 0;
		left: 0;
	}

	.infinite {
		position: fixed;
		inset: 0;

		.node {
			position: absolute;
			background: rgba(#fff, 0.05);
			border-radius: 8px;
			padding: 12px;
			transform: translate3d(var(--x), var(--y), 0);

			img {
				border-radius: 4px;
				display: block;
			}

			.remove {
				position: absolute;
				top: -12px;
				right: -12px;
				width: 24px;
				height: 24px;
				border-radius: 100%;
				background: lighten(#444, 2%);
				justify-content: center;
				align-items: center;
				cursor: pointer;
				display: none;
			}

			&:hover .remove {
				display: flex;
			}
		}
	}

	.mode,
	.modes-dropdown {
		position: fixed;
		top: 20px;
		left: 20px;
		color: #fff;
		padding: 16px;
		font-size: 0.9rem;
		font-weight: 600;
		background: rgba(#fff, 0.05);
		border-radius: 8px;
		cursor: pointer;
		justify-content: center;
		align-items: center;
		display: flex;

		@media (min-width: 500px) {
			top: 80px;
			left: 80px;
		}

		span {
			width: 8px;
			height: 8px;
			margin: -4px 0 0 14px;
			border: 2px solid #fff;
			border-width: 0 2px 2px 0;
			transform: rotate(45deg);

			&.open {
				margin-top: 4px;
				border-width: 2px 0 0 2px;
			}
		}
	}

	.mode,
	.modes-dropdown li {
		&:hover {
			background: rgba(#fff, 0.15);
		}
	}

	.modes-dropdown {
		top: 140px;
		margin: 0;
		padding: 0;
		list-style: none;
		flex-direction: column;
		align-items: flex-start;

		li {
			width: 100%;
			padding: 16px;
			border-radius: 8px;
		}
	}

	.home {
		position: fixed;
		margin: auto;
		left: 20px;
		bottom: 20px;
		overflow: hidden;

		@media (min-width: 500px) {
			left: 80px;
			bottom: 80px;
		}

		h1 {
			margin: 0 0 10px;
			font-size: 2.2vw;
			font-weight: 600;
		}

		h2 {
			margin: 0 0 20px;
			font-size: 1.2vw;
			font-weight: 400;
			color: rgba(#fff, 0.6);
		}

		nav {
			font-size: 14px;
			font-weight: 600;
			display: flex;
			gap: 6px;

			a {
				padding: 8px 12px;
				width: 100px;
				text-align: center;
				border-radius: 4px;
				background: rgba(232, 232, 232, 0.1);
				text-decoration: none;
				display: block;
				color: #fff;
			}
		}
	}
</style>
