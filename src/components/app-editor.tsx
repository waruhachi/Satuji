import type { App, Screenshot } from '@lib/types';

import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	PackageIcon,
	Delete02Icon,
	Copy01Icon,
	InformationCircleIcon,
	Layers01Icon,
	Image01Icon,
	Shield01Icon,
	ArrowDown01Icon,
} from '@hugeicons/core-free-icons';

import { Button } from '@ui/button';
import { Input } from '@ui/input';
import { Label } from '@ui/label';
import { Textarea } from '@ui/textarea';
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@ui/collapsible';
import { ColorPicker } from '@components/color-picker';
import { ImageInput } from '@components/image-input';
import { VersionManager } from '@components/version-manager';
import { ScreenshotManager } from '@components/screenshot-manager';
import { PermissionManager } from '@components/permission-manager';

interface AppEditorProps {
	app: App;
	onUpdate: (app: App) => void;
	onDelete: () => void;
	onDuplicate: () => void;
}

export function AppEditor({
	app,
	onUpdate,
	onDelete,
	onDuplicate,
}: AppEditorProps) {
	const [expandedSections, setExpandedSections] = useState<
		Record<string, boolean>
	>({
		details: true,
		versions: true,
		screenshots: false,
		permissions: false,
	});

	const toggleSection = (section: string) => {
		setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
	};

	const updateField = <K extends keyof App>(field: K, value: App[K]) => {
		onUpdate({ ...app, [field]: value });
	};

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex items-start justify-between'>
				<div className='flex items-center gap-4'>
					{app.iconURL ?
						<img
							src={app.iconURL || '/placeholder.svg'}
							alt=''
							className='w-16 h-16 rounded-2xl object-cover'
						/>
					:	<div
							className='w-16 h-16 rounded-2xl flex items-center justify-center'
							style={{
								backgroundColor: app.tintColor || '#6366f1',
							}}
						>
							<HugeiconsIcon
								icon={PackageIcon}
								size={32}
								className='text-foreground'
							/>
						</div>
					}
					<div>
						<h1 className='text-2xl font-bold text-foreground'>
							{app.name || 'Untitled App'}
						</h1>
						<p className='text-muted-foreground font-mono text-sm'>
							{app.bundleIdentifier || 'com.example.app'}
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

			{/* App Details */}
			<Collapsible
				open={expandedSections.details}
				onOpenChange={() => toggleSection('details')}
			>
				<CollapsibleTrigger
					render={
						<button className='w-full flex items-center justify-between p-4 rounded-xl bg-card/50 border border-border hover:bg-card transition-colors'>
							<div className='flex items-center gap-3'>
								<div className='w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center'>
									<HugeiconsIcon
										icon={InformationCircleIcon}
										size={16}
										className='text-primary'
									/>
								</div>
								<div className='text-left'>
									<h3 className='font-medium text-foreground'>
										App Details
									</h3>
									<p className='text-xs text-muted-foreground'>
										Name, bundle ID, developer, description
									</p>
								</div>
							</div>
							<HugeiconsIcon
								icon={ArrowDown01Icon}
								size={20}
								className={`text-muted-foreground transition-transform ${expandedSections.details ? 'rotate-180' : ''}`}
							/>
						</button>
					}
				></CollapsibleTrigger>
				<CollapsibleContent className='mt-3'>
					<div className='space-y-4 p-4 rounded-xl border border-border bg-card/30'>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							<div className='space-y-2'>
								<Label className='text-muted-foreground'>
									App Name{' '}
									<span className='text-destructive'>*</span>
								</Label>
								<Input
									value={app.name}
									onChange={(e) =>
										updateField('name', e.target.value)
									}
									placeholder='My Example App'
									className='bg-card border-border text-foreground placeholder:text-muted-foreground'
								/>
							</div>
							<div className='space-y-2'>
								<Label className='text-muted-foreground'>
									Bundle Identifier{' '}
									<span className='text-destructive'>*</span>
								</Label>
								<Input
									value={app.bundleIdentifier}
									onChange={(e) =>
										updateField(
											'bundleIdentifier',
											e.target.value,
										)
									}
									placeholder='com.example.myapp'
									className='bg-card border-border text-foreground placeholder:text-muted-foreground font-mono text-sm'
								/>
							</div>
						</div>

						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							<div className='space-y-2'>
								<Label className='text-muted-foreground'>
									Developer Name{' '}
									<span className='text-destructive'>*</span>
								</Label>
								<Input
									value={app.developerName}
									onChange={(e) =>
										updateField(
											'developerName',
											e.target.value,
										)
									}
									placeholder='Example Developer'
									className='bg-card border-border text-foreground placeholder:text-muted-foreground'
								/>
							</div>
							<div className='space-y-2'>
								<Label className='text-muted-foreground'>
									Subtitle
								</Label>
								<Input
									value={app.subtitle || ''}
									onChange={(e) =>
										updateField('subtitle', e.target.value)
									}
									placeholder='An awesome app.'
									className='bg-card border-border text-foreground placeholder:text-muted-foreground'
								/>
							</div>
						</div>

						<div className='space-y-2'>
							<Label className='text-muted-foreground'>
								Description
							</Label>
							<Textarea
								value={app.localizedDescription || ''}
								onChange={(e) =>
									updateField(
										'localizedDescription',
										e.target.value,
									)
								}
								placeholder='Describe what your app does...'
								className='bg-card border-border text-foreground placeholder:text-muted-foreground min-h-25 resize-none'
							/>
						</div>

						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							<ColorPicker
								label='Tint Color'
								value={app.tintColor || '#6366f1'}
								onChange={(color) =>
									updateField('tintColor', color)
								}
							/>
							<ImageInput
								label='App Icon URL'
								value={app.iconURL || ''}
								onChange={(url) => updateField('iconURL', url)}
								placeholder='https://example.com/icon.png'
							/>
						</div>
					</div>
				</CollapsibleContent>
			</Collapsible>

			{/* Versions */}
			<Collapsible
				open={expandedSections.versions}
				onOpenChange={() => toggleSection('versions')}
			>
				<CollapsibleTrigger
					render={
						<button className='w-full flex items-center justify-between p-4 rounded-xl bg-card/50 border border-border hover:bg-card transition-colors'>
							<div className='flex items-center gap-3'>
								<div className='w-8 h-8 rounded-lg bg-chart-1/10 flex items-center justify-center'>
									<HugeiconsIcon
										icon={Layers01Icon}
										size={16}
										className='text-chart-1'
									/>
								</div>
								<div className='text-left'>
									<h3 className='font-medium text-foreground'>
										Versions
									</h3>
									<p className='text-xs text-muted-foreground'>
										{app.versions.length} version
										{app.versions.length !== 1 ? 's' : ''}
									</p>
								</div>
							</div>
							<HugeiconsIcon
								icon={ArrowDown01Icon}
								size={20}
								className={`text-muted-foreground transition-transform ${expandedSections.versions ? 'rotate-180' : ''}`}
							/>
						</button>
					}
				></CollapsibleTrigger>
				<CollapsibleContent className='mt-3'>
					<VersionManager
						versions={app.versions}
						onUpdate={(versions) =>
							updateField('versions', versions)
						}
					/>
				</CollapsibleContent>
			</Collapsible>

			{/* Screenshots */}
			<Collapsible
				open={expandedSections.screenshots}
				onOpenChange={() => toggleSection('screenshots')}
			>
				<CollapsibleTrigger
					render={
						<button className='w-full flex items-center justify-between p-4 rounded-xl bg-card/50 border border-border hover:bg-card transition-colors'>
							<div className='flex items-center gap-3'>
								<div className='w-8 h-8 rounded-lg bg-chart-3/10 flex items-center justify-center'>
									<HugeiconsIcon
										icon={Image01Icon}
										size={16}
										className='text-chart-3'
									/>
								</div>
								<div className='text-left'>
									<h3 className='font-medium text-foreground'>
										Screenshots
									</h3>
									<p className='text-xs text-muted-foreground'>
										App preview images
									</p>
								</div>
							</div>
							<HugeiconsIcon
								icon={ArrowDown01Icon}
								size={20}
								className={`text-muted-foreground transition-transform ${expandedSections.screenshots ? 'rotate-180' : ''}`}
							/>
						</button>
					}
				></CollapsibleTrigger>
				<CollapsibleContent className='mt-3'>
					<ScreenshotManager
						screenshots={app.screenshots as (string | Screenshot)[]}
						onUpdate={(screenshots) =>
							updateField('screenshots', screenshots)
						}
					/>
				</CollapsibleContent>
			</Collapsible>

			{/* Permissions */}
			<Collapsible
				open={expandedSections.permissions}
				onOpenChange={() => toggleSection('permissions')}
			>
				<CollapsibleTrigger
					render={
						<button className='w-full flex items-center justify-between p-4 rounded-xl bg-card/50 border border-border hover:bg-card transition-colors'>
							<div className='flex items-center gap-3'>
								<div className='w-8 h-8 rounded-lg bg-chart-4/10 flex items-center justify-center'>
									<HugeiconsIcon
										icon={Shield01Icon}
										size={16}
										className='text-chart-4'
									/>
								</div>
								<div className='text-left'>
									<h3 className='font-medium text-foreground'>
										Permissions
									</h3>
									<p className='text-xs text-muted-foreground'>
										Entitlements and privacy
									</p>
								</div>
							</div>
							<HugeiconsIcon
								icon={ArrowDown01Icon}
								size={20}
								className={`text-muted-foreground transition-transform ${expandedSections.permissions ? 'rotate-180' : ''}`}
							/>
						</button>
					}
				></CollapsibleTrigger>
				<CollapsibleContent className='mt-3'>
					<PermissionManager
						permissions={
							app.appPermissions || {
								entitlements: [],
								privacy: {},
							}
						}
						onUpdate={(permissions) =>
							updateField('appPermissions', permissions)
						}
					/>
				</CollapsibleContent>
			</Collapsible>
		</div>
	);
}
