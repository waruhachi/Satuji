import { useContext } from 'react';
import { ColorPickerContext } from '@/contexts/color-picker-context';

export const useColorPicker = () => {
	const context = useContext(ColorPickerContext);

	if (!context) {
		throw new Error(
			'useColorPicker must be used within a ColorPickerProvider',
		);
	}

	return context;
};
