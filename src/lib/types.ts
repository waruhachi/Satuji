export type SectionID =
	| 'source'
	| 'apps'
	| 'news'
	| `app-${number}`
	| `news-${number}`;

export interface Screenshot {
	imageURL: string;
	width?: number;
	height?: number;
}

export interface AppVersion {
	version: string;
	date: string;
	size: number;
	downloadURL: string;
	localizedDescription?: string;
	minOSVersion?: string;
	maxOSVersion?: string;
}

export interface AppPermissions {
	entitlements: string[];
	privacy: Record<string, string>;
}

export interface DeviceScreenshots {
	iphone?: (string | Screenshot)[];
	ipad?: (string | Screenshot)[];
}

export interface App {
	name: string;
	bundleIdentifier: string;
	developerName: string;
	subtitle?: string;
	localizedDescription?: string;
	iconURL?: string;
	tintColor?: string;
	screenshots?: (string | Screenshot)[] | DeviceScreenshots;
	versions: AppVersion[];
	appPermissions?: AppPermissions;
}

export interface NewsItem {
	title: string;
	identifier: string;
	caption: string;
	date: string;
	tintColor?: string;
	imageURL?: string;
	notify?: boolean;
	url?: string;
	appID?: string;
}

export interface AltSource {
	name: string;
	subtitle?: string;
	description?: string;
	iconURL?: string;
	headerURL?: string;
	website?: string;
	tintColor?: string;
	featuredApps?: string[];
	apps: App[];
	news: NewsItem[];
}
