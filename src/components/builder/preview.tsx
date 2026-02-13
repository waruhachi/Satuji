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
import { toast } from 'sonner';

import { Button } from '@ui/button';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
} from '@ui/select';
import {
	buildExportSource,
	exportPlatformIcon,
	exportPlatformLabel,
	type ExportPlatform,
} from '@lib/source-format';

type JsonTokenType =
	| 'key'
	| 'string'
	| 'number'
	| 'boolean'
	| 'null'
	| 'punctuation';

interface JsonToken {
	text: string;
	type?: JsonTokenType;
}

const JSON_TOKEN_PATTERN =
	/"(?:\\.|[^"\\])*"(?=\s*:)|"(?:\\.|[^"\\])*"|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|\btrue\b|\bfalse\b|\bnull\b|[{}[\],:]/g;

const JSON_TOKEN_CLASS: Record<JsonTokenType, string> = {
	key: 'text-primary font-medium',
	string: 'text-chart-3',
	number: 'text-chart-5',
	boolean: 'text-chart-4',
	null: 'text-muted-foreground italic',
	punctuation: 'text-foreground/80',
};

const tokenizeJson = (value: string): JsonToken[] => {
	const tokens: JsonToken[] = [];
	let lastIndex = 0;
	let match: RegExpExecArray | null;

	JSON_TOKEN_PATTERN.lastIndex = 0;

	while ((match = JSON_TOKEN_PATTERN.exec(value)) !== null) {
		const [token] = match;
		const index = match.index;

		if (index > lastIndex) {
			tokens.push({ text: value.slice(lastIndex, index) });
		}

		let type: JsonTokenType;
		if (token.startsWith('"')) {
			type =
				(
					token.endsWith('"') &&
					value
						.slice(index + token.length)
						.trimStart()
						.startsWith(':')
				) ?
					'key'
				:	'string';
		} else if (token === 'true' || token === 'false') {
			type = 'boolean';
		} else if (token === 'null') {
			type = 'null';
		} else if (/^-?\d/.test(token)) {
			type = 'number';
		} else {
			type = 'punctuation';
		}

		tokens.push({ text: token, type });
		lastIndex = index + token.length;
	}

	if (lastIndex < value.length) {
		tokens.push({ text: value.slice(lastIndex) });
	}

	return tokens;
};

interface JsonPreviewPanelProps {
	source: AltSource;
	validationErrors: string[];
	exportPlatform: ExportPlatform;
	onExportPlatformChange: (platform: ExportPlatform) => void;
	isOpen: boolean;
	onToggle: () => void;
}

export function BuilderPreview({
	source,
	validationErrors,
	exportPlatform,
	onExportPlatformChange,
	isOpen,
	onToggle,
}: JsonPreviewPanelProps) {
	const [copied, setCopied] = useState(false);
	const exportSource = useMemo(
		() => buildExportSource(source, exportPlatform),
		[source, exportPlatform],
	);

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
					if (key.startsWith('__')) continue;
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
		return clean(exportSource) || {};
	}, [exportSource]);

	const jsonString = useMemo(
		() => JSON.stringify(cleanedSource, null, 2),
		[cleanedSource],
	);
	const highlightedJson = useMemo(
		() => tokenizeJson(jsonString),
		[jsonString],
	);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(jsonString);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			toast.error('Unable to copy JSON');
		}
	};

	const handleDownload = () => {
		const blob = new Blob([jsonString], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download =
			`${source.name || 'source'}-${exportPlatformLabel(exportPlatform)}.json`
				.replace(/\s+/g, '-')
				.toLowerCase();
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	return (
		<div
			className={`relative border-l border-sidebar-border bg-sidebar flex flex-col min-h-0 transition-all duration-300 ${isOpen ? 'w-105' : 'w-0'}`}
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
								<Select
									value={exportPlatform}
									onValueChange={(value) =>
										onExportPlatformChange(
											value as ExportPlatform,
										)
									}
								>
									<SelectTrigger
										size='sm'
										className='h-8 min-w-30 text-xs px-2'
										aria-label='Export platform'
									>
										<span className='flex items-center gap-2 truncate'>
											<img
												src={exportPlatformIcon(
													exportPlatform,
												)}
												alt=''
												aria-hidden='true'
												className='w-4 h-4 rounded-sm object-cover'
											/>
											<span>
												{exportPlatformLabel(
													exportPlatform,
												)}
											</span>
										</span>
									</SelectTrigger>
										<SelectContent
											align='end'
											className='bg-card border border-border text-foreground ring-border/40 shadow-xl'
										>
											<SelectItem
												value='altstore'
											className='text-xs'
										>
											<img
												src={exportPlatformIcon('altstore')}
												alt='AltStore'
												className='w-4 h-4 rounded-sm object-cover'
											/>
											<span>AltStore</span>
										</SelectItem>
										<SelectItem
											value='sidestore'
											className='text-xs'
										>
											<img
												src={exportPlatformIcon('sidestore')}
												alt='SideStore'
												className='w-4 h-4 rounded-sm object-cover'
											/>
											<span>SideStore</span>
										</SelectItem>
									</SelectContent>
								</Select>
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
					<div className='flex-1 overflow-auto p-4'>
						<pre className='w-full min-h-full rounded-xl border border-border bg-card/30 p-4 font-mono text-xs leading-5 text-foreground whitespace-pre-wrap break-all overflow-hidden'>
							<code>
								{highlightedJson.map((token, index) => (
									<span
										key={`${index}-${token.type ?? 'plain'}`}
										className={
											token.type ?
												JSON_TOKEN_CLASS[token.type]
											:	undefined
										}
									>
										{token.text}
									</span>
								))}
							</code>
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
