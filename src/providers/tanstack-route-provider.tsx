import { routeTree } from '../routeTree.gen';
import { RouterProvider, createRouter } from '@tanstack/react-router';

declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router;
	}
}

const router = createRouter({ routeTree });

export function TanstackRouterProvider() {
	return <RouterProvider router={router} />;
}
