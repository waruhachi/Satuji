import { useNavigate } from '@tanstack/react-router';

import { Button } from '@ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight02Icon } from '@hugeicons/core-free-icons';
import { FlipWords } from '@components/flip-words';

export function Hero() {
	const navigate = useNavigate();

	return (
		<section className='relative min-h-screen overflow-hidden flex items-center justify-center'>
			<div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 bg-accent/5 rounded-full blur-3xl' />

			<div className='relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
				<div className='flex flex-col items-center text-center'>
					<h1 className='text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance max-w-4xl'>
						Build Your
						<FlipWords
							words={[
								'Esign',
								'Scarlet',
								'AltStore',
								'SideStore',
								'KravaSigner',
							]}
						/>
						<br />
						<span className='text-muted-foreground'>
							Repository in Minutes
						</span>
					</h1>

					<p className='mt-6 text-lg text-muted-foreground max-w-2xl text-balance'>
						The modern tool for creating and managing your
						repositories. Import existing sources, edit with a
						visual interface, and export clean, optimized JSON.
					</p>

					<div className='mt-10 flex flex-col sm:flex-row items-center gap-4'>
						<Button
							size='lg'
							className='gap-2 h-12 px-6'
							onClick={() => navigate({ to: '/builder' })}
						>
							Start Building
							<HugeiconsIcon
								icon={ArrowRight02Icon}
								size={16}
							/>
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
}
