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

export function toLocalISODate(date: Date = new Date()): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}
