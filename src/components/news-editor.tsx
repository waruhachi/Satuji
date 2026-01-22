import type { NewsItem, App } from '@lib/types';

import { HugeiconsIcon } from '@hugeicons/react';
import {
	NewsIcon,
	Delete02Icon,
	Copy01Icon,
	Notification01Icon,
	Link01Icon,
	PackageIcon,
} from '@hugeicons/core-free-icons';

import { Button } from '@ui/button';
import { Input } from '@ui/input';
import { Label } from '@ui/label';
import { Textarea } from '@ui/textarea';
import { Switch } from '@ui/switch';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@ui/select';
import { ColorPicker } from '@components/color-picker';
import { ImageInput } from '@components/image-input';

interface NewsEditorProps {
	item: NewsItem;
	apps: App[];
	onUpdate: (item: NewsItem) => void;
	onDelete: () => void;
	onDuplicate: () => void;
}

export function NewsEditor({
	item,
	apps,
	onUpdate,
	onDelete,
	onDuplicate,
}: NewsEditorProps) {
	const updateField = <K extends keyof NewsItem>(
		field: K,
		value: NewsItem[K],
	) => {
		onUpdate({ ...item, [field]: value });
	};

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex items-start justify-between'>
				<div className='flex items-center gap-4'>
					<div
						className='w-16 h-16 rounded-2xl flex items-center justify-center'
						style={{ backgroundColor: item.tintColor || '#6366f1' }}
					>
						<HugeiconsIcon
							icon={NewsIcon}
							size={32}
							className='text-foreground'
						/>
					</div>
					<div>
						<h1 className='text-2xl font-bold text-foreground'>
							{item.title || 'Untitled News'}
						</h1>
						<p className='text-muted-foreground text-sm'>
							{item.date}
						</p>
					</div>
				</div>
				<div className='flex items-center gap-2'>
					<Button
						variant='outline'
						size='sm'
						onClick={onDuplicate}
						className='gap-2 bg-transparent border-border text-muted-foreground hover:text-foreground hover:bg-muted'
					>
						<HugeiconsIcon
							icon={Copy01Icon}
							size={16}
						/>
						Duplicate
					</Button>
					<Button
						variant='outline'
						size='sm'
						onClick={onDelete}
						className='gap-2 bg-transparent border-destructive/50 text-destructive hover:bg-destructive/10 hover:border-destructive/50'
					>
						<HugeiconsIcon
							icon={Delete02Icon}
							size={16}
						/>
						Delete
					</Button>
				</div>
			</div>

			{/* Content */}
			<div className='space-y-4 p-4 rounded-xl bg-card/50 border border-border'>
				<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
					<div className='space-y-2'>
						<Label className='text-muted-foreground'>
							Title <span className='text-destructive'>*</span>
						</Label>
						<Input
							value={item.title}
							onChange={(e) =>
								updateField('title', e.target.value)
							}
							placeholder='New Feature Announcement'
							className='bg-card border-border text-foreground placeholder:text-muted-foreground'
						/>
					</div>
					<div className='space-y-2'>
						<Label className='text-muted-foreground'>
							Identifier{' '}
							<span className='text-destructive'>*</span>
						</Label>
						<Input
							value={item.identifier}
							onChange={(e) =>
								updateField('identifier', e.target.value)
							}
							placeholder='new_feature'
							className='bg-card border-border text-foreground placeholder:text-muted-foreground font-mono text-sm'
						/>
					</div>
				</div>

				<div className='space-y-2'>
					<Label className='text-muted-foreground'>
						Caption <span className='text-destructive'>*</span>
					</Label>
					<Textarea
						value={item.caption}
						onChange={(e) => updateField('caption', e.target.value)}
						placeholder='A brief description of this news item...'
						className='bg-card border-border text-foreground placeholder:text-muted-foreground min-h-25 resize-none'
					/>
				</div>

				<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
					<div className='space-y-2'>
						<Label className='text-muted-foreground'>
							Date <span className='text-destructive'>*</span>
						</Label>
						<Input
							type='date'
							value={item.date.split('T')[0]}
							onChange={(e) =>
								updateField('date', e.target.value)
							}
							className='bg-card border-border text-foreground'
						/>
					</div>
					<ColorPicker
						label='Tint Color'
						value={item.tintColor || '#6366f1'}
						onChange={(color) => updateField('tintColor', color)}
					/>
				</div>

				<ImageInput
					label='Image URL'
					value={item.imageURL || ''}
					onChange={(url) => updateField('imageURL', url)}
					placeholder='https://example.com/news-image.png'
				/>

				<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
					<div className='space-y-2'>
						<Label className='text-muted-foreground flex items-center gap-2'>
							<HugeiconsIcon
								icon={Link01Icon}
								size={16}
							/>
							External URL
						</Label>
						<Input
							value={item.url || ''}
							onChange={(e) => updateField('url', e.target.value)}
							placeholder='https://example.com/news-details'
							className='bg-card border-border text-foreground placeholder:text-muted-foreground'
						/>
					</div>
					<div className='space-y-2'>
						<Label className='text-muted-foreground flex items-center gap-2'>
							<HugeiconsIcon
								icon={PackageIcon}
								size={16}
							/>
							Linked App
						</Label>
						<Select
							value={item.appID || 'none'}
							onValueChange={(value) =>
								updateField(
									'appID',
									!value || value === 'none' ?
										undefined
									:	value,
								)
							}
						>
							<SelectTrigger className='bg-card border-border text-foreground'>
								<SelectValue placeholder='Select an app...' />
							</SelectTrigger>
							<SelectContent className='bg-card border-border'>
								<SelectItem value='none'>None</SelectItem>
								{apps
									.filter((app) => app.bundleIdentifier)
									.map((app) => (
										<SelectItem
											key={app.bundleIdentifier}
											value={app.bundleIdentifier}
										>
											{app.name || app.bundleIdentifier}
										</SelectItem>
									))}
							</SelectContent>
						</Select>
					</div>
				</div>

				<div className='flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-accent'>
					<div className='flex items-center gap-3'>
						<div className='w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center'>
							<HugeiconsIcon
								icon={Notification01Icon}
								size={20}
								className='text-primary'
							/>
						</div>
						<div>
							<Label className='text-foreground'>
								Push Notification
							</Label>
							<p className='text-xs text-muted-foreground'>
								Notify users about this news
							</p>
						</div>
					</div>
					<Switch
						checked={item.notify || false}
						onCheckedChange={(checked) =>
							updateField('notify', checked)
						}
					/>
				</div>
			</div>
		</div>
	);
}
