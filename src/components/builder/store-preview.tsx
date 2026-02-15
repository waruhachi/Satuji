import type {
	AltSource,
	App,
	DeviceScreenshots,
	NewsItem,
	Screenshot,
	SectionID,
} from '@lib/types';

import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	ArrowLeft01Icon,
	Link01Icon,
	PackageIcon,
	NewsIcon,
	Image01Icon,
	Wifi01Icon,
	Mic01Icon,
	Camera01Icon,
	BluetoothIcon,
	Location01Icon,
	InformationCircleIcon,
} from '@hugeicons/core-free-icons';
import Color from 'color';

import { Badge } from '@ui/badge';
import { Button } from '@ui/button';
import { cn } from '@lib/utils';

export type StorePreviewScreen =
	| { kind: 'home' }
	| { kind: 'all-news' }
	| { kind: 'all-apps' }
	| { kind: 'app-detail'; appIndex: number; back: 'home' | 'all-apps' };

interface StorePreviewProps {
	source: AltSource;
	screen: StorePreviewScreen;
	activeSection: SectionID;
	pickMode: boolean;
	onNavigate: (screen: StorePreviewScreen) => void;
	onPickSection: (section: SectionID) => void;
}

type ColorValue = ReturnType<typeof Color>;

const safeColor = (value?: string): ColorValue | null => {
	if (!value) return null;
	try {
		return Color(value);
	} catch {
		return null;
	}
};

const tintGradientStyle = (
	tintColor: string | undefined,
	alphaFrom = 0.22,
	alphaTo = 0.06,
): CSSProperties => {
	const base = safeColor(tintColor)?.rgb() ?? safeColor('#6366f1')!.rgb();
	const from = base.alpha(alphaFrom).string();
	const to = base.alpha(alphaTo).string();
	return {
		backgroundImage: `linear-gradient(135deg, ${from}, ${to})`,
	};
};

const formatBytes = (bytes: number): string => {
	if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
	const k = 1024;
	const sizes = ['B', 'KB', 'MB', 'GB'];
	const i = Math.min(
		sizes.length - 1,
		Math.floor(Math.log(bytes) / Math.log(k)),
	);
	const value = bytes / Math.pow(k, i);
	const rounded =
		value >= 100 ? Math.round(value) : Math.round(value * 10) / 10;
	return `${rounded} ${sizes[i]}`;
};

const parseISODate = (value: string): Date | null => {
	const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
	if (match) {
		const [, y, m, d] = match;
		const date = new Date(Number(y), Number(m) - 1, Number(d));
		return Number.isNaN(date.getTime()) ? null : date;
	}
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (value: string): string => {
	const date = parseISODate(value);
	if (!date) return value;
	return new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	}).format(date);
};

const nonEmptyString = (value: unknown): value is string =>
	typeof value === 'string' && value.trim().length > 0;

const toScreenshotUrls = (
	screenshots?: (string | Screenshot)[] | DeviceScreenshots,
): string[] => {
	if (!screenshots) return [];
	if (Array.isArray(screenshots)) {
		return screenshots
			.map((s) => (typeof s === 'string' ? s : s.imageURL))
			.filter(nonEmptyString);
	}
	return [
		...((screenshots as DeviceScreenshots).iphone ?? []),
		...((screenshots as DeviceScreenshots).ipad ?? []),
	]
		.map((s) => (typeof s === 'string' ? s : s.imageURL))
		.filter(nonEmptyString);
};

const getActiveAppIndex = (activeSection: SectionID): number | null => {
	if (!activeSection.startsWith('app-')) return null;
	const index = Number.parseInt(activeSection.slice('app-'.length), 10);
	return Number.isFinite(index) ? index : null;
};

const getActiveNewsIndex = (activeSection: SectionID): number | null => {
	if (!activeSection.startsWith('news-')) return null;
	const index = Number.parseInt(activeSection.slice('news-'.length), 10);
	return Number.isFinite(index) ? index : null;
};

const PrivacyIcon = ({ label }: { label: string }) => {
	const normalized = label.toLowerCase();
	let icon = InformationCircleIcon;
	if (normalized.includes('network') || normalized.includes('wifi')) {
		icon = Wifi01Icon;
	} else if (
		normalized.includes('microphone') ||
		normalized.includes('mic')
	) {
		icon = Mic01Icon;
	} else if (normalized.includes('photo') || normalized.includes('gallery')) {
		icon = Image01Icon;
	} else if (normalized.includes('camera')) {
		icon = Camera01Icon;
	} else if (normalized.includes('bluetooth')) {
		icon = BluetoothIcon;
	} else if (normalized.includes('location')) {
		icon = Location01Icon;
	}

	return (
		<HugeiconsIcon
			icon={icon}
			size={18}
			className='text-muted-foreground'
		/>
	);
};

function AppIcon({
	app,
	size = 56,
	className,
}: {
	app: App;
	size?: number;
	className?: string;
}) {
	if (app.iconURL) {
		return (
			<img
				src={app.iconURL}
				alt={app.name ? `${app.name} icon` : 'App icon'}
				className={cn('shrink-0 rounded-2xl object-cover', className)}
				style={{ width: size, height: size }}
			/>
		);
	}

	return (
		<div
			className={cn(
				'shrink-0 rounded-2xl flex items-center justify-center',
				className,
			)}
			style={{
				width: size,
				height: size,
				backgroundColor: app.tintColor || '#6366f1',
			}}
		>
			<HugeiconsIcon
				icon={PackageIcon}
				size={Math.max(18, Math.round(size * 0.42))}
				className='text-foreground'
			/>
		</div>
	);
}

function SourceIcon({
	source,
	size = 64,
}: {
	source: AltSource;
	size?: number;
}) {
	if (source.iconURL) {
		return (
			<img
				src={source.iconURL}
				alt={source.name ? `${source.name} icon` : 'Source icon'}
				className='shrink-0 rounded-3xl object-cover'
				style={{ width: size, height: size }}
			/>
		);
	}

	return (
		<div
			className='shrink-0 rounded-3xl flex items-center justify-center'
			style={{
				width: size,
				height: size,
				backgroundColor: source.tintColor || '#6366f1',
			}}
		>
			<HugeiconsIcon
				icon={NewsIcon}
				size={Math.max(20, Math.round(size * 0.45))}
				className='text-foreground'
			/>
		</div>
	);
}

function FreePill({ className }: { className?: string }) {
	return (
		<Badge
			variant='outline'
			className={cn(
				'h-8 px-4 text-sm font-semibold tracking-wide uppercase bg-primary/12 border-primary/25 text-primary',
				className,
			)}
		>
			FREE
		</Badge>
	);
}

function SectionTitle({
	title,
	actionLabel,
	onAction,
}: {
	title: string;
	actionLabel?: string;
	onAction?: () => void;
}) {
	return (
		<div className='flex items-end justify-between gap-3'>
			<h2 className='text-3xl sm:text-4xl font-semibold text-foreground tracking-tight'>
				{title}
			</h2>
			{actionLabel && onAction && (
				<Button
					variant='ghost'
					size='sm'
					onClick={onAction}
					className='h-auto px-0 py-1 text-sm text-primary hover:bg-transparent hover:underline'
				>
					{actionLabel}
				</Button>
			)}
		</div>
	);
}

function NavBar({
	leftLabel,
	title,
	rightSlot,
	onBack,
}: {
	leftLabel: string;
	title: ReactNode;
	rightSlot?: ReactNode;
	onBack: () => void;
}) {
	return (
		<div className='-mx-4 px-4 pt-2 pb-3'>
			<div className='grid grid-cols-[1fr_auto_1fr] items-center gap-2'>
				<div className='justify-self-start'>
					<Button
						variant='ghost'
						size='icon-sm'
						onClick={onBack}
						aria-label={`Back to ${leftLabel}`}
						className='rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60'
					>
						<HugeiconsIcon
							icon={ArrowLeft01Icon}
							size={18}
						/>
					</Button>
				</div>

				<div className='justify-self-center min-w-0'>
					<div className='inline-flex items-center justify-center gap-2 min-w-0'>
						{title}
					</div>
				</div>

				<div className='justify-self-end'>
					{rightSlot ?? <div className='size-8' />}
				</div>
			</div>
		</div>
	);
}

function NewsHeroCard({
	item,
	pickMode,
	selected,
	onClick,
}: {
	item: NewsItem;
	pickMode: boolean;
	selected: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type='button'
			onClick={onClick}
			className={cn(
				'w-full text-left rounded-[28px] overflow-hidden border border-border shadow-sm transition-colors outline-none',
				pickMode ?
					'cursor-crosshair hover:ring-2 hover:ring-primary/30'
				:	'cursor-pointer',
				selected && 'ring-2 ring-primary/45',
			)}
			style={tintGradientStyle(item.tintColor)}
		>
			<div className='p-6 sm:p-7'>
				<h3 className='text-3xl sm:text-4xl font-semibold text-foreground tracking-tight'>
					{item.title || 'Untitled News'}
				</h3>
				<p className='mt-3 text-base sm:text-lg text-muted-foreground'>
					{item.caption || 'No caption provided.'}
				</p>
			</div>
		</button>
	);
}

function FeaturedAppCard({
	app,
	pickMode,
	selected,
	onClick,
}: {
	app: App;
	pickMode: boolean;
	selected: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type='button'
			onClick={onClick}
			className={cn(
				'w-full text-left rounded-[28px] overflow-hidden border border-border shadow-sm transition-colors outline-none',
				pickMode ?
					'cursor-crosshair hover:ring-2 hover:ring-primary/30'
				:	'cursor-pointer',
				selected && 'ring-2 ring-primary/45',
			)}
			style={tintGradientStyle(app.tintColor, 0.18, 0.06)}
		>
			<div className='flex items-center gap-4 p-5'>
				<AppIcon
					app={app}
					size={56}
					className='rounded-2xl'
				/>
				<div className='min-w-0 flex-1'>
					<p className='text-xl font-semibold text-foreground truncate'>
						{app.name || 'Untitled App'}
					</p>
					<p className='text-sm text-muted-foreground truncate'>
						{app.developerName || 'Unknown Developer'}
					</p>
				</div>
				<FreePill className='shrink-0' />
			</div>
		</button>
	);
}

function AppListCard({
	app,
	screenshotUrls,
	pickMode,
	selected,
	onClick,
}: {
	app: App;
	screenshotUrls: string[];
	pickMode: boolean;
	selected: boolean;
	onClick: () => void;
}) {
	const shots = screenshotUrls.slice(0, 3);
	return (
		<button
			type='button'
			onClick={onClick}
			className={cn(
				'w-full text-left rounded-[28px] overflow-hidden border border-border shadow-sm outline-none transition-colors',
				pickMode ?
					'cursor-crosshair hover:ring-2 hover:ring-primary/30'
				:	'cursor-pointer',
				selected && 'ring-2 ring-primary/45',
			)}
			style={tintGradientStyle(app.tintColor, 0.16, 0.04)}
		>
			<div className='p-5'>
				<div className='flex items-center gap-4'>
					<AppIcon
						app={app}
						size={56}
					/>
					<div className='min-w-0 flex-1'>
						<p className='text-xl font-semibold text-foreground truncate'>
							{app.name || 'Untitled App'}
						</p>
						<p className='text-sm text-muted-foreground truncate'>
							{app.developerName || 'Unknown Developer'}
						</p>
					</div>
					<FreePill className='shrink-0' />
				</div>

				{app.subtitle && (
					<p className='mt-4 text-base text-muted-foreground text-center'>
						{app.subtitle}
					</p>
				)}

				<div className='mt-5 grid grid-cols-3 gap-3'>
					{shots.length > 0 ?
						shots.map((url, index) => (
							<div
								key={`${app.bundleIdentifier}-shot-${index}`}
								className='rounded-2xl overflow-hidden bg-card/50 border border-border'
							>
								<img
									src={url}
									alt=''
									aria-hidden='true'
									className='h-full w-full object-cover aspect-[3/4]'
									loading='lazy'
								/>
							</div>
						))
					:	<>
							{Array.from({ length: 3 }).map((_, index) => (
								<div
									key={`${app.bundleIdentifier}-placeholder-${index}`}
									className='rounded-2xl bg-card/40 border border-border aspect-[3/4] flex items-center justify-center'
								>
									<HugeiconsIcon
										icon={Image01Icon}
										size={18}
										className='text-muted-foreground'
									/>
								</div>
							))}
						</>
					}
				</div>
			</div>
		</button>
	);
}

function NewsListCard({
	item,
	app,
	pickMode,
	selected,
	onClick,
}: {
	item: NewsItem;
	app?: App;
	pickMode: boolean;
	selected: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type='button'
			onClick={onClick}
			className={cn(
				'w-full text-left rounded-[28px] overflow-hidden border border-border shadow-sm outline-none transition-colors',
				pickMode ?
					'cursor-crosshair hover:ring-2 hover:ring-primary/30'
				:	'cursor-pointer',
				selected && 'ring-2 ring-primary/45',
			)}
			style={tintGradientStyle(item.tintColor, 0.2, 0.05)}
		>
			<div className='p-6'>
				<h3 className='text-2xl sm:text-3xl font-semibold text-foreground tracking-tight'>
					{item.title || 'Untitled News'}
				</h3>
				<p className='mt-3 text-base text-muted-foreground'>
					{item.caption || 'No caption provided.'}
				</p>
			</div>

			{item.imageURL && (
				<div className='px-6 pb-6'>
					<div className='rounded-[22px] overflow-hidden bg-card/40 border border-border'>
						<img
							src={item.imageURL}
							alt=''
							aria-hidden='true'
							className='w-full object-cover aspect-video'
							loading='lazy'
						/>
					</div>
				</div>
			)}

			{app && (
				<div className='px-6 pb-6'>
					<div className='rounded-[24px] bg-card/40 border border-border p-4 flex items-center gap-4'>
						<AppIcon
							app={app}
							size={56}
						/>
						<div className='min-w-0 flex-1'>
							<p className='text-xl font-semibold text-foreground truncate'>
								{app.name || 'Untitled App'}
							</p>
							<p className='text-sm text-muted-foreground truncate'>
								{app.developerName || 'Unknown Developer'}
							</p>
						</div>
						<FreePill className='shrink-0' />
					</div>
				</div>
			)}
		</button>
	);
}

function AppDetailScreen({
	source,
	app,
	appIndex,
	back,
	pickMode,
	onNavigate,
	onPickSection,
}: {
	source: AltSource;
	app: App;
	appIndex: number;
	back: 'home' | 'all-apps';
	pickMode: boolean;
	onNavigate: (screen: StorePreviewScreen) => void;
	onPickSection: (section: SectionID) => void;
}) {
	const latest = app.versions[0];
	const screenshots = useMemo(
		() => toScreenshotUrls(app.screenshots).slice(0, 6),
		[app.screenshots],
	);
	const [descriptionExpanded, setDescriptionExpanded] = useState(false);
	const privacyEntries = Object.entries(app.appPermissions?.privacy ?? {});
	const entitlements = app.appPermissions?.entitlements ?? [];

	const handleBack = () => {
		onNavigate(back === 'home' ? { kind: 'home' } : { kind: 'all-apps' });
	};

	return (
		<div className='space-y-6 pb-8'>
			<NavBar
				leftLabel={source.name || 'Source'}
				onBack={handleBack}
				title={
					<div className='flex items-center gap-2 min-w-0'>
						<AppIcon
							app={app}
							size={28}
							className='rounded-xl'
						/>
						<span className='truncate font-semibold text-foreground'>
							{app.name || 'Untitled App'}
						</span>
					</div>
				}
				rightSlot={<FreePill className='h-8' />}
			/>

			<button
				type='button'
				onClick={() => {
					if (!pickMode) return;
					onPickSection(`app-${appIndex}`);
				}}
				className={cn(
					'w-full text-left rounded-[28px] overflow-hidden border border-border shadow-sm outline-none transition-colors',
					pickMode ?
						'cursor-crosshair hover:ring-2 hover:ring-primary/30'
					:	'cursor-default',
				)}
				style={tintGradientStyle(app.tintColor, 0.18, 0.04)}
			>
				<div className='p-5 flex items-center gap-4'>
					<AppIcon
						app={app}
						size={72}
						className='rounded-3xl'
					/>
					<div className='min-w-0 flex-1'>
						<p className='text-2xl font-semibold text-foreground truncate'>
							{app.name || 'Untitled App'}
						</p>
						<p className='text-base text-muted-foreground truncate'>
							{app.developerName || 'Unknown Developer'}
						</p>
					</div>
					<FreePill />
				</div>
			</button>

			<div className='rounded-[28px] border border-border bg-card/50 overflow-hidden shadow-sm'>
				{app.subtitle && (
					<p className='px-6 pt-6 text-base text-muted-foreground text-center'>
						{app.subtitle}
					</p>
				)}
				<div className='px-6 pt-5 pb-6'>
					<div className='flex gap-4 overflow-x-auto pb-1 snap-x snap-mandatory'>
						{screenshots.length > 0 ?
							screenshots.map((url, index) => (
								<div
									key={`detail-shot-${index}`}
									className='snap-start shrink-0 w-40 sm:w-44 rounded-[22px] overflow-hidden bg-card/40 border border-border'
								>
									<img
										src={url}
										alt=''
										aria-hidden='true'
										className='h-full w-full object-cover aspect-[9/16]'
										loading='lazy'
									/>
								</div>
							))
						:	<div className='w-full rounded-[22px] bg-card/40 border border-border aspect-[9/4] flex items-center justify-center'>
								<HugeiconsIcon
									icon={Image01Icon}
									size={18}
									className='text-muted-foreground'
								/>
							</div>
						}
					</div>

					<div className='mt-6 text-base leading-6 text-foreground'>
						<p
							className={cn(
								'whitespace-pre-wrap',
								!descriptionExpanded && 'line-clamp-6',
							)}
						>
							{app.localizedDescription ||
								'No description provided yet.'}
						</p>
						<Button
							variant='ghost'
							size='sm'
							onClick={() =>
								setDescriptionExpanded(!descriptionExpanded)
							}
							className='mt-2 px-0 h-auto text-primary hover:bg-transparent hover:underline'
						>
							{descriptionExpanded ? 'Less' : 'More'}
						</Button>
					</div>
				</div>
			</div>

			<div className='space-y-3'>
				<div className='flex items-end justify-between gap-4'>
					<h2 className='text-2xl font-semibold text-foreground'>
						What&apos;s New
					</h2>
					{latest && (
						<div className='text-right text-sm text-muted-foreground'>
							<div>{formatDate(latest.date)}</div>
							<div>{formatBytes(latest.size)}</div>
						</div>
					)}
				</div>

				{latest ?
					<div className='rounded-[28px] border border-border bg-card/50 p-6 shadow-sm'>
						<p className='text-sm text-muted-foreground'>
							Version {latest.version || '?.?.?'}
						</p>
						<p className='mt-3 text-base text-foreground whitespace-pre-wrap'>
							{latest.localizedDescription ||
								'No release notes provided yet.'}
						</p>
						{app.versions.length > 1 && (
							<p className='mt-5 text-sm tracking-wide text-muted-foreground uppercase'>
								Previous update...
							</p>
						)}
					</div>
				:	<div className='rounded-[28px] border border-border bg-card/40 p-6 text-sm text-muted-foreground'>
						Add a version to preview “What’s New”.
					</div>
				}
			</div>

			<div className='space-y-3'>
				<h2 className='text-2xl font-semibold text-foreground'>
					Permissions
				</h2>

				<div
					className='rounded-[28px] border border-border p-6 shadow-sm'
					style={tintGradientStyle(app.tintColor, 0.14, 0.04)}
				>
					<h3 className='text-xl font-semibold text-foreground'>
						Privacy
					</h3>
					<p className='mt-1 text-sm text-muted-foreground'>
						This app may request access to the following:
					</p>

					{privacyEntries.length === 0 ?
						<p className='mt-4 text-sm text-muted-foreground'>
							No privacy items added yet.
						</p>
					:	<div className='mt-4 space-y-3'>
							{privacyEntries.map(([label]) => (
								<div
									key={`privacy-${label}`}
									className='flex items-center gap-3 rounded-2xl bg-card/35 border border-border px-4 py-3'
								>
									<PrivacyIcon label={label} />
									<span className='flex-1 min-w-0 text-base text-foreground truncate'>
										{label}
									</span>
									<HugeiconsIcon
										icon={InformationCircleIcon}
										size={18}
										className='text-muted-foreground'
									/>
								</div>
							))}
						</div>
					}
				</div>

				{entitlements.length > 0 && (
					<div className='rounded-[28px] border border-border bg-card/50 p-6 shadow-sm'>
						<h3 className='text-xl font-semibold text-foreground'>
							Entitlements
						</h3>
						<div className='mt-4 space-y-4'>
							{entitlements.map((entitlement) => (
								<div
									key={entitlement}
									className='flex items-start justify-between gap-4'
								>
									<div className='min-w-0'>
										<p className='text-base text-foreground truncate'>
											{entitlement.split('.').pop() ||
												entitlement}
										</p>
										<p className='text-sm text-muted-foreground truncate'>
											{entitlement}
										</p>
									</div>
									<HugeiconsIcon
										icon={InformationCircleIcon}
										size={18}
										className='text-muted-foreground shrink-0'
									/>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export function StorePreview({
	source,
	screen,
	activeSection,
	pickMode,
	onNavigate,
	onPickSection,
}: StorePreviewProps) {
	const tint = source.tintColor || '#6366f1';
	const activeAppIndex = getActiveAppIndex(activeSection);
	const activeNewsIndex = getActiveNewsIndex(activeSection);
	const heroNews = source.news[0];

	const featuredApps = useMemo(() => {
		const featuredIds = source.featuredApps ?? [];
		if (featuredIds.length === 0) return [];
		return featuredIds
			.map((bundleId) =>
				source.apps.find(
					(app) => app.bundleIdentifier.trim() === bundleId.trim(),
				),
			)
			.filter(Boolean) as App[];
	}, [source.apps, source.featuredApps]);

	const appByBundleId = useMemo(() => {
		const map = new Map<string, App>();
		for (const app of source.apps) {
			const id = app.bundleIdentifier.trim();
			if (id) map.set(id, app);
		}
		return map;
	}, [source.apps]);

	const backgroundLayer = (
		<div className='absolute inset-0 overflow-hidden'>
			{source.headerURL ?
				<>
					<img
						src={source.headerURL}
						alt=''
						aria-hidden='true'
						className='h-full w-full object-cover scale-125 blur-3xl opacity-30'
					/>
					<div className='absolute inset-0 bg-background/80' />
				</>
			:	<>
					<div
						className='absolute inset-0 opacity-70'
						style={tintGradientStyle(tint, 0.22, 0.04)}
					/>
					<div className='absolute inset-0 bg-background/86' />
				</>
			}
		</div>
	);

	return (
		<div className={cn('relative h-full min-h-0')}>
			{backgroundLayer}
			<div className='relative h-full overflow-y-auto px-4 pb-10 pt-4'>
				{pickMode && (
					<div className='mb-4 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-xs text-primary'>
						Pick mode: tap an element to jump to its editor section.
					</div>
				)}

				{screen.kind === 'home' && (
					<div className='space-y-6 pb-8'>
						<div className='flex items-center justify-between'>
							<Button
								variant='ghost'
								size='icon-sm'
								className='rounded-full bg-card/40 border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50'
								disabled
								aria-label='Back'
							>
								<HugeiconsIcon
									icon={ArrowLeft01Icon}
									size={18}
								/>
							</Button>
							<div className='w-8' />
						</div>

						<button
							type='button'
							onClick={() => {
								if (!pickMode) return;
								onPickSection('source');
							}}
							className={cn(
								'w-full text-left rounded-[28px] overflow-hidden border border-border shadow-sm outline-none transition-colors',
								pickMode ?
									'cursor-crosshair hover:ring-2 hover:ring-primary/30'
								:	'cursor-default',
								activeSection === 'source' &&
									'ring-2 ring-primary/45',
							)}
							style={tintGradientStyle(tint, 0.12, 0.03)}
						>
							<div className='p-6 flex gap-5 items-center'>
								<SourceIcon source={source} />
								<div className='min-w-0 flex-1'>
									<p className='text-2xl font-semibold text-foreground truncate'>
										{source.name || 'Untitled Source'}
									</p>
									<p className='mt-1 text-base text-muted-foreground'>
										{source.subtitle || 'No subtitle yet.'}
									</p>

									<div className='mt-5 rounded-3xl border border-border bg-card/35 px-4 py-3 flex items-center gap-3'>
										<HugeiconsIcon
											icon={Link01Icon}
											size={18}
											className='text-muted-foreground'
										/>
										<span className='text-base text-muted-foreground truncate'>
											{source.website ||
												'https://example.com'}
										</span>
									</div>
								</div>
							</div>
						</button>

						{heroNews && (
							<div className='space-y-2'>
								<NewsHeroCard
									item={heroNews}
									pickMode={pickMode}
									selected={activeNewsIndex === 0}
									onClick={() => {
										if (pickMode) {
											onPickSection('news-0');
											return;
										}
										onNavigate({ kind: 'all-news' });
									}}
								/>
								<div className='flex justify-end'>
									<Button
										variant='ghost'
										size='sm'
										onClick={() =>
											onNavigate({ kind: 'all-news' })
										}
										className='h-auto px-0 py-1 text-sm text-primary hover:bg-transparent hover:underline'
									>
										View All
									</Button>
								</div>
							</div>
						)}

						<div className='space-y-4'>
							<SectionTitle
								title='Featured Apps'
								actionLabel='View All Apps'
								onAction={() =>
									onNavigate({ kind: 'all-apps' })
								}
							/>

							{featuredApps.length === 0 ?
								<div className='rounded-[28px] border border-dashed border-border bg-card/40 p-6 text-sm text-muted-foreground'>
									No featured apps yet.
								</div>
							:	<div className='space-y-4'>
									{featuredApps.map((app) => {
										const index = source.apps.indexOf(app);
										const selected =
											activeAppIndex === index;
										return (
											<FeaturedAppCard
												key={
													app.bundleIdentifier ||
													app.name
												}
												app={app}
												pickMode={pickMode}
												selected={selected}
												onClick={() => {
													if (pickMode) {
														onPickSection(
															`app-${index}`,
														);
														return;
													}
													onNavigate({
														kind: 'app-detail',
														appIndex: index,
														back: 'home',
													});
												}}
											/>
										);
									})}
								</div>
							}
						</div>

						<div className='space-y-3'>
							<SectionTitle title='About' />
							<p className='text-base leading-7 text-foreground whitespace-pre-wrap'>
								{source.description ||
									'Add a description to preview the About section.'}
							</p>
						</div>
					</div>
				)}

				{screen.kind === 'all-news' && (
					<div className='space-y-5 pb-8'>
						<NavBar
							leftLabel={source.name || 'Source'}
							title={
								<span className='text-base font-semibold text-foreground'>
									All News
								</span>
							}
							onBack={() => onNavigate({ kind: 'home' })}
						/>

						{source.news.length === 0 ?
							<div className='rounded-[28px] border border-dashed border-border bg-card/40 p-6 text-sm text-muted-foreground'>
								No news yet.
							</div>
						:	<div className='space-y-5'>
								{source.news.map((item, index) => {
									const selected =
										activeNewsIndex === index ||
										(activeSection === 'news' &&
											index === 0);
									const associatedApp =
										item.appID ?
											appByBundleId.get(item.appID)
										:	undefined;
									return (
										<NewsListCard
											key={`${item.identifier}-${index}`}
											item={item}
											app={associatedApp}
											pickMode={pickMode}
											selected={selected}
											onClick={() => {
												if (!pickMode) return;
												onPickSection(`news-${index}`);
											}}
										/>
									);
								})}
							</div>
						}
					</div>
				)}

				{screen.kind === 'all-apps' && (
					<div className='space-y-5 pb-8'>
						<NavBar
							leftLabel={source.name || 'Source'}
							title={
								<div className='flex items-center gap-2 min-w-0'>
									<SourceIcon
										source={source}
										size={22}
									/>
									<span className='text-base font-semibold text-foreground truncate'>
										{source.name || 'Source'}
									</span>
								</div>
							}
							onBack={() => onNavigate({ kind: 'home' })}
						/>

						{source.apps.length === 0 ?
							<div className='rounded-[28px] border border-dashed border-border bg-card/40 p-6 text-sm text-muted-foreground'>
								No apps yet.
							</div>
						:	<div className='space-y-5'>
								{source.apps.map((app, index) => (
									<AppListCard
										key={`${app.bundleIdentifier}-${index}`}
										app={app}
										screenshotUrls={toScreenshotUrls(
											app.screenshots,
										)}
										pickMode={pickMode}
										selected={activeAppIndex === index}
										onClick={() => {
											if (pickMode) {
												onPickSection(`app-${index}`);
												return;
											}
											onNavigate({
												kind: 'app-detail',
												appIndex: index,
												back: 'all-apps',
											});
										}}
									/>
								))}
							</div>
						}
					</div>
				)}

				{screen.kind === 'app-detail' &&
					(() => {
						const app = source.apps[screen.appIndex];
						if (!app) {
							return (
								<div className='rounded-[28px] border border-border bg-card/50 p-6 text-sm text-muted-foreground'>
									App not found.
								</div>
							);
						}
						return (
							<AppDetailScreen
								source={source}
								app={app}
								appIndex={screen.appIndex}
								back={screen.back}
								pickMode={pickMode}
								onNavigate={onNavigate}
								onPickSection={onPickSection}
							/>
						);
					})()}
			</div>
		</div>
	);
}
