import { useCallback, useRef, type ReactNode } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { UploadIcon } from '@hugeicons/core-free-icons';
import { toast } from 'sonner';

import { Button } from '@ui/button';
import { useImageUpload } from '@hooks/useImageUpload';
import { useImageUploadConfig } from '@hooks/useImageUploadConfig';
import { cn } from '@lib/utils';

interface ImageFileUploadProps {
	onUpload: (url: string) => void;
	children?: ReactNode;
	className?: string;
	accept?: string;
}

export function ImageFileUpload({
	onUpload,
	children,
	className,
	accept = 'image/*',
}: ImageFileUploadProps) {
	const { state } = useImageUploadConfig();
	const { upload, uploading } = useImageUpload(state.apiKey);
	const inputRef = useRef<HTMLInputElement>(null);

	const handleClick = useCallback(() => {
		inputRef.current?.click();
	}, []);

	const handleFileChange = useCallback(
		async (event: React.ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0];
			if (!file) return;

			const uploadPromise = upload(file);

			toast.promise(uploadPromise, {
				loading: 'Uploading image...',
				success: (url) => {
					onUpload(url);
					return 'Image uploaded successfully';
				},
				error: (err) => {
					const message =
						err instanceof Error ? err.message : 'Upload failed';
					const isNetworkError =
						err instanceof TypeError ||
						/failed to fetch|networkerror/i.test(message);
					if (isNetworkError || message.includes('CORS')) {
						return (
							<div className='flex flex-col gap-2'>
								<span>
									Upload failed due to a network or CORS
									policy issue. The image hosting service may
									not allow requests from localhost.
								</span>
								<span className='text-xs opacity-80'>
									Deploy this app to a production domain to
									fix this issue.
								</span>
							</div>
						);
					}
					return message;
				},
			});

			try {
				await uploadPromise;
			} catch {
				// Error is handled by toast
			} finally {
				// Reset input so the same file can be selected again
				if (inputRef.current) {
					inputRef.current.value = '';
				}
			}
		},
		[upload, onUpload],
	);

	const isDisabled = uploading || !state.isConfigured;

	return (
		<div className={cn('flex items-center gap-2', className)}>
			{children}

			<Button
				type='button'
				variant='outline'
				size='icon-sm'
				onClick={handleClick}
				disabled={isDisabled}
				title={
					!state.isConfigured ?
						'Configure API key first'
					:	'Upload image'
				}
				className={cn('shrink-0')}
			>
				<HugeiconsIcon
					icon={UploadIcon}
					size={16}
				/>
			</Button>

			<input
				ref={inputRef}
				type='file'
				accept={accept}
				onChange={handleFileChange}
				className='hidden'
			/>
		</div>
	);
}
