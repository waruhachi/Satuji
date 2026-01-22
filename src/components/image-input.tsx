import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	Image01Icon,
	AlertCircleIcon,
	CheckmarkCircle03Icon,
} from '@hugeicons/core-free-icons';

import { Label } from '@ui/label';
import { Input } from '@ui/input';

interface ImageInputProps {
	label: string;
	value: string;
	onChange: (url: string) => void;
	placeholder?: string;
}

export function ImageInput({
	label,
	value,
	onChange,
	placeholder,
}: ImageInputProps) {
	const [imageStatus, setImageStatus] = useState<
		'idle' | 'loading' | 'valid' | 'invalid'
	>('idle');

	const handleChange = (url: string) => {
		onChange(url);
		if (!url) {
			setImageStatus('idle');
			return;
		}
		setImageStatus('loading');
		const img = new Image();
		img.crossOrigin = 'anonymous';
		img.onload = () => setImageStatus('valid');
		img.onerror = () => setImageStatus('invalid');
		img.src = url;
	};

	return (
		<div className='space-y-2'>
			<Label className='text-muted-foreground'>{label}</Label>
			<div className='flex gap-3'>
				<div className='relative w-12 h-12 rounded-lg border border-border bg-card flex items-center justify-center overflow-hidden shrink-0'>
					{value && imageStatus === 'valid' ?
						<img
							src={value || '/placeholder.svg'}
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
					<div className='relative'>
						<Input
							value={value}
							onChange={(e) => handleChange(e.target.value)}
							placeholder={placeholder}
							className='bg-card border-border text-foreground placeholder:text-muted-foreground pr-10'
						/>
						<div className='absolute right-3 top-1/2 -translate-y-1/2'>
							{imageStatus === 'valid' && (
								<HugeiconsIcon
									icon={CheckmarkCircle03Icon}
									size={16}
									className='text-chart-1'
								/>
							)}
							{imageStatus === 'invalid' && (
								<HugeiconsIcon
									icon={AlertCircleIcon}
									size={16}
									className='text-destructive'
								/>
							)}
						</div>
					</div>
					{imageStatus === 'invalid' && (
						<p className='text-xs text-destructive'>
							Unable to load image
						</p>
					)}
				</div>
			</div>
		</div>
	);
}
