import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';

export default [
	{
		ignores: ['dist/**', 'node_modules/**'],
	},
	js.configs.recommended,
	{
		files: ['**/*.ts', '**/*.tsx'],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				project: './tsconfig.json',
				sourceType: 'module',
				ecmaFeatures: { jsx: true },
			},
			globals: {
				window: 'readonly',
				document: 'readonly',
				console: 'readonly',
				setTimeout: 'readonly',
				clearTimeout: 'readonly',
				setInterval: 'readonly',
				clearInterval: 'readonly',
				fetch: 'readonly',
				process: 'readonly',
				self: 'readonly',
				navigator: 'readonly',
				MutationObserver: 'readonly',
				performance: 'readonly',
				atob: 'readonly',
				btoa: 'readonly',
				Blob: 'readonly',
				Headers: 'readonly',
				Response: 'readonly',
				WebSocket: 'readonly',
				MessageChannel: 'readonly',
				IntersectionObserver: 'readonly',
				AsyncIterator: 'readonly',
				requestAnimationFrame: 'readonly',
				PointerEvent: 'readonly',
				URL: 'readonly',
				AbortController: 'readonly',
				TextDecoder: 'readonly',
				HTMLElement: 'readonly',
				SVGElement: 'readonly',
				queueMicrotask: 'readonly',
				MSApp: 'readonly',
				reportError: 'readonly',
				__REACT_DEVTOOLS_GLOBAL_HOOK__: 'readonly',
			},
			ecmaVersion: 2021,
		},
		plugins: {
			'@typescript-eslint': tseslint,
			'react': react,
			'react-hooks': reactHooks,
			'import': importPlugin,
		},
		rules: {
			'react/jsx-uses-react': 'off',
			'react/react-in-jsx-scope': 'off',
			'react-hooks/rules-of-hooks': 'error',
			'react-hooks/exhaustive-deps': 'warn',
			'import/order': 'warn',
		},
	},
	{
		files: ['vite.config.*', 'postcss.config.*'],
		languageOptions: {
			globals: {
				__dirname: 'readonly',
				module: 'readonly',
				require: 'readonly',
				process: 'readonly',
			},
			ecmaVersion: 2021,
		},
	},
];
