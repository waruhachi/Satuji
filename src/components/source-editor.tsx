import type { AltSource, App } from '@lib/types';

import { HugeiconsIcon } from '@hugeicons/react';
import {
	Settings01Icon,
	PaintBoardIcon,
	StarIcon,
	Link01Icon,
	File01Icon,
} from '@hugeicons/core-free-icons';

import { Input } from '@ui/input';
import { Label } from '@ui/label';
import { Textarea } from '@ui/textarea';
import { ColorPicker } from '@components/color-picker';
import { ImageInput } from '@components/image-input';
import { FeaturedAppsSelector } from '@components/featured-apps-selector';

interface SourceEditorProps {
	source: AltSource;
	onUpdate: (updates: Partial<AltSource>) => void;
	apps: App[];
	featuredApps: string[];
	onFeaturedAppsChange: (featuredApps: string[]) => void;
}

export function SourceEditor({
	source,
	onUpdate,
	apps,
	featuredApps,
	onFeaturedAppsChange,
}: SourceEditorProps) {
	return (
		<div className='space-y-8'>
			{/* Header */}
			<div>
				<div className='flex items-center gap-3 mb-2'>
					<div className='w-10 h-10 rounded-xl bg-linear-to-br from-primary to-primary/80 flex items-center justify-center'>
						<HugeiconsIcon
							icon={Settings01Icon}
							size={20}
							className='text-foreground'
						/>
					</div>
					<div>
						<h1 className='text-2xl font-bold text-foreground'>
							Source Information
						</h1>
						<p className='text-muted-foreground'>
							Configure your repository metadata
						</p>
					</div>
				</div>
			</div>

			{/* Basic Information */}
			<section className='space-y-4'>
				<div className='flex items-center gap-2 text-muted-foreground'>
					<HugeiconsIcon
						icon={File01Icon}
						size={16}
					/>
					<h2 className='font-medium'>Basic Information</h2>
				</div>
				<div className='space-y-4 p-4 rounded-xl bg-card/50 border border-border'>
					<div className='space-y-2'>
						<Label
							htmlFor='name'
							className='text-muted-foreground'
						>
							Source Name{' '}
							<span className='text-destructive'>*</span>
						</Label>
						<Input
							id='name'
							placeholder='My Example Source'
							value={source.name}
							onChange={(e) => onUpdate({ name: e.target.value })}
							className='bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20'
						/>
					</div>

					<div className='space-y-2'>
						<Label
							htmlFor='subtitle'
							className='text-muted-foreground'
						>
							Subtitle
						</Label>
						<Input
							id='subtitle'
							placeholder='All my apps in one place.'
							value={source.subtitle || ''}
							onChange={(e) =>
								onUpdate({ subtitle: e.target.value })
							}
							className='bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20'
						/>
					</div>

					<div className='space-y-2'>
						<Label
							htmlFor='description'
							className='text-muted-foreground'
						>
							Description
						</Label>
						<Textarea
							id='description'
							placeholder="Welcome to my source! Here you'll find all of my apps."
							value={source.description || ''}
							onChange={(e) =>
								onUpdate({ description: e.target.value })
							}
							className='bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 min-h-25 resize-none'
						/>
					</div>

					<div className='space-y-2'>
						<Label
							htmlFor='website'
							className='text-muted-foreground flex items-center gap-2'
						>
							<HugeiconsIcon
								icon={Link01Icon}
								size={16}
							/>
							Website URL
						</Label>
						<Input
							id='website'
							type='url'
							placeholder='https://example.com'
							value={source.website || ''}
							onChange={(e) =>
								onUpdate({ website: e.target.value })
							}
							className='bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20'
						/>
					</div>
				</div>
			</section>

			{/* Branding */}
			<section className='space-y-4'>
				<div className='flex items-center gap-2 text-muted-foreground'>
					<HugeiconsIcon
						icon={PaintBoardIcon}
						size={16}
					/>
					<h2 className='font-medium'>Branding</h2>
				</div>
				<div className='space-y-4 p-4 rounded-xl bg-card/50 border border-border'>
					<ColorPicker
						label='Tint Color'
						value={source.tintColor || '#6366f1'}
						onChange={(color) => onUpdate({ tintColor: color })}
					/>

					<ImageInput
						label='Icon URL'
						value={source.iconURL || ''}
						onChange={(url) => onUpdate({ iconURL: url })}
						placeholder='https://example.com/icon.png'
					/>

					<ImageInput
						label='Header URL'
						value={source.headerURL || ''}
						onChange={(url) => onUpdate({ headerURL: url })}
						placeholder='https://example.com/header.png'
					/>
				</div>
			</section>

			{/* Featured Apps */}
			<section className='space-y-4'>
				<div className='flex items-center gap-2 text-muted-foreground'>
					<HugeiconsIcon
						icon={StarIcon}
						size={16}
					/>
					<h2 className='font-medium'>Featured Apps</h2>
				</div>
				<div className='p-4 rounded-xl bg-card/50 border border-border'>
					<FeaturedAppsSelector
						apps={apps}
						featuredApps={featuredApps}
						onChange={onFeaturedAppsChange}
					/>
				</div>
			</section>
		</div>
	);
}
