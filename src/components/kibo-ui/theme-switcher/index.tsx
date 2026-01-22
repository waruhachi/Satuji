import { motion } from 'motion/react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	Sun03Icon,
	Moon02Icon,
	ComputerIcon,
} from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';

const themes = [
	{
		key: 'system',
		icon: ComputerIcon,
		label: 'System theme',
	},
	{
		key: 'light',
		icon: Sun03Icon,
		label: 'Light theme',
	},
	{
		key: 'dark',
		icon: Moon02Icon,
		label: 'Dark theme',
	},
];

export type ThemeSwitcherProps = {
	className?: string;
};

export const ThemeSwitcher = ({ className }: ThemeSwitcherProps) => {
	const { theme, setTheme } = useTheme();

	const handleThemeClick = (themeKey: 'light' | 'dark' | 'system') => {
		if (!document.startViewTransition) setTheme(themeKey);
		document.startViewTransition(() => setTheme(themeKey));
	};

	return (
		<div
			className={cn(
				'relative isolate flex h-8 rounded-full bg-background p-1 ring-1 ring-border',
				className,
			)}
		>
			{themes.map(({ key, icon, label }) => {
				const isActive = theme === key;

				return (
					<button
						aria-label={label}
						className='relative h-6 w-6 rounded-full'
						key={key}
						onClick={() =>
							handleThemeClick(key as 'light' | 'dark' | 'system')
						}
						type='button'
					>
						{isActive && (
							<motion.div
								className='absolute inset-0 rounded-full bg-secondary'
								layoutId='activeTheme'
								transition={{ type: 'spring', duration: 0.5 }}
							/>
						)}
						<HugeiconsIcon
							icon={icon}
							className={cn(
								'relative z-10 m-auto h-4 w-4',
								isActive ? 'text-foreground' : (
									'text-muted-foreground'
								),
							)}
						/>
					</button>
				);
			})}
		</div>
	);
};
