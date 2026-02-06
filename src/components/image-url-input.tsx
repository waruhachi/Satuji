import { useState, useRef, useEffect } from 'react';

import { Label } from '@ui/label';
import { Input } from '@ui/input';
import { ImageFileUpload } from '@components/image-file-upload';

import { HugeiconsIcon } from '@hugeicons/react';
import {
	Image01Icon,
	AlertCircleIcon,
	CheckmarkCircle01Icon,
} from '@hugeicons/core-free-icons';

interface ImageUrlInputProps {
	label: string;
	value: string;
	onChange: (url: string) => void;
	placeholder?: string;
}

export function ImageUrlInput({
	label,
	value,
	onChange,
	placeholder,
}: ImageUrlInputProps) {
	const [imageStatus, setImageStatus] = useState<{
		url: string;
		status: 'valid' | 'invalid';
	} | null>(null);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const latestUrlRef = useRef('');

	// Debounced image validation for the current value
	useEffect(() => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}

		if (!value) {
			latestUrlRef.current = '';
			return;
		}

		let isActive = true;
		let img: HTMLImageElement | null = null;

		latestUrlRef.current = value;
		const currentUrl = value;

		timeoutRef.current = setTimeout(() => {
			img = new Image();
			img.crossOrigin = 'anonymous';
			img.onload = () => {
				if (isActive && latestUrlRef.current === currentUrl) {
					setImageStatus({ url: currentUrl, status: 'valid' });
				}
			};
			img.onerror = () => {
				if (isActive && latestUrlRef.current === currentUrl) {
					setImageStatus({ url: currentUrl, status: 'invalid' });
				}
			};
			img.src = currentUrl;
		}, 300);

		return () => {
			isActive = false;
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
			if (img) {
				img.onload = null;
				img.onerror = null;
			}
		};
	}, [value]);

	const handleChange = (url: string) => {
		onChange(url);
	};

	const displayStatus: 'idle' | 'loading' | 'valid' | 'invalid' =
		!value ? 'idle'
		: imageStatus?.url === value ? imageStatus.status
		: 'loading';

	return (
		<div className='space-y-2'>
			<Label>{label}</Label>
			<div className='flex gap-3 items-center'>
				<div className='relative w-12 h-12 rounded-md border border-border bg-input flex items-center justify-center overflow-hidden shrink-0'>
					{value && displayStatus === 'valid' ?
						<img
							src={value}
							alt='Preview'
							className='w-full h-full object-cover'
						/>
					:	<HugeiconsIcon
							icon={Image01Icon}
							size={20}
							className='text-muted-foreground'
						/>
					}
				</div>
				<div className='flex-1 space-y-1'>
					<div className='relative flex gap-2'>
						<Input
							value={value}
							onChange={(e) => handleChange(e.target.value)}
							placeholder={placeholder}
							className='bg-input border-border pr-10 flex-1'
						/>
						<div className='absolute right-12 top-1/2 -translate-y-1/2'>
							{displayStatus === 'valid' && (
								<HugeiconsIcon
									icon={CheckmarkCircle01Icon}
									size={16}
									className='text-green-500'
								/>
							)}
							{displayStatus === 'invalid' && (
								<HugeiconsIcon
									icon={AlertCircleIcon}
									size={16}
									className='text-destructive'
								/>
							)}
						</div>
						<ImageFileUpload onUpload={handleChange} />
					</div>
					{displayStatus === 'invalid' && (
						<p className='text-xs text-destructive'>
							Unable to load image
						</p>
					)}
				</div>
			</div>
		</div>
	);
}
