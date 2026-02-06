import { useState, useEffect, useCallback, useRef } from 'react';
import {
	ImageUploadConfigContext,
	type ImageUploadConfigContextValue,
} from '@/contexts/image-upload-config-context';

// Schema version for localStorage compatibility
const STORAGE_KEY = 'image_upload_config';
const SCHEMA_VERSION = 3;

interface StoredConfig {
	v: number;
	apiKey: string | null;
}

export function ImageUploadConfigProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [apiKey, setApiKeyState] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const initializedRef = useRef(false);

	// Load from localStorage on mount (hydration-safe pattern)
	useEffect(() => {
		if (initializedRef.current) return;
		initializedRef.current = true;

		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				const parsed: StoredConfig = JSON.parse(stored);
				// Schema version check for migrations
				if (parsed.v === SCHEMA_VERSION) {
					setApiKeyState(parsed.apiKey);
				}
			}
		} catch {
			// Invalid stored data, ignore
		} finally {
			setIsLoading(false);
		}
	}, []);

	// Persist to localStorage when config changes
	useEffect(() => {
		if (!initializedRef.current) return;

		try {
			const config: StoredConfig = {
				v: SCHEMA_VERSION,
				apiKey,
			};
			localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
		} catch {
			// Storage might be full or disabled
		}
	}, [apiKey]);

	const setApiKey = useCallback((key: string) => {
		setApiKeyState(key.trim() || null);
	}, []);

	const clearApiKey = useCallback(() => {
		setApiKeyState(null);
	}, []);

	const value: ImageUploadConfigContextValue = {
		state: {
			apiKey,
			isConfigured: !!apiKey,
		},
		actions: {
			setApiKey,
			clearApiKey,
		},
		meta: {
			isLoading,
		},
	};

	return (
		<ImageUploadConfigContext.Provider value={value}>
			{children}
		</ImageUploadConfigContext.Provider>
	);
}
