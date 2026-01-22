import type { AltSource, App, NewsItem, SectionID } from '@lib/types';

import { useCallback } from 'react';
import { useLocalStorage } from '@uidotdev/usehooks';
import { createFileRoute } from '@tanstack/react-router';

import { BuilderSidebar } from '@components/builder-sidebar';
import { BuilderContent } from '@components/builder-content';
import { BuilderPreview } from '@components/builder-preview';

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
		const errors: string[] = [];
		if (!source.name.trim()) errors.push('Source name is required');
		if (source.apps.length === 0)
			errors.push('At least one app is required');
		source.apps.forEach((app, index) => {
			if (!app.name.trim())
				errors.push(`App ${index + 1}: Name is required`);
			if (!app.bundleIdentifier.trim())
				errors.push(`App ${index + 1}: Bundle identifier is required`);
			if (!app.developerName.trim())
				errors.push(`App ${index + 1}: Developer name is required`);
			if (app.versions.length === 0)
				errors.push(
					`App ${index + 1}: At least one version is required`,
				);
		});
		setValidationErrors(errors);
		return errors.length === 0;
	}, [source, setValidationErrors]);

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
			date: new Date().toISOString().split('T')[0],
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
		<main className='bg-background'>
			<div className='flex max-h-screen'>
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
				<div className='flex-1 flex overflow-hidden'>
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
						isOpen={showPreview}
						onToggle={() => setShowPreview(!showPreview)}
					/>
				</div>
			</div>
		</main>
	);
}
