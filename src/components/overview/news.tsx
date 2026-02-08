import type { NewsItem } from '@lib/types';

import { HugeiconsIcon } from '@hugeicons/react';
import {
	NewsIcon,
	MoreVerticalIcon,
	PencilEdit02Icon,
	Copy01Icon,
	Delete02Icon,
	Notification01Icon,
} from '@hugeicons/core-free-icons';

import { Button } from '@ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@ui/dropdown-menu';

interface NewsOverviewProps {
	news: NewsItem[];
	onSelectNews: (index: number) => void;
	onDeleteNews: (index: number) => void;
	onDuplicateNews: (index: number) => void;
}

export function NewsOverview({
	news,
	onSelectNews,
	onDeleteNews,
	onDuplicateNews,
}: NewsOverviewProps) {
	return (
		<div className='space-y-6'>
			{/* Header */}
			<div>
				<div className='flex items-center gap-3 mb-2'>
					<div className='w-10 h-10 rounded-xl bg-linear-to-br from-primary to-accent flex items-center justify-center'>
						<HugeiconsIcon
							icon={NewsIcon}
							size={20}
							className='text-foreground'
						/>
					</div>
					<div>
						<h1 className='text-2xl font-bold text-foreground'>
							News
						</h1>
						<p className='text-muted-foreground'>
							{news.length} news item
							{news.length !== 1 ? 's' : ''} in your repository
						</p>
					</div>
				</div>
			</div>

			{/* News List */}
			{news.length === 0 ?
				<div className='flex flex-col items-center justify-center py-16 text-center rounded-xl border border-dashed border-border bg-card/30'>
					<div className='w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4'>
						<HugeiconsIcon
							icon={NewsIcon}
							size={32}
							className='text-muted-foreground'
						/>
					</div>
					<h3 className='font-medium text-foreground mb-1'>
						No news yet
					</h3>
					<p className='text-muted-foreground text-sm mb-4'>
						Add announcements using the sidebar
					</p>
				</div>
			:	<div className='grid gap-3'>
					{news.map((item, index) => (
						<div
							key={`news-${index}`}
							className='flex items-center gap-4 p-4 rounded-xl bg-card/50 border border-border hover:border-accent transition-colors group cursor-pointer'
							onClick={() => onSelectNews(index)}
						>
							<div
								className='w-3 h-12 rounded-full shrink-0'
								style={{
									backgroundColor:
										item.tintColor || '#6366f1',
								}}
							/>

							<div className='flex-1 min-w-0'>
								<div className='flex items-center gap-2'>
									<h3 className='font-medium text-foreground truncate'>
										{item.title || 'Untitled'}
									</h3>
									{item.notify && (
										<span className='flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-primary/10 text-primary'>
											<HugeiconsIcon
												icon={Notification01Icon}
												size={12}
											/>
											Notify
										</span>
									)}
								</div>
								<p className='text-sm text-muted-foreground truncate'>
									{item.caption || 'No caption'}
								</p>
								<span className='text-xs text-muted-foreground'>
									{item.date}
								</span>
							</div>

							<div
								className='flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity'
								onClick={(e) => e.stopPropagation()}
							>
								<Button
									variant='ghost'
									size='sm'
									onClick={() => onSelectNews(index)}
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
											onClick={() => onSelectNews(index)}
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
												onDuplicateNews(index)
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
											onClick={() => onDeleteNews(index)}
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
