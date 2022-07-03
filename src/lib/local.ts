// src/stores/content.js
import { writable } from 'svelte/store'
import { DisplayMode } from './display-mode';

// Get the value out of storage on load.
const isWindow = typeof localStorage !== 'undefined';
const currentMode = isWindow ? localStorage.mode : null;
// or localStorage.getItem('content')

// Set the stored value or a sane default.
export const mode = writable<string | null>(currentMode)

// Anytime the store changes, update the local storage value.
mode.subscribe((value) => isWindow ? localStorage.mode = value : null)
// or localStorage.setItem('content', value)