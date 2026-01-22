import type { AltSource } from '@lib/types';

import { useState, useMemo } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	Copy01Icon,
	Tick01Icon,
	Download01Icon,
	Alert02Icon,
	CodeSimpleIcon,
	ArrowRight01Icon,
	ArrowLeft01Icon,
} from '@hugeicons/core-free-icons';

import { Button } from '@ui/button';

interface JsonPreviewPanelProps {
	source: AltSource;
	validationErrors: string[];
	isOpen: boolean;
	onToggle: () => void;
}

export function BuilderPreview({
	source,
	validationErrors,
	isOpen,
	onToggle,
}: JsonPreviewPanelProps) {
	const [copied, setCopied] = useState(false);

	const cleanedSource = useMemo(() => {
		const clean = (obj: unknown): unknown => {
			if (Array.isArray(obj)) {
				const filtered = obj.map(clean).filter((item) => {
					if (typeof item === 'object' && item !== null) {
						return Object.keys(item).length > 0;
					}
					return item !== '' && item !== undefined;
				});
				return filtered.length > 0 ? filtered : undefined;
			}
			if (typeof obj === 'object' && obj !== null) {
				const cleaned: Record<string, unknown> = {};
				for (const [key, value] of Object.entries(obj)) {
					const cleanedValue = clean(value);
					if (
						cleanedValue !== undefined &&
						cleanedValue !== '' &&
						cleanedValue !== null
					) {
						if (
							Array.isArray(cleanedValue) &&
							cleanedValue.length === 0
						)
							continue;
						if (
							typeof cleanedValue === 'object' &&
							!Array.isArray(cleanedValue) &&
							Object.keys(cleanedValue).length === 0
						)
							continue;
						cleaned[key] = cleanedValue;
					}
				}
				return Object.keys(cleaned).length > 0 ? cleaned : undefined;
			}
			return obj;
		};
		return clean(source) || {};
	}, [source]);

	const jsonString = useMemo(
		() => JSON.stringify(cleanedSource, null, 2),
		[cleanedSource],
	);

	const handleCopy = async () => {
		await navigator.clipboard.writeText(jsonString);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const handleDownload = () => {
		const blob = new Blob([jsonString], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${source.name || 'source'}.json`
			.replace(/\s+/g, '-')
			.toLowerCase();
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	const highlightJson = (json: string): string => {
		return json
			.replace(/(".*?"):/g, '<span class="text-primary">$1</span>:')
			.replace(/: (".*?")/g, ': <span class="text-chart-1">$1</span>')
			.replace(/: (\d+)/g, ': <span class="text-chart-2">$1</span>')
			.replace(
				/: (true|false)/g,
				': <span class="text-chart-3">$1</span>',
			)
			.replace(
				/: (null)/g,
				': <span class="text-muted-foreground">$1</span>',
			);
	};

	return (
		<div
			className={`relative border-l border-sidebar-border bg-sidebar flex flex-col transition-all duration-300 ${isOpen ? 'w-105' : 'w-0'}`}
		>
			{/* Toggle Button */}
			<button
				onClick={onToggle}
				className='absolute -left-10 top-4 w-10 h-10 rounded-l-lg bg-card border border-r-0 border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors z-10'
				title={isOpen ? 'Hide JSON Preview' : 'Show JSON Preview'}
			>
				{isOpen ?
					<HugeiconsIcon
						icon={ArrowRight01Icon}
						size={16}
					/>
				:	<HugeiconsIcon
						icon={ArrowLeft01Icon}
						size={16}
					/>
				}
			</button>

			{isOpen && (
				<>
					{/* Header */}
					<div className='p-4 border-b border-sidebar-border shrink-0'>
						<div className='flex items-center justify-between'>
							<div className='flex items-center gap-2'>
								<div className='w-8 h-8 rounded-lg bg-muted flex items-center justify-center'>
									<HugeiconsIcon
										icon={CodeSimpleIcon}
										size={16}
										className='text-primary'
									/>
								</div>
								<div>
									<h3 className='font-medium text-foreground text-sm'>
										JSON Output
									</h3>
									<p className='text-xs text-muted-foreground'>
										{jsonString.length.toLocaleString()}{' '}
										chars
									</p>
								</div>
							</div>
							<div className='flex items-center gap-1'>
								<Button
									variant='ghost'
									size='sm'
									onClick={handleCopy}
									className='h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-muted'
								>
									{copied ?
										<HugeiconsIcon
											icon={Tick01Icon}
											size={16}
											className='text-primary'
										/>
									:	<HugeiconsIcon
											icon={Copy01Icon}
											size={16}
										/>
									}
								</Button>
								<Button
									variant='ghost'
									size='sm'
									onClick={handleDownload}
									className='h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-muted'
								>
									<HugeiconsIcon
										icon={Download01Icon}
										size={16}
									/>
								</Button>
							</div>
						</div>
					</div>

					{/* Validation Errors */}
					{validationErrors.length > 0 && (
						<div className='p-3 bg-destructive/10 border-b border-destructive/20'>
							<div className='flex items-center gap-2 mb-2'>
								<HugeiconsIcon
									icon={Alert02Icon}
									size={16}
									className='text-destructive'
								/>
								<span className='text-sm font-medium text-destructive'>
									{validationErrors.length} Validation Error
									{validationErrors.length !== 1 ? 's' : ''}
								</span>
							</div>
							<ul className='text-xs text-destructive/80 space-y-1 max-h-24 overflow-y-auto'>
								{validationErrors.map((error, index) => (
									<li
										key={index}
										className='flex items-start gap-1'
									>
										<span className='shrink-0'>•</span>
										<span>{error}</span>
									</li>
								))}
							</ul>
						</div>
					)}

					{/* Code Preview */}
					<div className='flex-1 overflow-auto'>
						<pre className='p-4 text-xs font-mono leading-relaxed text-foreground'>
							<code
								dangerouslySetInnerHTML={{
									__html: highlightJson(jsonString),
								}}
							/>
						</pre>
					</div>

					{/* Footer Stats */}
					<div className='p-3 border-t border-sidebar-border bg-card/50'>
						<div className='flex items-center justify-between text-xs text-muted-foreground'>
							<span>
								{source.apps.length} app
								{source.apps.length !== 1 ? 's' : ''}
							</span>
							<span>
								{source.news.length} news item
								{source.news.length !== 1 ? 's' : ''}
							</span>
						</div>
					</div>
				</>
			)}
		</div>
	);
}
