import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { Toaster } from '@components/ui/sonner.tsx';
import { ThemeProvider } from '@providers/theme-provider.tsx';
import { TanstackRouterProvider } from '@providers/tanstack-route-provider.tsx';
import { ImageUploadConfigProvider } from '@providers/image-upload-config-provider';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<ThemeProvider
			defaultTheme='system'
			storageKey='vite-ui-theme'
		>
			<ImageUploadConfigProvider>
				<TanstackRouterProvider />
				<Toaster />
			</ImageUploadConfigProvider>
		</ThemeProvider>
	</StrictMode>,
);
