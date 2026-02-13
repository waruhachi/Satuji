import type { App } from '@lib/types';

import { useEffect, useMemo } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { StarIcon, PackageIcon } from '@hugeicons/core-free-icons';

import { Checkbox } from '@ui/checkbox';
import { Label } from '@ui/label';

interface FeaturedAppsSelectorProps {
	apps: App[];
	featuredApps: string[];
	onChange: (featuredApps: string[]) => void;
}

export function FeaturedAppsSelector({
	apps,
	featuredApps,
	onChange,
}: FeaturedAppsSelectorProps) {
	const normalizedApps = useMemo(
		() =>
			apps.map((app) => ({
				app,
				bundleIdentifier: app.bundleIdentifier.trim(),
			})),
		[apps],
	);

	const bundleIdCounts = useMemo(() => {
		const counts = new Map<string, number>();
		for (const { bundleIdentifier } of normalizedApps) {
			if (!bundleIdentifier) continue;
			counts.set(
				bundleIdentifier,
				(counts.get(bundleIdentifier) ?? 0) + 1,
			);
		}
		return counts;
	}, [normalizedApps]);

	const selectableApps = useMemo(
		() =>
			normalizedApps.filter(
				({ bundleIdentifier }) =>
					bundleIdentifier &&
					(bundleIdCounts.get(bundleIdentifier) ?? 0) === 1,
			),
		[normalizedApps, bundleIdCounts],
	);

	const selectableBundleIds = useMemo(
		() =>
			new Set(
				selectableApps.map(({ bundleIdentifier }) => bundleIdentifier),
			),
		[selectableApps],
	);

	const activeFeaturedApps = useMemo(
		() => featuredApps.filter((id) => selectableBundleIds.has(id)),
		[featuredApps, selectableBundleIds],
	);

	useEffect(() => {
		const deduped = Array.from(new Set(activeFeaturedApps));
		const isSame =
			deduped.length === featuredApps.length &&
			deduped.every((id, index) => id === featuredApps[index]);
		if (!isSame) {
			onChange(deduped);
		}
	}, [activeFeaturedApps, featuredApps, onChange]);

	if (apps.length === 0) {
		return (
			<div className='flex flex-col items-center justify-center py-8 text-center'>
				<div className='w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3'>
					<HugeiconsIcon
						icon={StarIcon}
						size={24}
						className='text-muted-foreground'
					/>
				</div>
				<p className='text-muted-foreground text-sm'>
					No apps added yet
				</p>
				<p className='text-muted-foreground text-xs'>
					Add apps using the sidebar to feature them here
				</p>
			</div>
		);
	}

	if (selectableApps.length === 0) {
		return (
			<div className='flex flex-col items-center justify-center py-8 text-center'>
				<div className='w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3'>
					<HugeiconsIcon
						icon={StarIcon}
						size={24}
						className='text-muted-foreground'
					/>
				</div>
				<p className='text-muted-foreground text-sm'>
					No feature-ready apps yet
				</p>
				<p className='text-muted-foreground text-xs'>
					Only apps with unique bundle IDs can be featured
				</p>
			</div>
		);
	}

	const handleToggle = (bundleId: string, checked: boolean) => {
		if (checked) {
			if (activeFeaturedApps.includes(bundleId)) return;
			onChange([...activeFeaturedApps, bundleId]);
		} else {
			onChange(activeFeaturedApps.filter((id) => id !== bundleId));
		}
	};

	return (
		<div className='space-y-2'>
			{apps.length !== selectableApps.length && (
				<p className='text-xs text-muted-foreground'>
					Apps without a unique bundle ID are hidden from this list.
				</p>
			)}
			{selectableApps.map(({ app, bundleIdentifier }) => {
				const itemId = `featured-app-${bundleIdentifier}`;
				const isFeatured =
					activeFeaturedApps.includes(bundleIdentifier);

				return (
					<div
						key={itemId}
						className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
							isFeatured ?
								'bg-primary/10 border-primary/20'
							:	'bg-card/50 border-border hover:border-border'
						}`}
					>
						<Checkbox
							id={itemId}
							checked={isFeatured}
							onCheckedChange={(checked) =>
								handleToggle(
									bundleIdentifier,
									checked as boolean,
								)
							}
							className='border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary'
						/>
						<div className='flex items-center gap-3 flex-1 min-w-0'>
							{app.iconURL ?
								<img
									src={app.iconURL}
									alt={
										app.name ?
											`${app.name} icon`
										:	'App icon'
									}
									className='w-8 h-8 rounded-lg object-cover'
								/>
							:	<div
									className='w-8 h-8 rounded-lg flex items-center justify-center'
									style={{
										backgroundColor:
											app.tintColor || '#6366f1',
									}}
								>
									<HugeiconsIcon
										icon={PackageIcon}
										size={16}
										className='text-foreground'
									/>
								</div>
							}
							<Label
								htmlFor={itemId}
								className='cursor-pointer truncate text-muted-foreground'
							>
								{app.name || 'Untitled App'}
							</Label>
						</div>
						{isFeatured && (
							<HugeiconsIcon
								icon={StarIcon}
								size={16}
								className='text-primary fill-primary'
							/>
						)}
					</div>
				);
			})}
		</div>
	);
}
