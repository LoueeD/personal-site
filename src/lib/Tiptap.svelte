<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';

	let element: HTMLElement;
	let editor: Editor;
	export let value: string = '';
	export let onChange: (str: string) => string;

	onMount(() => {
		editor = new Editor({
			element: element,
			editorProps: {
				attributes: {
					class: '',
					style: 'outline: 0px; color: #fff;'
				}
			},
			extensions: [StarterKit],
			content: value,
			onTransaction: (props) => {
				// console.log(props.transaction.selection);
				editor = editor;
			},
			onUpdate: () => {
				onChange(editor.getHTML());
			},
			onFocus: (props) => {},
			autofocus: false
		});
	});

	onDestroy(() => {
		if (editor) {
			editor.destroy();
		}
	});
</script>

<div class="tiptap-wrapper">
	<div dont-prevent-default class="tiptap-editor" bind:this={element} />
	<div class="resize" resize-node />
</div>

<style lang="scss">
	button.active {
		background: black;
		color: white;
	}
	.tiptap-wrapper {
		padding: 12px;
		min-width: 0;
		min-height: 0;
		overflow: auto;

		.tiptap-editor {
			word-wrap: break-word;
		}

		.resize {
			position: absolute;
			right: 0;
			bottom: 0;
			width: 18px;
			height: 18px;
			cursor: se-resize;
			background: rgba(#fff, 15%);
			border-radius: 20px 0 9px 0;
			opacity: 0;

			&:hover {
				opacity: 1;
			}
		}
	}

	:global(.ProseMirror > p) {
		margin: 0;
	}

	:global(.ProseMirror > h1:first-child) {
		margin-top: 0;
	}
</style>
