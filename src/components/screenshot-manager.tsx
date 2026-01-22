import type { Screenshot } from '@lib/types';

import { HugeiconsIcon } from '@hugeicons/react';
import {
	PlusSignIcon,
	Delete02Icon,
	Image01Icon,
	DragDropVerticalIcon,
} from '@hugeicons/core-free-icons';

import { Button } from '@ui/button';
import { Input } from '@ui/input';
import { Label } from '@ui/label';

interface ScreenshotManagerProps {
	screenshots: (string | Screenshot)[] | undefined;
	onUpdate: (screenshots: (string | Screenshot)[]) => void;
}

export function ScreenshotManager({
	screenshots = [],
	onUpdate,
}: ScreenshotManagerProps) {
	const normalizedScreenshots: Screenshot[] = screenshots.map((s) =>
		typeof s === 'string' ? { imageURL: s } : s,
	);

	const handleAdd = () => {
		onUpdate([
			...screenshots,
			{ imageURL: '', width: undefined, height: undefined },
		]);
	};

	const handleUpdate = (index: number, updates: Partial<Screenshot>) => {
		const newScreenshots = [...normalizedScreenshots];
		newScreenshots[index] = { ...newScreenshots[index], ...updates };
		onUpdate(newScreenshots);
	};

	const handleDelete = (index: number) => {
		const newScreenshots = normalizedScreenshots.filter(
			(_, i) => i !== index,
		);
		onUpdate(newScreenshots);
	};

	return (
		<div className='space-y-4 p-4 rounded-xl border border-border bg-card/30'>
			<div className='flex items-center justify-between'>
				<p className='text-sm text-muted-foreground'>
					{normalizedScreenshots.length} screenshot
					{normalizedScreenshots.length !== 1 ? 's' : ''}
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
					Add Screenshot
				</Button>
			</div>

			{normalizedScreenshots.length === 0 ?
				<div className='flex flex-col items-center justify-center py-8 text-center border border-dashed border-border rounded-lg'>
					<HugeiconsIcon
						icon={Image01Icon}
						size={32}
						className='text-muted-foreground mb-3'
					/>
					<p className='text-muted-foreground text-sm mb-4'>
						No screenshots added
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
						Add Screenshot
					</Button>
				</div>
			:	<div className='space-y-4'>
					{normalizedScreenshots.map((screenshot, index) => (
						<div
							key={index}
							className='flex gap-4 p-4 rounded-lg bg-card/50 border border-border'
						>
							<div className='flex items-center'>
								<HugeiconsIcon
									icon={DragDropVerticalIcon}
									size={16}
									className='text-muted-foreground cursor-grab'
								/>
							</div>

							<div className='w-20 h-36 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0 border border-border'>
								{screenshot.imageURL ?
									<img
										src={
											screenshot.imageURL ||
											'/placeholder.svg'
										}
										alt={`Screenshot ${index + 1}`}
										className='w-full h-full object-cover'
									/>
								:	<HugeiconsIcon
										icon={Image01Icon}
										size={24}
										className='text-muted-foreground'
									/>
								}
							</div>

							<div className='flex-1 space-y-3'>
								<div className='space-y-2'>
									<Label className='text-muted-foreground'>
										Image URL
									</Label>
									<Input
										value={screenshot.imageURL}
										onChange={(e) =>
											handleUpdate(index, {
												imageURL: e.target.value,
											})
										}
										placeholder='https://example.com/screenshot.png'
										className='bg-card border-border text-foreground placeholder:text-muted-foreground'
									/>
								</div>

								<div className='grid grid-cols-2 gap-3'>
									<div className='space-y-2'>
										<Label className='text-muted-foreground'>
											Width (px)
										</Label>
										<Input
											type='number'
											value={screenshot.width || ''}
											onChange={(e) =>
												handleUpdate(index, {
													width:
														e.target.value ?
															Number(
																e.target.value,
															)
														:	undefined,
												})
											}
											placeholder='1179'
											className='bg-card border-border text-foreground placeholder:text-muted-foreground'
										/>
									</div>
									<div className='space-y-2'>
										<Label className='text-muted-foreground'>
											Height (px)
										</Label>
										<Input
											type='number'
											value={screenshot.height || ''}
											onChange={(e) =>
												handleUpdate(index, {
													height:
														e.target.value ?
															Number(
																e.target.value,
															)
														:	undefined,
												})
											}
											placeholder='2556'
											className='bg-card border-border text-foreground placeholder:text-muted-foreground'
										/>
									</div>
								</div>
							</div>

							<Button
								variant='ghost'
								size='icon'
								onClick={() => handleDelete(index)}
								className='shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10'
							>
								<HugeiconsIcon
									icon={Delete02Icon}
									size={16}
								/>
							</Button>
						</div>
					))}
				</div>
			}
		</div>
	);
}
