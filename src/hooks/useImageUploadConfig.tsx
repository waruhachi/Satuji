import { useContext } from 'react';
import { ImageUploadConfigContext } from '@/contexts/image-upload-config-context';

export function useImageUploadConfig() {
	const context = useContext(ImageUploadConfigContext);
	if (!context) {
		throw new Error(
			'useImageUploadConfig must be used within an ImageUploadConfigProvider',
		);
	}
	return context;
}
