<script lang="ts">
	import { onMount } from 'svelte';

	let canvas: HTMLCanvasElement;
	let mousePosition = { x: 0, y: 0 };
	let isMouseDown = false;
	let ticker = 0;
	let canvasRotate = Math.PI / 10;

	onMount(() => {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		const ctx = canvas.getContext('2d');

		function makeColor(colorNum: number, colors: number) {
			if (colors < 1) colors = 1;
			// defaults to one color - avoid divide by zero
			return (colorNum * (360 / colors)) % 360;
		}

		function addNode(i: number) {
			var color = 'hsl( ' + makeColor(i, 20) + ', 100%, 60% )';
			const halfW = window.innerWidth / 2;
			const halfH = window.innerHeight / 2;
			const speed = Math.floor(Math.random() * 10) / 20 + 0.5;
			const size = speed * 1.2;
			return {
				color,
				speed,
				size,
				rotation: Math.floor(Math.random() * 1000) + 50,
				x: Math.floor(Math.random() * halfW) + halfW,
				y: Math.floor(Math.random() * halfH) + halfH
			};
		}

		const nodes = [...new Array(2000)].map((_, i) => addNode(i));

		const draw = () => {
			const { x, y } = mousePosition;
			if (ctx && ticker < 1) {
				ticker += 0.05;
				ctx.globalAlpha = ticker;
			}
			ctx?.resetTransform();
			ctx?.clearRect(0, 0, window.innerWidth, window.innerHeight);
			nodes.forEach((node) => {
				if (ctx) {
					ctx.beginPath();
					ctx.arc(node.x, node.y, node.size, 0, 2 * Math.PI);
					ctx.fillStyle = node.color;
					ctx.fill();
					if (node.x > x) node.x -= (node.x / node.rotation) * node.speed;
					if (node.x < x) node.x += (node.x / node.rotation) * node.speed;
					if (node.y > y) node.y -= (node.y / node.rotation) * node.speed;
					if (node.y < y) node.y += (node.y / node.rotation) * node.speed;
					if (!isMouseDown) {
						canvasRotate += 0.0000000001;
					}
					ctx?.translate(window.innerWidth / 2, window.innerHeight / 2);
					ctx?.rotate(canvasRotate);
					ctx?.translate(-window.innerWidth / 2, -window.innerHeight / 2);
				}
			});
			requestAnimationFrame(draw);
		};
		draw();

		const move = (e: MouseEvent | TouchEvent) => {
			const mouseEvent = e as MouseEvent;
			if (mouseEvent.clientX && mouseEvent.clientY) {
				const { clientX: x, clientY: y } = mouseEvent;
				mousePosition = { x, y };
				isMouseDown = mouseEvent.buttons !== 0;
			} else {
				e.preventDefault();
				const touchEvent = e as TouchEvent;
				const { clientX: x, clientY: y } = touchEvent.touches[0];
				mousePosition = { x, y };
			}
		};

		window.addEventListener('mousemove', move);
		window.addEventListener('touchmove', move);
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
