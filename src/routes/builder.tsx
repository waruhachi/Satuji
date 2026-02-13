import type { AltSource, App, NewsItem, SectionID } from '@lib/types';

import { useCallback, useEffect } from 'react';
import { useLocalStorage } from '@uidotdev/usehooks';
import { createFileRoute } from '@tanstack/react-router';

import { BuilderSidebar } from '@components/builder/sidebar';
import { BuilderContent } from '@components/builder/content';
import { BuilderPreview } from '@components/builder/preview';
import { needsNormalization, normalizeAltSource } from '@lib/normalize';
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

	return (
		<main className='bg-background min-h-screen'>
			<div className='flex h-screen min-h-screen overflow-hidden'>
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
		</main>
	);
}
