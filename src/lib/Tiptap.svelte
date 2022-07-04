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
</div>

<style lang="scss">
	button.active {
		background: black;
		color: white;
	}
	.tiptap-wrapper {
		padding: 12px;

		.tiptap-editor {
			width: 300px;
			word-wrap: break-word;
		}
	}

	:global(.ProseMirror > p) {
		margin: 0;
	}
</style>
