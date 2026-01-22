import type { App } from '@lib/types';

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

	const handleToggle = (bundleId: string, checked: boolean) => {
		if (checked) {
			onChange([...featuredApps, bundleId]);
		} else {
			onChange(featuredApps.filter((id) => id !== bundleId));
		}
	};

	return (
		<div className='space-y-2'>
			{apps.map((app) => (
				<div
					key={app.bundleIdentifier}
					className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
						featuredApps.includes(app.bundleIdentifier) ?
							'bg-primary/10 border-primary/20'
						:	'bg-card/50 border-border hover:border-border'
					}`}
				>
					<Checkbox
						id={`featured-${app.bundleIdentifier}`}
						checked={featuredApps.includes(app.bundleIdentifier)}
						onCheckedChange={(checked) =>
							handleToggle(
								app.bundleIdentifier,
								checked as boolean,
							)
						}
						className='border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary'
					/>
					<div className='flex items-center gap-3 flex-1 min-w-0'>
						{app.iconURL ?
							<img
								src={app.iconURL || '/placeholder.svg'}
								alt=''
								className='w-8 h-8 rounded-lg object-cover'
							/>
						:	<div
								className='w-8 h-8 rounded-lg flex items-center justify-center'
								style={{
									backgroundColor: app.tintColor || '#6366f1',
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
							htmlFor={`featured-${app.bundleIdentifier}`}
							className='cursor-pointer truncate text-muted-foreground'
						>
							{app.name || 'Untitled App'}
						</Label>
					</div>
					{featuredApps.includes(app.bundleIdentifier) && (
						<HugeiconsIcon
							icon={StarIcon}
							size={16}
							className='text-primary fill-primary'
						/>
					)}
				</div>
			))}
		</div>
	);
}
