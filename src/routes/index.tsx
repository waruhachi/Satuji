import { createFileRoute } from '@tanstack/react-router';
import { AuroraBackground } from '@components/visual/aurora';
import { Hero } from '@components/visual/hero';

export const Route = createFileRoute('/')({
	component: Index,
});

function Index() {
	return (
		<AuroraBackground>
			<Hero />
		</AuroraBackground>
	);
}
