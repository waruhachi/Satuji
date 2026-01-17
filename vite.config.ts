import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		tanstackRouter({
			target: 'react',
			autoCodeSplitting: true,
		}),
		react(),
		tailwindcss(),
	],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
			'@ui': path.resolve(__dirname, './src/components/ui'),
			'@components': path.resolve(__dirname, './src/components'),
			'@hooks': path.resolve(__dirname, './src/hooks'),
			'@contexts': path.resolve(__dirname, './src/contexts'),
			'@providers': path.resolve(__dirname, './src/providers'),
			'@lib': path.resolve(__dirname, './src/lib'),
			'@assets': path.resolve(__dirname, './src/assets'),
		},
	},
});
