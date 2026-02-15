import type { AltSource, SectionID } from '@lib/types';

import { useMemo, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	Copy01Icon,
	Tick01Icon,
	Download01Icon,
	Alert02Icon,
	CodeSimpleIcon,
	ArrowRight01Icon,
	ArrowLeft01Icon,
	Cursor01Icon,
	MoreVerticalIcon,
	EyeIcon,
} from '@hugeicons/core-free-icons';
import { toast } from 'sonner';

import { Button } from '@ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@ui/select';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@ui/dropdown-menu';
import {
	buildExportSource,
	exportPlatformIcon,
	exportPlatformLabel,
	type ExportPlatform,
} from '@lib/source-format';
import { cn } from '@lib/utils';
import {
	StorePreview,
	type StorePreviewScreen,
} from '@components/builder/store-preview';

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
	mode?: 'desktop' | 'mobile';
	source: AltSource;
	activeSection: SectionID;
	onSectionChange: (section: SectionID) => void;
	validationErrors: string[];
	exportPlatform: ExportPlatform;
	onExportPlatformChange: (platform: ExportPlatform) => void;
	isOpen: boolean;
	onToggle: () => void;
}

export function BuilderPreview({
	mode = 'desktop',
	source,
	activeSection,
	onSectionChange,
	validationErrors,
	exportPlatform,
	onExportPlatformChange,
	isOpen,
	onToggle,
}: JsonPreviewPanelProps) {
	const isDesktop = mode === 'desktop';
	const shouldShowPanel = isDesktop ? isOpen : true;
	const [copied, setCopied] = useState(false);
	const [showJson, setShowJson] = useState(false);
	const [pickMode, setPickMode] = useState(false);
	const [manualScreen, setManualScreen] = useState<{
		token: object;
		screen: StorePreviewScreen;
	} | null>(null);
	const exportSource = useMemo(
		() => buildExportSource(source, exportPlatform),
		[source, exportPlatform],
	);

	// Used to scope in-panel navigation. When the editor changes section, the token
	// changes and we fall back to auto-follow behavior without needing an effect.
	const sectionToken = useMemo(
		() => ({ section: activeSection }),
		[activeSection],
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
	const highlightedJson = useMemo(() => {
		if (!showJson) return [];
		return tokenizeJson(jsonString);
	}, [jsonString, showJson]);

	const followScreen = useMemo<StorePreviewScreen>(() => {
		if (activeSection === 'source') return { kind: 'home' };
		if (activeSection === 'apps') return { kind: 'all-apps' };
		if (activeSection === 'news') return { kind: 'all-news' };

		if (activeSection.startsWith('app-')) {
			const index = Number.parseInt(
				activeSection.slice('app-'.length),
				10,
			);
			return {
				kind: 'app-detail',
				appIndex: Number.isFinite(index) ? index : 0,
				back: 'all-apps',
			};
		}

		if (activeSection.startsWith('news-')) return { kind: 'all-news' };
		return { kind: 'home' };
	}, [activeSection]);

	const effectiveScreen =
		manualScreen?.token === sectionToken ?
			manualScreen.screen
		:	followScreen;

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

	const handlePickSection = (section: SectionID) => {
		onSectionChange(section);
		setPickMode(false);
	};

	const handleNavigate = (next: StorePreviewScreen) => {
		setManualScreen({ token: sectionToken, screen: next });
	};

	return (
		<div
			className={cn(
				'bg-sidebar flex flex-col min-h-0',
				isDesktop &&
					'relative border-l border-sidebar-border transition-all duration-300',
				isDesktop && (isOpen ? 'w-105' : 'w-0'),
				isDesktop && 'overflow-visible',
				!isDesktop && 'w-full h-full overflow-hidden',
			)}
		>
			{isDesktop && (
				<Button
					variant='outline'
					size='icon-sm'
					onClick={onToggle}
					className='absolute -left-7 top-6 h-14 w-7 rounded-l-xl rounded-r-none border-r-0 border-border bg-card/95 text-muted-foreground hover:text-foreground hover:bg-muted z-20 shadow-sm'
					title={isOpen ? 'Hide Preview' : 'Show Preview'}
					aria-label={isOpen ? 'Hide Preview' : 'Show Preview'}
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
				</Button>
			)}

			{shouldShowPanel && (
				<>
					{/* Header */}
					<div className='p-4 border-b border-sidebar-border shrink-0'>
						<div className='flex items-center justify-between'>
							<div className='flex items-center gap-2'>
								<div className='w-8 h-8 rounded-lg bg-muted flex items-center justify-center'>
									<HugeiconsIcon
										icon={
											showJson ? CodeSimpleIcon : EyeIcon
										}
										size={16}
										className='text-primary'
									/>
								</div>
								<div>
									<h3 className='font-medium text-foreground text-sm'>
										{showJson ? 'JSON Output' : 'Preview'}
									</h3>
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
										className='h-8 min-w-24 sm:min-w-30 text-xs px-2'
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
												src={exportPlatformIcon(
													'altstore',
												)}
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
												src={exportPlatformIcon(
													'sidestore',
												)}
												alt='SideStore'
												className='w-4 h-4 rounded-sm object-cover'
											/>
											<span>SideStore</span>
										</SelectItem>
									</SelectContent>
								</Select>
								{!showJson && (
									<Button
										variant='ghost'
										size='sm'
										onClick={() =>
											setPickMode((prev) => !prev)
										}
										aria-pressed={pickMode}
										title={
											pickMode ? 'Disable pick mode' : (
												'Enable pick mode'
											)
										}
										className={cn(
											'h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-muted',
											pickMode &&
												'bg-primary/10 text-primary hover:text-primary hover:bg-primary/15',
										)}
									>
										<HugeiconsIcon
											icon={Cursor01Icon}
											size={16}
										/>
									</Button>
								)}
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
								<DropdownMenu>
									<DropdownMenuTrigger
										render={
											<Button
												variant='ghost'
												size='sm'
												className='h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-muted'
											>
												<HugeiconsIcon
													icon={MoreVerticalIcon}
													size={16}
												/>
											</Button>
										}
									></DropdownMenuTrigger>
									<DropdownMenuContent
										align='end'
										className='bg-card border-border'
									>
										<DropdownMenuItem
											onClick={() => {
												setShowJson((prev) => !prev);
												setPickMode(false);
											}}
											className='text-muted-foreground hover:text-foreground focus:text-foreground focus:bg-muted'
										>
											<HugeiconsIcon
												icon={
													showJson ? EyeIcon : (
														CodeSimpleIcon
													)
												}
												size={16}
												className='mr-2'
											/>
											{showJson ?
												'Back to Preview'
											:	'View JSON'}
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
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

					{/* Preview Body */}
					{showJson ?
						<div className='flex-1 overflow-auto p-4'>
							<Button
								variant='ghost'
								size='sm'
								onClick={() => setShowJson(false)}
								className='mb-3 h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-muted w-fit'
							>
								<HugeiconsIcon
									icon={ArrowLeft01Icon}
									size={16}
								/>
								Back to Preview
							</Button>
							<pre className='w-full rounded-xl border border-border bg-card/30 p-4 font-mono text-xs leading-5 text-foreground whitespace-pre overflow-x-auto'>
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
					:	<div className='flex-1 overflow-hidden'>
							<StorePreview
								source={source}
								screen={effectiveScreen}
								activeSection={activeSection}
								pickMode={pickMode}
								onNavigate={handleNavigate}
								onPickSection={handlePickSection}
							/>
						</div>
					}

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
