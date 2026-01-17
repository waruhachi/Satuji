import { createFileRoute } from '@tanstack/react-router';
import { AuroraBackground } from '@components/aurora';
import { Hero } from '@components/hero';

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
