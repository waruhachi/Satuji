import type { AltSource, App, NewsItem, SectionID } from '@lib/types';

import { SourceEditor } from '@components/editor/source';
import { AppEditor } from '@components/editor/app';
import { NewsEditor } from '@components/editor/news';
import { AppsOverview } from '@components/overview/apps';
import { NewsOverview } from '@components/overview/news';

interface BuilderContentProps {
	source: AltSource;
	activeSection: SectionID;
	onUpdateSource: (updates: Partial<AltSource>) => void;
	onUpdateApps: (apps: App[]) => void;
	onUpdateNews: (news: NewsItem[]) => void;
	onUpdateFeaturedApps: (featuredApps: string[]) => void;
	onDeleteApp: (index: number) => void;
	onDeleteNews: (index: number) => void;
	onSectionChange: (section: SectionID) => void;
}

export function BuilderContent({
	source,
	activeSection,
	onUpdateSource,
	onUpdateApps,
	onUpdateNews,
	onUpdateFeaturedApps,
	onDeleteApp,
	onDeleteNews,
	onSectionChange,
}: BuilderContentProps) {
	const updateApp = (index: number, app: App) => {
		const newApps = [...source.apps];
		newApps[index] = app;
		onUpdateApps(newApps);
	};

	const updateNewsItem = (index: number, item: NewsItem) => {
		const newNews = [...source.news];
		newNews[index] = item;
		onUpdateNews(newNews);
	};

	const duplicateApp = (index: number) => {
		const app = source.apps[index];
		const newApp = {
			...app,
			name: `${app.name} (Copy)`,
			bundleIdentifier: `${app.bundleIdentifier}.copy`,
		};
		const newApps = [...source.apps, newApp];
		onUpdateApps(newApps);
		onSectionChange(`app-${newApps.length - 1}`);
	};

	const duplicateNewsItem = (index: number) => {
		const item = source.news[index];
		const newItem = {
			...item,
			title: `${item.title} (Copy)`,
			identifier: `${item.identifier}_copy`,
		};
		const newNews = [...source.news, newItem];
		onUpdateNews(newNews);
		onSectionChange(`news-${newNews.length - 1}`);
	};

	const renderContent = () => {
		if (activeSection === 'source') {
			return (
				<SourceEditor
					source={source}
					onUpdate={onUpdateSource}
					apps={source.apps}
					featuredApps={source.featuredApps ?? []}
					onFeaturedAppsChange={onUpdateFeaturedApps}
				/>
			);
		}

		if (activeSection === 'apps') {
			return (
				<AppsOverview
					apps={source.apps}
					onSelectApp={(index) => onSectionChange(`app-${index}`)}
					onDeleteApp={onDeleteApp}
					onDuplicateApp={duplicateApp}
				/>
			);
		}

		if (activeSection === 'news') {
			return (
				<NewsOverview
					news={source.news}
					onSelectNews={(index) => onSectionChange(`news-${index}`)}
					onDeleteNews={onDeleteNews}
					onDuplicateNews={duplicateNewsItem}
				/>
			);
		}

		if (activeSection.startsWith('app-')) {
			const index = parseInt(activeSection.replace('app-', ''), 10);
			const app = source.apps[index];
			if (app) {
				return (
					<AppEditor
						app={app}
						onUpdate={(updatedApp) => updateApp(index, updatedApp)}
						onDelete={() => onDeleteApp(index)}
						onDuplicate={() => duplicateApp(index)}
					/>
				);
			}
		}

		if (activeSection.startsWith('news-')) {
			const index = parseInt(activeSection.replace('news-', ''), 10);
			const item = source.news[index];
			if (item) {
				return (
					<NewsEditor
						item={item}
						apps={source.apps}
						onUpdate={(updatedItem) =>
							updateNewsItem(index, updatedItem)
						}
						onDelete={() => onDeleteNews(index)}
						onDuplicate={() => duplicateNewsItem(index)}
					/>
				);
			}
		}

		return null;
	};

	return (
		<div className='flex-1 min-h-0 overflow-y-auto bg-background'>
			<div className='max-w-3xl mx-auto p-4 sm:p-6'>{renderContent()}</div>
		</div>
	);
}
