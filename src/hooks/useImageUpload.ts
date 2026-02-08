import { useState, useCallback, useEffect, useRef } from 'react';

interface FreeimagehostResponse {
	image: {
		url: string;
		url_viewer: string;
	};
	status_code: number;
}

interface UseImageUploadReturn {
	upload: (file: File) => Promise<string>;
	uploading: boolean;
}

export function useImageUpload(apiKey: string | null): UseImageUploadReturn {
	const [uploading, setUploading] = useState(false);
	const abortControllerRef = useRef<AbortController | null>(null);
	const isMountedRef = useRef(true);
	const uploadIdRef = useRef(0);

	const abort = useCallback(() => {
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
			abortControllerRef.current = null;
		}
	}, []);

	useEffect(() => {
		return () => {
			isMountedRef.current = false;
			abort();
		};
	}, [abort]);

	const upload = useCallback(
		async (file: File): Promise<string> => {
			if (!apiKey) {
				throw new Error('API key not configured');
			}

			const currentId = ++uploadIdRef.current;

			// Cleanup previous request
			abort();

			const abortController = new AbortController();
			abortControllerRef.current = abortController;

			if (isMountedRef.current) {
				setUploading(true);
			}

			try {
				const formData = new FormData();
				formData.append('source', file);
				formData.append('key', apiKey);
				formData.append('action', 'upload');
				formData.append('format', 'json');

				const response = await fetch('/api/upload', {
					method: 'POST',
					body: formData,
					signal: abortController.signal,
				});

				if (!response.ok) {
					throw new Error(`Upload failed: ${response.statusText}`);
				}

				const result: FreeimagehostResponse = await response.json();

				if (result.status_code !== 200 || !result.image?.url) {
					throw new Error('Upload failed: Invalid response');
				}

				return result.image.url;
			} finally {
				if (isMountedRef.current && uploadIdRef.current === currentId) {
					setUploading(false);
				}
				if (abortControllerRef.current === abortController) {
					abortControllerRef.current = null;
				}
			}
		},
		[apiKey, abort],
	);

	return { upload, uploading };
}
