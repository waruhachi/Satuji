export const config = {
	runtime: 'edge',
};

const jsonResponse = (message: string, status = 400) =>
	new Response(JSON.stringify({ error: message }), {
		status,
		headers: {
			'content-type': 'application/json',
			'access-control-allow-origin': '*',
		},
	});

export default async function handler(request: Request) {
	if (request.method === 'OPTIONS') {
		return new Response(null, {
			status: 204,
			headers: {
				'access-control-allow-origin': '*',
				'access-control-allow-methods': 'POST, OPTIONS',
				'access-control-allow-headers': 'content-type',
			},
		});
	}

	if (request.method !== 'POST') {
		return jsonResponse('Method not allowed', 405);
	}

	let formData: FormData;
	try {
		formData = await request.formData();
	} catch {
		return jsonResponse('Invalid form data');
	}

	const source = formData.get('source');
	const key = formData.get('key');

	if (!(source instanceof File)) {
		return jsonResponse('Missing image file');
	}
	if (typeof key !== 'string' || !key.trim()) {
		return jsonResponse('Missing API key');
	}

	const outbound = new FormData();
	outbound.append('source', source);
	outbound.append('key', key.trim());
	outbound.append(
		'action',
		typeof formData.get('action') === 'string' ?
			(formData.get('action') as string)
		:	'upload',
	);
	outbound.append(
		'format',
		typeof formData.get('format') === 'string' ?
			(formData.get('format') as string)
		:	'json',
	);

	let upstream: Response;
	try {
		upstream = await fetch('https://freeimage.host/api/1/upload', {
			method: 'POST',
			body: outbound,
		});
	} catch {
		return jsonResponse('Upload service unavailable', 502);
	}

	return new Response(upstream.body, {
		status: upstream.status,
		headers: {
			'content-type':
				upstream.headers.get('content-type') || 'application/json',
			'access-control-allow-origin': '*',
		},
	});
}
