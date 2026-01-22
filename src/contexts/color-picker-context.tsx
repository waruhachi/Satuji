import { createContext } from 'react';

type ColorPickerContextValue = {
	hue: number;
	saturation: number;
	lightness: number;
	alpha: number;
	mode: string;
	setHue: (hue: number) => void;
	setSaturation: (saturation: number) => void;
	setLightness: (lightness: number) => void;
	setAlpha: (alpha: number) => void;
	setMode: (mode: string) => void;
};

export const ColorPickerContext = createContext<
	ColorPickerContextValue | undefined
>(undefined);
