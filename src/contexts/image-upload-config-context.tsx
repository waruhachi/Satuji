import { createContext } from 'react';

export interface ImageUploadConfigState {
	apiKey: string | null;
	isConfigured: boolean;
}

export interface ImageUploadConfigActions {
	setApiKey: (key: string) => void;
	clearApiKey: () => void;
}

export interface ImageUploadConfigMeta {
	isLoading: boolean;
}

export interface ImageUploadConfigContextValue {
	state: ImageUploadConfigState;
	actions: ImageUploadConfigActions;
	meta: ImageUploadConfigMeta;
}

export const ImageUploadConfigContext =
	createContext<ImageUploadConfigContextValue | null>(null);
