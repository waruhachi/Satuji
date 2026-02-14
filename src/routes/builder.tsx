import type { AltSource, App, NewsItem, SectionID } from '@lib/types';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocalStorage } from '@uidotdev/usehooks';
import { createFileRoute } from '@tanstack/react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	Menu01Icon,
	CodeSimpleIcon,
	Cancel01Icon,
} from '@hugeicons/core-free-icons';

import { BuilderSidebar } from '@components/builder/sidebar';
import { BuilderContent } from '@components/builder/content';
import { BuilderPreview } from '@components/builder/preview';
import { needsNormalization, normalizeAltSource } from '@lib/normalize';
import { Button } from '@ui/button';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@ui/dialog';
import type { ExportPlatform } from '@lib/source-format';
import { toLocalISODate } from '@lib/utils';

const defaultSource: AltSource = {
	name: '',
	subtitle: '',
	description: '',
	iconURL: '',
	headerURL: '',
	website: '',
	tintColor: '#6366f1',
	featuredApps: [],
	apps: [],
	news: [],
};

const getValidationErrors = (
	source: AltSource,
	exportPlatform: ExportPlatform,
): string[] => {
	const errors: string[] = [];
	if (!source.name.trim()) errors.push('Source name is required');
	if (source.apps.length === 0) errors.push('At least one app is required');
	if (exportPlatform === 'sidestore' && !source.website?.trim()) {
		errors.push('Website URL is required for SideStore exports');
	}

	source.apps.forEach((app, index) => {
		if (!app.name.trim()) errors.push(`App ${index + 1}: Name is required`);
		if (!app.bundleIdentifier.trim()) {
			errors.push(`App ${index + 1}: Bundle identifier is required`);
		}
		if (!app.developerName.trim()) {
			errors.push(`App ${index + 1}: Developer name is required`);
		}
		if (app.versions.length === 0) {
			errors.push(`App ${index + 1}: At least one version is required`);
		}
		app.versions.forEach((version, versionIndex) => {
			if (!version.date?.trim()) {
				errors.push(
					`App ${index + 1} Version ${versionIndex + 1}: Release date is required`,
				);
			}
			if (exportPlatform === 'sidestore' && !version.version.trim()) {
				errors.push(
					`App ${index + 1} Version ${versionIndex + 1}: Version is required for SideStore exports`,
				);
			}
			if (exportPlatform === 'sidestore' && !version.downloadURL.trim()) {
				errors.push(
					`App ${index + 1} Version ${versionIndex + 1}: Download URL is required for SideStore exports`,
				);
			}
		});
	});

	source.news.forEach((item, index) => {
		if (!item.date?.trim()) {
			errors.push(`News ${index + 1}: Date is required`);
		}
	});

	return errors;
};

const hasSameErrors = (a: string[], b: string[]): boolean =>
	a.length === b.length && a.every((value, index) => value === b[index]);

export const Route = createFileRoute('/builder')({
	component: RouteComponent,
});

function RouteComponent() {
	const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
	const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
	const [source, setSource] = useLocalStorage<AltSource>(
		'altsource-builder-state',
		defaultSource,
	);
	const [activeSection, setActiveSection] = useLocalStorage<SectionID>(
		'altsource-active-section',
		'source',
	);
	const [validationErrors, setValidationErrors] = useLocalStorage<string[]>(
		'altsource-validation-errors',
		[],
	);
	const [showPreview, setShowPreview] = useLocalStorage<boolean>(
		'altsource-show-preview',
		true,
	);
	const [exportPlatform, setExportPlatform] = useLocalStorage<ExportPlatform>(
		'altsource-export-platform',
		'altstore',
	);

	useEffect(() => {
		if (!needsNormalization(source)) return;
		setSource(normalizeAltSource(source));
	}, [source, setSource]);

	const updateSourceMetadata = useCallback(
		(updates: Partial<AltSource>) => {
			setSource((prev) => ({ ...prev, ...updates }));
		},
		[setSource],
	);

	const updateApps = useCallback(
		(apps: App[]) => {
			setSource((prev) => ({ ...prev, apps }));
		},
		[setSource],
	);

	const updateNews = useCallback(
		(news: NewsItem[]) => {
			setSource((prev) => ({ ...prev, news }));
		},
		[setSource],
	);

	const updateFeaturedApps = useCallback(
		(featuredApps: string[]) => {
			setSource((prev) => ({ ...prev, featuredApps }));
		},
		[setSource],
	);

	const handleImport = useCallback(
		(importedSource: AltSource) => {
			setSource(importedSource);
			setValidationErrors([]);
			setActiveSection('source');
		},
		[setSource, setValidationErrors, setActiveSection],
	);

	const handleReset = useCallback(() => {
		setSource(defaultSource);
		setValidationErrors([]);
		setActiveSection('source');
	}, [setSource, setValidationErrors, setActiveSection]);

	const validateSource = useCallback(() => {
		const errors = getValidationErrors(source, exportPlatform);
		setValidationErrors((prev) =>
			hasSameErrors(prev, errors) ? prev : errors,
		);
		return errors.length === 0;
	}, [source, exportPlatform, setValidationErrors]);

	useEffect(() => {
		validateSource();
	}, [validateSource]);

	const addApp = useCallback(() => {
		const newApp: App = {
			name: '',
			bundleIdentifier: '',
			developerName: '',
			subtitle: '',
			localizedDescription: '',
			iconURL: '',
			tintColor: '#6366f1',
			screenshots: [],
			versions: [],
			appPermissions: { entitlements: [], privacy: {} },
		};
		const newApps = [...source.apps, newApp];
		updateApps(newApps);
		setActiveSection(`app-${newApps.length - 1}`);
	}, [source.apps, updateApps, setActiveSection]);

	const addNews = useCallback(() => {
		const newNewsItem: NewsItem = {
			title: '',
			identifier: `news_${Date.now()}`,
			caption: '',
			date: toLocalISODate(),
			tintColor: '#6366f1',
			notify: false,
		};
		const newNews = [newNewsItem, ...source.news];
		updateNews(newNews);
		setActiveSection('news-0');
	}, [source.news, updateNews, setActiveSection]);

	const deleteApp = useCallback(
		(index: number) => {
			const newApps = source.apps.filter((_, i) => i !== index);
			updateApps(newApps);
			setActiveSection('apps');
		},
		[source.apps, updateApps, setActiveSection],
	);

	const deleteNews = useCallback(
		(index: number) => {
			const newNews = source.news.filter((_, i) => i !== index);
			updateNews(newNews);
			setActiveSection('news');
		},
		[source.news, updateNews, setActiveSection],
	);

	const activeSectionLabel = useMemo(() => {
		if (activeSection === 'source') return 'Source Info';
		if (activeSection === 'apps') return 'Apps';
		if (activeSection === 'news') return 'News';

		if (activeSection.startsWith('app-')) {
			const index = Number.parseInt(activeSection.replace('app-', ''), 10);
			const appName = source.apps[index]?.name;
			return appName ? `App: ${appName}` : `App ${index + 1}`;
		}

		if (activeSection.startsWith('news-')) {
			const index = Number.parseInt(activeSection.replace('news-', ''), 10);
			const newsTitle = source.news[index]?.title;
			return newsTitle ? `News: ${newsTitle}` : `News ${index + 1}`;
		}

		return 'Editor';
	}, [activeSection, source.apps, source.news]);

	const handleMobileSectionChange = useCallback(
		(section: SectionID) => {
			setActiveSection(section);
			setMobileSidebarOpen(false);
		},
		[setActiveSection],
	);

	const handleMobileAddApp = useCallback(() => {
		addApp();
		setMobileSidebarOpen(false);
	}, [addApp]);

	const handleMobileAddNews = useCallback(() => {
		addNews();
		setMobileSidebarOpen(false);
	}, [addNews]);

	return (
		<main className='bg-background min-h-[100dvh]'>
			<div className='hidden md:flex h-screen min-h-screen overflow-hidden'>
				{/* Sidebar Navigation */}
				<BuilderSidebar
					source={source}
					activeSection={activeSection}
					onSectionChange={setActiveSection}
					onAddApp={addApp}
					onAddNews={addNews}
					onImport={handleImport}
					onReset={handleReset}
					onValidate={validateSource}
					validationErrors={validationErrors}
				/>

				{/* Main Content Area */}
				<div className='flex-1 flex min-h-0 overflow-hidden'>
					<BuilderContent
						source={source}
						activeSection={activeSection}
						onUpdateSource={updateSourceMetadata}
						onUpdateApps={updateApps}
						onUpdateNews={updateNews}
						onUpdateFeaturedApps={updateFeaturedApps}
						onDeleteApp={deleteApp}
						onDeleteNews={deleteNews}
						onSectionChange={setActiveSection}
					/>

					{/* Builder Preview Panel */}
					<BuilderPreview
						source={source}
						validationErrors={validationErrors}
						exportPlatform={exportPlatform}
						onExportPlatformChange={setExportPlatform}
						isOpen={showPreview}
						onToggle={() => setShowPreview(!showPreview)}
					/>
				</div>
			</div>

			<div className='md:hidden flex min-h-[100dvh] flex-col'>
				<header className='sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80'>
					<div className='flex items-center gap-2 px-3 py-2'>
						<Button
							variant='outline'
							size='sm'
							onClick={() => setMobileSidebarOpen(true)}
							className='gap-2 bg-transparent border-border text-muted-foreground hover:text-foreground hover:bg-muted'
						>
							<HugeiconsIcon
								icon={Menu01Icon}
								size={16}
							/>
							Sections
						</Button>

						<div className='min-w-0 flex-1 text-center'>
							<p className='text-[11px] leading-4 text-muted-foreground'>
								Editing
							</p>
							<p className='truncate text-sm font-medium text-foreground'>
								{activeSectionLabel}
							</p>
						</div>

						<Button
							variant='outline'
							size='sm'
							onClick={() => setMobilePreviewOpen(true)}
							className='gap-2 bg-transparent border-border text-muted-foreground hover:text-foreground hover:bg-muted'
						>
							<HugeiconsIcon
								icon={CodeSimpleIcon}
								size={16}
							/>
							JSON
						</Button>
					</div>
				</header>

				<div className='flex-1 min-h-0 overflow-y-auto'>
					<BuilderContent
						source={source}
						activeSection={activeSection}
						onUpdateSource={updateSourceMetadata}
						onUpdateApps={updateApps}
						onUpdateNews={updateNews}
						onUpdateFeaturedApps={updateFeaturedApps}
						onDeleteApp={deleteApp}
						onDeleteNews={deleteNews}
						onSectionChange={setActiveSection}
					/>
				</div>
			</div>

			<Dialog
				open={mobileSidebarOpen}
				onOpenChange={setMobileSidebarOpen}
			>
				<DialogContent
					showCloseButton={false}
					overlayClassName='bg-transparent supports-backdrop-filter:backdrop-blur-none duration-300 ease-out'
					className='top-0 left-0 h-[100dvh] w-screen max-w-none translate-x-0 translate-y-0 rounded-none border-0 p-0 gap-0 grid-rows-[auto_1fr] transform-gpu will-change-transform duration-300 ease-out data-open:[--tw-enter-translate-x:-100%] data-open:[--tw-enter-scale:1] data-open:[--tw-enter-opacity:1] data-closed:[--tw-exit-translate-x:-100%] data-closed:[--tw-exit-scale:1] data-closed:[--tw-exit-opacity:1]'
				>
					<DialogHeader className='px-4 py-3 border-b border-sidebar-border bg-sidebar'>
						<div className='flex items-center justify-between gap-2'>
							<DialogTitle>Sections</DialogTitle>
							<DialogClose
								render={
									<Button
										variant='ghost'
										size='icon-sm'
										className='text-muted-foreground hover:text-foreground hover:bg-muted'
									/>
								}
							>
								<HugeiconsIcon
									icon={Cancel01Icon}
									size={20}
								/>
								<span className='sr-only'>Close</span>
							</DialogClose>
						</div>
					</DialogHeader>
					<div className='min-h-0 flex-1 overflow-hidden'>
						<BuilderSidebar
							mode='mobile'
							source={source}
							activeSection={activeSection}
							onSectionChange={handleMobileSectionChange}
							onAddApp={handleMobileAddApp}
							onAddNews={handleMobileAddNews}
							onImport={handleImport}
							onReset={handleReset}
							onValidate={validateSource}
							validationErrors={validationErrors}
						/>
					</div>
				</DialogContent>
			</Dialog>

			<Dialog
				open={mobilePreviewOpen}
				onOpenChange={setMobilePreviewOpen}
			>
				<DialogContent
					showCloseButton={false}
					overlayClassName='bg-transparent supports-backdrop-filter:backdrop-blur-none duration-300 ease-out'
					className='top-0 left-0 h-[100dvh] w-screen max-w-none translate-x-0 translate-y-0 rounded-none border-0 p-0 gap-0 grid-rows-[auto_1fr] transform-gpu will-change-transform duration-300 ease-out data-open:[--tw-enter-translate-x:100%] data-open:[--tw-enter-scale:1] data-open:[--tw-enter-opacity:1] data-closed:[--tw-exit-translate-x:100%] data-closed:[--tw-exit-scale:1] data-closed:[--tw-exit-opacity:1]'
				>
					<DialogHeader className='px-4 py-3 border-b border-sidebar-border bg-sidebar'>
						<div className='flex items-center justify-between gap-2'>
							<DialogTitle>JSON Output</DialogTitle>
							<DialogClose
								render={
									<Button
										variant='ghost'
										size='icon-sm'
										className='text-muted-foreground hover:text-foreground hover:bg-muted'
									/>
								}
							>
								<HugeiconsIcon
									icon={Cancel01Icon}
									size={20}
								/>
								<span className='sr-only'>Close</span>
							</DialogClose>
						</div>
					</DialogHeader>
					<div className='min-h-0 flex-1 overflow-hidden'>
						<BuilderPreview
							mode='mobile'
							source={source}
							validationErrors={validationErrors}
							exportPlatform={exportPlatform}
							onExportPlatformChange={setExportPlatform}
							isOpen
							onToggle={() => setMobilePreviewOpen(false)}
						/>
					</div>
				</DialogContent>
			</Dialog>
		</main>
	);
}
