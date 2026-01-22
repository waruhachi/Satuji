import type { App } from '@lib/types';

import { HugeiconsIcon } from '@hugeicons/react';
import {
	PackageIcon,
	MoreVerticalIcon,
	PencilEdit02Icon,
	Copy01Icon,
	Delete02Icon,
} from '@hugeicons/core-free-icons';

import { Button } from '@ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@ui/dropdown-menu';

interface AppsOverviewProps {
	apps: App[];
	onSelectApp: (index: number) => void;
	onDeleteApp: (index: number) => void;
	onDuplicateApp: (index: number) => void;
}

export function AppsOverview({
	apps,
	onSelectApp,
	onDeleteApp,
	onDuplicateApp,
}: AppsOverviewProps) {
	return (
		<div className='space-y-6'>
			{/* Header */}
			<div>
				<div className='flex items-center gap-3 mb-2'>
					<div className='w-10 h-10 rounded-xl bg-linear-to-br from-primary to-accent flex items-center justify-center'>
						<HugeiconsIcon
							icon={PackageIcon}
							size={20}
							className='text-foreground'
						/>
					</div>
					<div>
						<h1 className='text-2xl font-bold text-foreground'>
							Apps
						</h1>
						<p className='text-muted-foreground'>
							{apps.length} app{apps.length !== 1 ? 's' : ''} in
							your repository
						</p>
					</div>
				</div>
			</div>

			{/* Apps List */}
			{apps.length === 0 ?
				<div className='flex flex-col items-center justify-center py-16 text-center rounded-xl border border-dashed border-border bg-card/30'>
					<div className='w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4'>
						<HugeiconsIcon
							icon={PackageIcon}
							size={32}
							className='text-muted-foreground'
						/>
					</div>
					<h3 className='font-medium text-foreground mb-1'>
						No apps yet
					</h3>
					<p className='text-muted-foreground text-sm mb-4'>
						Add your first app using the sidebar
					</p>
				</div>
			:	<div className='grid gap-3'>
					{apps.map((app, index) => (
						<div
							key={`app-${index}`}
							className='flex items-center gap-4 p-4 rounded-xl bg-card/50 border border-border hover:border-accent transition-colors group cursor-pointer'
							onClick={() => onSelectApp(index)}
						>
							{app.iconURL ?
								<img
									src={app.iconURL || '/placeholder.svg'}
									alt=''
									className='w-14 h-14 rounded-xl object-cover shrink-0'
								/>
							:	<div
									className='w-14 h-14 rounded-xl flex items-center justify-center shrink-0'
									style={{
										backgroundColor:
											app.tintColor || '#6366f1',
									}}
								>
									<HugeiconsIcon
										icon={PackageIcon}
										size={28}
										className='text-foreground'
									/>
								</div>
							}

							<div className='flex-1 min-w-0'>
								<h3 className='font-medium text-foreground truncate'>
									{app.name || 'Untitled App'}
								</h3>
								<p className='text-sm text-muted-foreground truncate font-mono'>
									{app.bundleIdentifier || 'com.example.app'}
								</p>
								<div className='flex items-center gap-2 mt-1'>
									<span className='text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground'>
										{app.versions.length} version
										{app.versions.length !== 1 ? 's' : ''}
									</span>
									{app.versions[0] && (
										<span className='text-xs text-muted-foreground'>
											v{app.versions[0].version}
										</span>
									)}
								</div>
							</div>

							<div
								className='flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity'
								onClick={(e) => e.stopPropagation()}
							>
								<Button
									variant='ghost'
									size='sm'
									onClick={() => onSelectApp(index)}
									className='h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted'
								>
									<HugeiconsIcon
										icon={PencilEdit02Icon}
										size={16}
									/>
								</Button>
								<DropdownMenu>
									<DropdownMenuTrigger
										render={
											<Button
												variant='ghost'
												size='sm'
												className='h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted'
											>
												<HugeiconsIcon
													icon={MoreVerticalIcon}
													size={16}
												/>
											</Button>
										}
									></DropdownMenuTrigger>
									<DropdownMenuContent
										align='end'
										className='bg-card border-border'
									>
										<DropdownMenuItem
											onClick={() => onSelectApp(index)}
											className='text-muted-foreground hover:text-foreground focus:text-foreground focus:bg-muted'
										>
											<HugeiconsIcon
												icon={PencilEdit02Icon}
												size={16}
												className='mr-2'
											/>
											Edit
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() =>
												onDuplicateApp(index)
											}
											className='text-muted-foreground hover:text-foreground focus:text-foreground focus:bg-muted'
										>
											<HugeiconsIcon
												icon={Copy01Icon}
												size={16}
												className='mr-2'
											/>
											Duplicate
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() => onDeleteApp(index)}
											className='text-destructive hover:text-destructive focus:text-destructive focus:bg-destructive/10'
										>
											<HugeiconsIcon
												icon={Delete02Icon}
												size={16}
												className='mr-2'
											/>
											Delete
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</div>
					))}
				</div>
			}
		</div>
	);
}
