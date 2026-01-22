import type React from 'react';
import type { AltSource, SectionID } from '@lib/types';

import { useRef, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	Settings01Icon,
	PackageIcon,
	NewsIcon,
	PlusSignIcon,
	ArrowRight01Icon,
	Upload01Icon,
	Rotate01Icon,
	CheckmarkCircle03Icon,
	AlertCircleIcon,
} from '@hugeicons/core-free-icons';

import { Button } from '@ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@ui/dialog';
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@ui/collapsible';

interface BuilderSidebarProps {
	source: AltSource;
	activeSection: SectionID;
	onSectionChange: (section: SectionID) => void;
	onAddApp: () => void;
	onAddNews: () => void;
	onImport: (source: AltSource) => void;
	onReset: () => void;
	onValidate: () => boolean;
	validationErrors: string[];
}

export function BuilderSidebar({
	source,
	activeSection,
	onSectionChange,
	onAddApp,
	onAddNews,
	onImport,
	onReset,
	onValidate,
	validationErrors,
}: BuilderSidebarProps) {
	const [appsExpanded, setAppsExpanded] = useState(true);
	const [newsExpanded, setNewsExpanded] = useState(true);
	const [resetDialogOpen, setResetDialogOpen] = useState(false);
	const [importError, setImportError] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (event) => {
			try {
				const content = event.target?.result as string;
				const parsed = JSON.parse(content) as AltSource;
				if (!parsed.apps) parsed.apps = [];
				if (!parsed.news) parsed.news = [];
				onImport(parsed);
				setImportError(null);
			} catch {
				setImportError('Invalid JSON file');
			}
		};
		reader.readAsText(file);
		e.target.value = '';
	};

	const handleReset = () => {
		onReset();
		setResetDialogOpen(false);
	};

	const hasContent =
		source.name || source.apps.length > 0 || source.news.length > 0;

	// Calculate completion percentage
	const getCompletionStatus = () => {
		const total = 3; // source name, at least 1 app, at least 1 version
		let completed = 0;
		if (source.name.trim()) completed++;
		if (source.apps.length > 0) completed++;
		if (source.apps.some((app) => app.versions.length > 0)) completed++;
		return Math.round((completed / total) * 100);
	};

	const completion = getCompletionStatus();

	return (
		<aside className='w-72 border-r border-sidebar-border bg-sidebar flex flex-col shrink-0'>
			{/* Header */}
			<div className='p-4 border-b border-border'>
				{/* Progress Indicator */}
				<div className='space-y-2'>
					<div className='flex items-center justify-between text-xs'>
						<span className='text-muted-foreground'>
							Completion
						</span>
						<span
							className={
								completion === 100 ? 'text-primary' : (
									'text-muted-foreground'
								)
							}
						>
							{completion}%
						</span>
					</div>
					<div className='h-1.5 bg-muted rounded-full overflow-hidden'>
						<div
							className={`h-full rounded-full transition-all duration-500 ${
								completion === 100 ? 'bg-primary' : 'bg-primary'
							}`}
							style={{ width: `${completion}%` }}
						/>
					</div>
				</div>
			</div>

			{/* Navigation */}
			<nav className='flex-1 overflow-y-auto p-3 space-y-1'>
				{/* Source Info */}
				<button
					onClick={() => onSectionChange('source')}
					className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
						activeSection === 'source' ?
							'bg-primary/10 text-primary border border-primary/20'
						:	'text-muted-foreground hover:text-foreground hover:bg-accent/50'
					}`}
				>
					<HugeiconsIcon
						icon={Settings01Icon}
						size={16}
					/>
					<span className='flex-1 text-left'>Source Info</span>
					{source.name && (
						<span className='w-2 h-2 rounded-full bg-primary' />
					)}
				</button>

				{/* Apps Section */}
				<Collapsible
					open={appsExpanded}
					onOpenChange={setAppsExpanded}
				>
					<div className='space-y-1'>
						<div className='flex items-center gap-1'>
							<CollapsibleTrigger
								render={
									<button
										className={`flex-1 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
											(
												activeSection === 'apps' ||
												activeSection.startsWith('app-')
											) ?
												'bg-primary/10 text-primary border border-primary/20'
											:	'text-muted-foreground hover:text-foreground hover:bg-accent/50'
										}`}
									>
										<HugeiconsIcon
											icon={PackageIcon}
											size={16}
										/>
										<span className='flex-1 text-left'>
											Apps
										</span>
										<span className='px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs'>
											{source.apps.length}
										</span>
										<HugeiconsIcon
											icon={ArrowRight01Icon}
											size={16}
											className={`text-muted-foreground transition-transform ${appsExpanded ? 'rotate-90' : ''}`}
										/>
									</button>
								}
							></CollapsibleTrigger>
							<button
								onClick={(e) => {
									e.stopPropagation();
									onAddApp();
								}}
								className='p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors'
								title='Add new app'
							>
								<HugeiconsIcon
									icon={PlusSignIcon}
									size={16}
								/>
							</button>
						</div>

						<CollapsibleContent className='space-y-1 ml-4 pl-3 border-l border-border'>
							{source.apps.length === 0 ?
								<p className='text-xs text-muted-foreground py-2 px-3'>
									No apps yet
								</p>
							:	source.apps.map((app, index) => (
									<button
										key={`app-${index}`}
										onClick={() =>
											onSectionChange(`app-${index}`)
										}
										className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
											activeSection === `app-${index}` ?
												'bg-accent/50 text-foreground'
											:	'text-muted-foreground hover:text-foreground hover:bg-accent/25'
										}`}
									>
										{app.iconURL ?
											<img
												src={
													app.iconURL ||
													'/placeholder.svg'
												}
												alt=''
												className='w-5 h-5 rounded-md object-cover'
											/>
										:	<div
												className='w-5 h-5 rounded-md flex items-center justify-center'
												style={{
													backgroundColor:
														app.tintColor ||
														'#6366f1',
												}}
											>
												<HugeiconsIcon
													icon={PackageIcon}
													size={16}
													className='text-foreground'
												/>
											</div>
										}
										<span className='flex-1 text-left truncate'>
											{app.name || 'Untitled App'}
										</span>
										{app.versions.length > 0 && (
											<span className='text-xs text-muted-foreground'>
												v{app.versions[0].version}
											</span>
										)}
									</button>
								))
							}
						</CollapsibleContent>
					</div>
				</Collapsible>

				{/* News Section */}
				<Collapsible
					open={newsExpanded}
					onOpenChange={setNewsExpanded}
				>
					<div className='space-y-1'>
						<div className='flex items-center gap-1'>
							<CollapsibleTrigger
								render={
									<button
										className={`flex-1 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
											(
												activeSection === 'news' ||
												activeSection.startsWith(
													'news-',
												)
											) ?
												'bg-primary/10 text-primary border border-primary/20'
											:	'text-muted-foreground hover:text-foreground hover:bg-accent/50'
										}`}
									>
										<HugeiconsIcon
											icon={NewsIcon}
											size={16}
										/>
										<span className='flex-1 text-left'>
											News
										</span>
										<span className='px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs'>
											{source.news.length}
										</span>
										<HugeiconsIcon
											icon={ArrowRight01Icon}
											size={16}
											className={`text-muted-foreground transition-transform ${newsExpanded ? 'rotate-90' : ''}`}
										/>
									</button>
								}
							></CollapsibleTrigger>
							<button
								onClick={(e) => {
									e.stopPropagation();
									onAddNews();
								}}
								className='p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors'
								title='Add news item'
							>
								<HugeiconsIcon
									icon={PlusSignIcon}
									size={16}
								/>
							</button>
						</div>

						<CollapsibleContent className='space-y-1 ml-4 pl-3 border-l border-border'>
							{source.news.length === 0 ?
								<p className='text-xs text-muted-foreground py-2 px-3'>
									No news yet
								</p>
							:	source.news.map((item, index) => (
									<button
										key={`news-${index}`}
										onClick={() =>
											onSectionChange(`news-${index}`)
										}
										className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
											activeSection === `news-${index}` ?
												'bg-accent/50 text-foreground'
											:	'text-muted-foreground hover:text-foreground hover:bg-accent/25'
										}`}
									>
										<div
											className='w-2 h-2 rounded-full shrink-0'
											style={{
												backgroundColor:
													item.tintColor || '#6366f1',
											}}
										/>
										<span className='flex-1 text-left truncate'>
											{item.title || 'Untitled'}
										</span>
									</button>
								))
							}
						</CollapsibleContent>
					</div>
				</Collapsible>
			</nav>

			{/* Footer Actions */}
			<div className='p-3 border-t border-border space-y-2'>
				<input
					ref={fileInputRef}
					type='file'
					accept='.json,application/json'
					onChange={handleFileSelect}
					className='hidden'
				/>

				<div className='flex gap-2'>
					<Button
						variant='outline'
						size='sm'
						onClick={() => fileInputRef.current?.click()}
						className='flex-1 gap-2 bg-transparent border-border text-muted-foreground hover:text-foreground hover:bg-muted'
					>
						<HugeiconsIcon
							icon={Upload01Icon}
							size={16}
						/>
						Import
					</Button>
					<Button
						variant='outline'
						size='sm'
						onClick={() => setResetDialogOpen(true)}
						disabled={!hasContent}
						className='gap-2 bg-transparent border-border text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50'
					>
						<HugeiconsIcon
							icon={Rotate01Icon}
							size={16}
						/>
					</Button>
				</div>

				<Button
					variant='outline'
					size='sm'
					onClick={onValidate}
					className={`w-full gap-2 ${
						validationErrors.length === 0 ?
							'bg-primary/10 border-primary/20 text-primary hover:bg-primary/20'
						:	'bg-destructive/10 border-destructive/20 text-destructive hover:bg-destructive/20'
					}`}
				>
					{validationErrors.length === 0 ?
						<>
							<HugeiconsIcon
								icon={CheckmarkCircle03Icon}
								size={16}
							/>
							Valid Configuration
						</>
					:	<>
							<HugeiconsIcon
								icon={AlertCircleIcon}
								size={16}
							/>
							{validationErrors.length} Issue
							{validationErrors.length !== 1 ? 's' : ''}
						</>
					}
				</Button>

				{importError && (
					<p className='text-xs text-destructive flex items-center gap-1'>
						<HugeiconsIcon
							icon={AlertCircleIcon}
							size={12}
						/>
						{importError}
					</p>
				)}
			</div>

			{/* Reset Dialog */}
			<Dialog
				open={resetDialogOpen}
				onOpenChange={setResetDialogOpen}
			>
				<DialogContent className='bg-card border-border'>
					<DialogHeader>
						<DialogTitle className='text-foreground'>
							Reset Configuration?
						</DialogTitle>
						<DialogDescription className='text-muted-foreground'>
							This will clear all your current configuration. This
							action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant='outline'
							onClick={() => setResetDialogOpen(false)}
							className='bg-transparent border-border'
						>
							Cancel
						</Button>
						<Button
							variant='destructive'
							onClick={handleReset}
						>
							Reset Everything
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</aside>
	);
}
