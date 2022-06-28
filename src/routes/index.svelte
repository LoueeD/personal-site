<script lang="ts">
	import CanvasHelper from '$lib/canvas';
	import { onMount } from 'svelte';

	let canvas: HTMLCanvasElement;
	let canvasHelper: CanvasHelper;

	let wheelValue = 1;

	onMount(() => {
		canvasHelper = new CanvasHelper(canvas);
	});
</script>

<svelte:head>
	<title>Loueed</title>
</svelte:head>
<canvas bind:this={canvas} />
<div class="home">
	<h1>Louis</h1>
	<h2>Personal site about web development, tech and design.</h2>
	<nav>
		<a href="https://twitter.com/imlwi">@imlwi</a>
		<a href="https://linkedin.com/in/louis-dickinson">LinkedIn</a>
	</nav>
</div>

<style lang="scss">
	canvas {
		position: fixed;
		top: 0;
		left: 0;
		// cursor: none;
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
