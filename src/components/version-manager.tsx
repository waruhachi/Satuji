import type { AppVersion } from '@lib/types';

import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	PlusSignIcon,
	Delete02Icon,
	ArrowDown01Icon,
	DragDropVerticalIcon,
	Layers01Icon,
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

interface VersionManagerProps {
	versions: AppVersion[];
	onUpdate: (versions: AppVersion[]) => void;
}

const createDefaultVersion = (): AppVersion => ({
	version: '',
	date: new Date().toISOString().split('T')[0],
	size: 0,
	downloadURL: '',
	localizedDescription: '',
	minOSVersion: '14.0',
});

export function VersionManager({ versions, onUpdate }: VersionManagerProps) {
	const [expandedIndex, setExpandedIndex] = useState<number | null>(
		versions.length > 0 ? 0 : null,
	);

	const handleAdd = () => {
		const newVersions = [createDefaultVersion(), ...versions];
		onUpdate(newVersions);
		setExpandedIndex(0);
	};

	const handleUpdate = (index: number, updates: Partial<AppVersion>) => {
		const newVersions = [...versions];
		newVersions[index] = { ...newVersions[index], ...updates };
		onUpdate(newVersions);
	};

	const handleDelete = (index: number) => {
		const newVersions = versions.filter((_, i) => i !== index);
		onUpdate(newVersions);
		setExpandedIndex(null);
	};

	const formatFileSize = (bytes: number): string => {
		if (bytes === 0) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
	};

	return (
		<div className='space-y-4 p-4 rounded-xl border border-border bg-card/30'>
			<div className='flex items-center justify-between'>
				<p className='text-sm text-muted-foreground'>
					{versions.length} version{versions.length !== 1 ? 's' : ''}
				</p>
				<Button
					onClick={handleAdd}
					size='sm'
					className='gap-2 bg-primary hover:bg-primary/90 text-foreground'
				>
					<HugeiconsIcon
						icon={PlusSignIcon}
						size={16}
					/>
					Add Version
				</Button>
			</div>

			{versions.length === 0 ?
				<div className='flex flex-col items-center justify-center py-8 text-center border border-dashed border-border rounded-lg'>
					<HugeiconsIcon
						icon={Layers01Icon}
						size={32}
						className='text-muted-foreground mb-3'
					/>
					<p className='text-muted-foreground text-sm mb-4'>
						No versions added yet
					</p>
					<Button
						onClick={handleAdd}
						variant='outline'
						size='sm'
						className='gap-2 bg-transparent border-border text-muted-foreground hover:text-foreground hover:bg-muted'
					>
						<HugeiconsIcon
							icon={PlusSignIcon}
							size={16}
						/>
						Add First Version
					</Button>
				</div>
			:	<div className='space-y-3'>
					{versions.map((version, index) => (
						<Collapsible
							key={`${version.version}-${index}`}
							open={expandedIndex === index}
							onOpenChange={(open) =>
								setExpandedIndex(open ? index : null)
							}
						>
							<div className='border border-border rounded-lg overflow-hidden bg-card/50'>
								<CollapsibleTrigger
									render={
										<button className='flex items-center gap-3 w-full p-4 hover:bg-muted/50 transition-colors text-left'>
											<HugeiconsIcon
												icon={DragDropVerticalIcon}
												size={16}
												className='text-muted-foreground'
											/>
											<div className='flex-1 min-w-0'>
												<div className='flex items-center gap-2'>
													<span className='font-medium text-foreground'>
														v
														{version.version ||
															'?.?.?'}
													</span>
													{index === 0 && (
														<span className='text-xs px-2 py-0.5 rounded-full bg-chart-1/10 text-chart-1 border border-chart-1/20'>
															Latest
														</span>
													)}
												</div>
												<div className='text-sm text-muted-foreground flex items-center gap-2'>
													<span>
														{version.date ||
															'No date'}
													</span>
													<span>•</span>
													<span>
														{formatFileSize(
															version.size,
														)}
													</span>
												</div>
											</div>
											<HugeiconsIcon
												icon={ArrowDown01Icon}
												size={16}
												className={`text-muted-foreground transition-transform ${expandedIndex === index ? 'rotate-180' : ''}`}
											/>
										</button>
									}
								></CollapsibleTrigger>
								<CollapsibleContent>
									<div className='p-4 pt-0 space-y-4 border-t border-border'>
										<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
											<div className='space-y-2'>
												<Label className='text-muted-foreground'>
													Version{' '}
													<span className='text-destructive'>
														*
													</span>
												</Label>
												<Input
													value={version.version}
													onChange={(e) =>
														handleUpdate(index, {
															version:
																e.target.value,
														})
													}
													placeholder='1.0.0'
													className='bg-card border-border text-foreground placeholder:text-muted-foreground'
												/>
											</div>
											<div className='space-y-2'>
												<Label className='text-muted-foreground'>
													Release Date{' '}
													<span className='text-destructive'>
														*
													</span>
												</Label>
												<Input
													type='date'
													value={
														version.date.split(
															'T',
														)[0]
													}
													onChange={(e) =>
														handleUpdate(index, {
															date: e.target
																.value,
														})
													}
													className='bg-card border-border text-foreground'
												/>
											</div>
											<div className='space-y-2'>
												<Label className='text-muted-foreground'>
													Size (bytes){' '}
													<span className='text-destructive'>
														*
													</span>
												</Label>
												<Input
													type='number'
													value={version.size}
													onChange={(e) =>
														handleUpdate(index, {
															size: Number(
																e.target.value,
															),
														})
													}
													placeholder='10000000'
													className='bg-card border-border text-foreground placeholder:text-muted-foreground'
												/>
											</div>
										</div>

										<div className='space-y-2'>
											<Label className='text-muted-foreground'>
												Download URL{' '}
												<span className='text-destructive'>
													*
												</span>
											</Label>
											<Input
												value={version.downloadURL}
												onChange={(e) =>
													handleUpdate(index, {
														downloadURL:
															e.target.value,
													})
												}
												placeholder='https://example.com/myapp_v1.0.ipa'
												className='bg-card border-border text-foreground placeholder:text-muted-foreground'
											/>
										</div>

										<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
											<div className='space-y-2'>
												<Label className='text-muted-foreground'>
													Minimum iOS Version
												</Label>
												<Input
													value={
														version.minOSVersion ||
														''
													}
													onChange={(e) =>
														handleUpdate(index, {
															minOSVersion:
																e.target.value,
														})
													}
													placeholder='14.0'
													className='bg-card border-border text-foreground placeholder:text-muted-foreground'
												/>
											</div>
											<div className='space-y-2'>
												<Label className='text-muted-foreground'>
													Maximum iOS Version
												</Label>
												<Input
													value={
														version.maxOSVersion ||
														''
													}
													onChange={(e) =>
														handleUpdate(index, {
															maxOSVersion:
																e.target.value,
														})
													}
													placeholder='17.0'
													className='bg-card border-border text-foreground placeholder:text-muted-foreground'
												/>
											</div>
										</div>

										<div className='space-y-2'>
											<Label className='text-muted-foreground'>
												Release Notes
											</Label>
											<Textarea
												value={
													version.localizedDescription ||
													''
												}
												onChange={(e) =>
													handleUpdate(index, {
														localizedDescription:
															e.target.value,
													})
												}
												placeholder="What's new in this version..."
												className='bg-card border-border text-foreground placeholder:text-muted-foreground min-h-20 resize-none'
											/>
										</div>

										<div className='flex justify-end'>
											<Button
												variant='outline'
												size='sm'
												onClick={() =>
													handleDelete(index)
												}
												className='gap-2 bg-transparent border-destructive/50 text-destructive hover:bg-destructive/10 hover:border-destructive/50'
											>
												<HugeiconsIcon
													icon={Delete02Icon}
													size={16}
												/>
												Delete Version
											</Button>
										</div>
									</div>
								</CollapsibleContent>
							</div>
						</Collapsible>
					))}
				</div>
			}
		</div>
	);
}
