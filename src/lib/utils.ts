import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function normalizeHex(input: string): string | null {
	const s = input.trim();
	const match = s.match(/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
	if (!match) return null;

	let hex = match[1];
	if (hex.length === 3) {
		hex = hex
			.split('')
			.map((c) => c + c)
			.join('');
	}

	return `#${hex.toUpperCase()}`;
}
