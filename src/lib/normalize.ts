import type {
	AltSource,
	App,
	AppPermissions,
	AppVersion,
	DeviceScreenshots,
	NewsItem,
	Screenshot,
} from '@/lib/types';
import { createId } from '@/lib/ids';

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null;

const toString = (value: unknown): string =>
	typeof value === 'string' ? value : '';

const toOptionalString = (value: unknown): string | undefined =>
	typeof value === 'string' ? value : undefined;

const toNumber = (value: unknown): number => {
	if (typeof value === 'number' && Number.isFinite(value)) return value;
	if (typeof value === 'string') {
		const trimmed = value.trim();
		if (!trimmed) return 0;
		const parsed = Number(trimmed);
		return Number.isFinite(parsed) ? parsed : 0;
	}
	return 0;
};

const toOptionalNumber = (value: unknown): number | undefined => {
	if (typeof value === 'number' && Number.isFinite(value)) return value;
	if (typeof value === 'string') {
		const trimmed = value.trim();
		if (!trimmed) return undefined;
		const parsed = Number(trimmed);
		return Number.isFinite(parsed) ? parsed : undefined;
	}
	return undefined;
};

const getOrCreateId = (value: unknown): string => {
	if (isRecord(value)) {
		const existing = value.__id;
		if (typeof existing === 'string' && existing.trim()) {
			return existing;
		}
	}
	return createId();
};

const normalizeScreenshot = (value: unknown): Screenshot => {
	if (typeof value === 'string') {
		return { __id: createId(), imageURL: value };
	}

	const record = isRecord(value) ? value : {};
	return {
		__id: getOrCreateId(record),
		imageURL: toString(record.imageURL),
		width: toOptionalNumber(record.width),
		height: toOptionalNumber(record.height),
	};
};

const normalizeScreenshots = (
	value: unknown,
): (string | Screenshot)[] | undefined => {
	if (Array.isArray(value)) {
		return value.map(normalizeScreenshot);
	}

	if (isRecord(value)) {
		const deviceScreenshots = value as DeviceScreenshots;
		const flattened: unknown[] = [];
		if (Array.isArray(deviceScreenshots.iphone)) {
			flattened.push(...deviceScreenshots.iphone);
		}
		if (Array.isArray(deviceScreenshots.ipad)) {
			flattened.push(...deviceScreenshots.ipad);
		}
		if (flattened.length > 0) {
			return flattened.map(normalizeScreenshot);
		}
	}

	return undefined;
};

const normalizeVersion = (value: unknown): AppVersion => {
	const record = isRecord(value) ? value : {};
	return {
		__id: getOrCreateId(record),
		version: toString(record.version),
		date: toString(record.date),
		size: toNumber(record.size),
		downloadURL: toString(record.downloadURL),
		localizedDescription: toOptionalString(record.localizedDescription),
		minOSVersion: toOptionalString(record.minOSVersion),
		maxOSVersion: toOptionalString(record.maxOSVersion),
	};
};

const normalizePermissions = (value: unknown): AppPermissions => {
	const record = isRecord(value) ? value : {};
	const entitlements =
		Array.isArray(record.entitlements) ?
			record.entitlements.filter(
				(entry): entry is string => typeof entry === 'string',
			)
		:	[];
	const privacy =
		isRecord(record.privacy) ?
			Object.fromEntries(
				Object.entries(record.privacy).filter(
					([, entry]) => typeof entry === 'string',
				),
			)
		:	{};

	return {
		entitlements,
		privacy,
	};
};

const normalizeApp = (value: unknown): App => {
	const record = isRecord(value) ? value : {};
	const versions =
		Array.isArray(record.versions) ?
			record.versions.map(normalizeVersion)
		:	[];
	const screenshots = normalizeScreenshots(record.screenshots);

	return {
		name: toString(record.name),
		bundleIdentifier: toString(record.bundleIdentifier),
		developerName: toString(record.developerName),
		subtitle: toOptionalString(record.subtitle),
		localizedDescription: toOptionalString(record.localizedDescription),
		iconURL: toOptionalString(record.iconURL),
		tintColor: toOptionalString(record.tintColor),
		screenshots,
		versions,
		appPermissions: normalizePermissions(record.appPermissions),
	};
};

const normalizeNewsItem = (value: unknown): NewsItem => {
	const record = isRecord(value) ? value : {};
	return {
		title: toString(record.title),
		identifier: toString(record.identifier),
		caption: toString(record.caption),
		date: toString(record.date),
		tintColor: toOptionalString(record.tintColor),
		imageURL: toOptionalString(record.imageURL),
		notify: typeof record.notify === 'boolean' ? record.notify : undefined,
		url: toOptionalString(record.url),
		appID: toOptionalString(record.appID),
	};
};

export const normalizeAltSource = (value: unknown): AltSource => {
	if (!isRecord(value)) {
		throw new Error('Invalid JSON structure');
	}

	return {
		name: toString(value.name),
		subtitle: toOptionalString(value.subtitle),
		description: toOptionalString(value.description),
		iconURL: toOptionalString(value.iconURL),
		headerURL: toOptionalString(value.headerURL),
		website: toOptionalString(value.website),
		tintColor: toOptionalString(value.tintColor),
		featuredApps:
			Array.isArray(value.featuredApps) ?
				value.featuredApps.filter(
					(entry): entry is string => typeof entry === 'string',
				)
			:	undefined,
		apps: Array.isArray(value.apps) ? value.apps.map(normalizeApp) : [],
		news:
			Array.isArray(value.news) ? value.news.map(normalizeNewsItem) : [],
	};
};

export const needsNormalization = (value: AltSource): boolean => {
	for (const app of value.apps) {
		const screenshots = app.screenshots;
		if (screenshots && !Array.isArray(screenshots)) {
			const deviceScreenshots = screenshots as DeviceScreenshots;
			if (
				Array.isArray(deviceScreenshots.iphone) ||
				Array.isArray(deviceScreenshots.ipad)
			) {
				return true;
			}
		}

		if (Array.isArray(screenshots)) {
			for (const screenshot of screenshots) {
				if (typeof screenshot === 'string') return true;
				if (!screenshot.__id) return true;
			}
		}

		for (const version of app.versions) {
			if (!version.__id) return true;
		}
	}

	return false;
};
