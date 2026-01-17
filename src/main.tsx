import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { ThemeProvider } from '@providers/theme-provider.tsx';
import { TanstackRouterProvider } from '@providers/tanstack-route-provider.tsx';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<ThemeProvider
			defaultTheme='system'
			storageKey='vite-ui-theme'
		>
			<TanstackRouterProvider />
		</ThemeProvider>
	</StrictMode>,
);
