import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Color, { type ColorLike } from 'color';

import { Label } from '@ui/label';
import { Input } from '@ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@ui/popover';
import {
	ColorPicker as AdvancedColorPicker,
	ColorPickerSelection,
	ColorPickerHue,
	ColorPickerEyeDropper,
} from '@/components/kibo-ui/color-picker';
import { normalizeHex } from '@lib/utils';

interface ColorPickerProps {
	label: string;
	value: string;
	onChange: (color: string) => void;
}

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
	const [isOpen, setIsOpen] = useState(false);

	const normalizedValue = useMemo(() => {
		return normalizeHex(value) ?? '#6366F1';
	}, [value]);

	const lastEmittedRef = useRef<string>(normalizedValue);
	useEffect(() => {
		lastEmittedRef.current = normalizedValue;
	}, [normalizedValue]);

	const handleColorChange = useCallback(
		(next: ColorLike) => {
			const rgb = Color.rgb(next).rgb().array();
			const r = Math.round(rgb[0]);
			const g = Math.round(rgb[1]);
			const b = Math.round(rgb[2]);

			const hex = Color.rgb([r, g, b]).hex().toUpperCase();

			if (hex === lastEmittedRef.current) return;

			lastEmittedRef.current = hex;

			onChange(hex);
		},
		[onChange],
	);

	return (
		<div className='space-y-2'>
			<Label className='text-muted-foreground'>{label}</Label>
			<div className='flex gap-3'>
				<Popover
					open={isOpen}
					onOpenChange={setIsOpen}
				>
					<PopoverTrigger
						render={
							<button
								className='w-10 h-10 rounded-lg border border-border shadow-sm cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all'
								style={{ backgroundColor: normalizedValue }}
								aria-label='Pick color'
							/>
						}
					></PopoverTrigger>
					<PopoverContent
						className='w-auto p-3 bg-card border-border'
						align='start'
					>
						<AdvancedColorPicker
							className='w-64'
							value={normalizedValue}
							onChange={handleColorChange}
						>
							<ColorPickerSelection className='h-32 mb-4' />
							<div className='flex items-center gap-4'>
								<ColorPickerEyeDropper />
								<ColorPickerHue />
							</div>
						</AdvancedColorPicker>
					</PopoverContent>
				</Popover>
				<Input
					value={normalizedValue}
					onChange={(e) => {
						const normalized = normalizeHex(e.target.value);
						if (normalized) onChange(normalized);
					}}
					placeholder='#6366f1'
					className='bg-card border-border text-foreground placeholder:text-muted-foreground font-mono text-sm flex-1'
				/>
			</div>
		</div>
	);
}
