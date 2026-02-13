import type {
	AltSource,
	App,
	AppVersion,
	DeviceScreenshots,
	NewsItem,
	Screenshot,
} from '@lib/types';

export type ExportPlatform = 'altstore' | 'sidestore';

export interface SideStoreVersion {
	version: string;
	date: string;
	downloadURL: string;
	localizedDescription?: string;
	size: number;
	absoluteVersion?: string;
}

export interface SideStoreApp {
	name: string;
	bundleIdentifier: string;
	developerName: string;
	subtitle?: string;
	version: string;
	versionDate: string;
	versionDescription?: string;
	downloadURL: string;
	localizedDescription?: string;
	iconURL?: string;
	tintColor?: string;
	size: number;
	screenshotURLs?: string[];
	absoluteVersion?: string;
	appID?: string;
	versions?: SideStoreVersion[];
}

export interface SideStoreNews {
	title: string;
	identifier: string;
	caption: string;
	tintColor?: string;
	imageURL?: string;
	appID?: string;
	date: string;
	notify?: boolean;
}

export interface SideStoreSource {
	name: string;
	identifier: string;
	sourceURL: string;
	iconURL?: string;
	userinfo: Record<string, unknown>;
	apps: SideStoreApp[];
	news: SideStoreNews[];
	version: number;
	apiVersion: string;
}

const normalizeUrl = (value?: string): string | undefined => {
	if (!value) return undefined;
	const trimmed = value.trim();
	if (!trimmed) return undefined;
	try {
		return new URL(trimmed).toString();
	} catch {
		try {
			return new URL(`https://${trimmed}`).toString();
		} catch {
			return trimmed;
		}
	}
};

const deriveIdentifier = (source: AltSource): string => {
	const website = normalizeUrl(source.website);
	if (website) {
		try {
			const host = new URL(website).hostname;
			if (host) {
				const parts = host.split('.').filter(Boolean);
				if (parts.length > 0) return parts.reverse().join('.');
			}
		} catch {
			// fall through to name-derived identifier
		}
	}

	const slug = source.name
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '.')
		.replace(/^\.+|\.+$/g, '');
	if (slug) return `com.example.${slug}`;
	return 'com.example.source';
};

const nonEmptyString = (value: string | undefined): value is string =>
	typeof value === 'string' && value.trim().length > 0;

const toScreenshotUrls = (
	screenshots?: (string | Screenshot)[] | DeviceScreenshots,
): string[] => {
	if (!screenshots) return [];
	if (Array.isArray(screenshots)) {
		return screenshots
			.map((screenshot) =>
				typeof screenshot === 'string' ? screenshot : (
					screenshot.imageURL
				),
			)
			.filter(nonEmptyString);
	}
	const deviceScreenshots = screenshots as DeviceScreenshots;
	return [
		...(deviceScreenshots.iphone ?? []),
		...(deviceScreenshots.ipad ?? []),
	]
		.map((screenshot) =>
			typeof screenshot === 'string' ? screenshot : screenshot.imageURL,
		)
		.filter(nonEmptyString);
};

const toSideStoreVersion = (version: AppVersion): SideStoreVersion => ({
	version: version.version,
	date: version.date,
	downloadURL: version.downloadURL,
	localizedDescription: version.localizedDescription,
	size: version.size,
	absoluteVersion: version.version || undefined,
});

const toSideStoreApp = (app: App): SideStoreApp => {
	const latestVersion = app.versions[0];
	const version = latestVersion?.version ?? '';
	const versionDate = latestVersion?.date ?? '';
	const downloadURL = latestVersion?.downloadURL ?? '';
	const versionDescription = latestVersion?.localizedDescription;
	const size = latestVersion?.size ?? 0;
	const screenshotURLs = toScreenshotUrls(app.screenshots);

	return {
		name: app.name,
		bundleIdentifier: app.bundleIdentifier,
		developerName: app.developerName,
		subtitle: app.subtitle,
		version,
		versionDate,
		versionDescription,
		downloadURL,
		localizedDescription: app.localizedDescription,
		iconURL: app.iconURL,
		tintColor: app.tintColor,
		size,
		screenshotURLs,
		absoluteVersion: version || undefined,
		appID: app.bundleIdentifier || undefined,
		versions: app.versions.map(toSideStoreVersion),
	};
};

const toSideStoreNews = (item: NewsItem): SideStoreNews => ({
	title: item.title,
	identifier: item.identifier,
	caption: item.caption,
	tintColor: item.tintColor,
	imageURL: item.imageURL,
	appID: item.appID,
	date: item.date,
	notify: item.notify,
});

export const toAltStoreSource = (source: AltSource): AltSource => ({
	name: source.name,
	subtitle: source.subtitle,
	description: source.description,
	iconURL: source.iconURL,
	headerURL: source.headerURL,
	website: source.website,
	tintColor: source.tintColor,
	featuredApps: source.featuredApps,
	apps: source.apps,
	news: source.news,
});

export const toSideStoreSource = (source: AltSource): SideStoreSource => ({
	name: source.name,
	identifier: deriveIdentifier(source),
	sourceURL: normalizeUrl(source.website) ?? '',
	iconURL: source.iconURL,
	userinfo: {},
	apps: source.apps.map(toSideStoreApp),
	news: source.news.map(toSideStoreNews),
	version: 1,
	apiVersion: 'v1',
});

export const buildExportSource = (
	source: AltSource,
	platform: ExportPlatform,
): AltSource | SideStoreSource =>
	platform === 'sidestore' ?
		toSideStoreSource(source)
	:	toAltStoreSource(source);

export const exportPlatformLabel = (platform: ExportPlatform): string =>
	platform === 'sidestore' ? 'SideStore' : 'AltStore';

export const exportPlatformIcon = (platform: ExportPlatform): string =>
	platform === 'sidestore' ? '/SideStore.png' : '/AltStore.png';
