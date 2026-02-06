import { useState, useCallback } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	Key01Icon,
	ViewIcon,
	ViewOffIcon,
	CheckmarkCircle01Icon,
	Delete01Icon,
} from '@hugeicons/core-free-icons';

import { Label } from '@ui/label';
import { Input } from '@ui/input';
import { Button } from '@ui/button';
import { useImageUploadConfig } from '@hooks/useImageUploadConfig';
import { cn } from '@lib/utils';

interface ImageUploadSettingsProps {
	className?: string;
}

function ApiKeyInput({
	label,
	placeholder,
	hasKey,
	keySuffix,
	onSave,
	onClear,
	link,
	linkText,
}: {
	label: string;
	placeholder: string;
	hasKey: boolean;
	keySuffix?: string;
	onSave: (key: string) => void;
	onClear: () => void;
	link: string;
	linkText: string;
}) {
	const [showKey, setShowKey] = useState(false);
	const [inputValue, setInputValue] = useState('');

	const handleSave = useCallback(() => {
		if (inputValue.trim()) {
			onSave(inputValue.trim());
			setInputValue('');
		}
	}, [inputValue, onSave]);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === 'Enter') {
				handleSave();
			}
		},
		[handleSave],
	);

	return (
		<div className='space-y-2'>
			<div className='flex items-center gap-2'>
				<HugeiconsIcon
					icon={Key01Icon}
					size={16}
					className='text-muted-foreground'
				/>
				<Label className='text-sm font-medium'>{label}</Label>
				{hasKey && (
					<HugeiconsIcon
						icon={CheckmarkCircle01Icon}
						size={14}
						className='text-chart-1'
					/>
				)}
			</div>

			{hasKey ?
				<div className='flex items-center gap-2'>
					<code className='flex-1 px-3 py-2 text-sm bg-muted rounded-md text-muted-foreground truncate'>
						••••••••{keySuffix}
					</code>
					<Button
						type='button'
						variant='ghost'
						size='icon-sm'
						onClick={onClear}
						title={`Clear ${label}`}
					>
						<HugeiconsIcon
							icon={Delete01Icon}
							size={16}
							className='text-destructive'
						/>
					</Button>
				</div>
			:	<div className='flex gap-2'>
					<div className='relative flex-1'>
						<Input
							type={showKey ? 'text' : 'password'}
							value={inputValue}
							onChange={(e) => setInputValue(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder={placeholder}
							className='pr-10'
						/>
						<Button
							type='button'
							variant='ghost'
							size='icon-xs'
							onClick={() => setShowKey(!showKey)}
							className='absolute right-1 top-1/2 -translate-y-1/2'
						>
							<HugeiconsIcon
								icon={showKey ? ViewOffIcon : ViewIcon}
								size={14}
								className='text-muted-foreground'
							/>
						</Button>
					</div>
					<Button
						type='button'
						onClick={handleSave}
						disabled={!inputValue.trim()}
					>
						Save
					</Button>
				</div>
			}

			<p className='text-xs text-muted-foreground'>
				Get your key from{' '}
				<a
					href={link}
					target='_blank'
					rel='noopener noreferrer'
					className='underline hover:text-foreground'
				>
					{linkText}
				</a>
			</p>
		</div>
	);
}

export function ImageUploadSettings({ className }: ImageUploadSettingsProps) {
	const { state, actions } = useImageUploadConfig();

	return (
		<div className={cn('space-y-6', className)}>
			<ApiKeyInput
				label='API Key'
				placeholder='Enter your freeimage.host API key'
				hasKey={!!state.apiKey}
				keySuffix={state.apiKey?.slice(-4)}
				onSave={actions.setApiKey}
				onClear={actions.clearApiKey}
				link='https://freeimage.host/api'
				linkText='freeimage.host'
			/>
		</div>
	);
}
