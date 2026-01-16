import { useState } from 'react';

const tabs = ['source.json', 'Preview', 'Apps'];

const sampleCode = `{
  "name": "My AltSource",
  "identifier": "com.example.source",
  "sourceURL": "https://example.com/apps.json",
  "apps": [
    {
      "name": "Example App",
      "bundleIdentifier": "com.example.app",
      "developerName": "Developer",
      "version": "1.0.0",
      "versionDate": "2024-01-15",
      "downloadURL": "https://example.com/app.ipa",
      "localizedDescription": "An amazing app.",
      "iconURL": "https://example.com/icon.png",
      "size": 15000000
    }
  ],
  "news": []
}`;

export function Code() {
	const [activeTab, setActiveTab] = useState('source.json');

	return (
		<div className='rounded-xl border border-border bg-card overflow-hidden shadow-2xl'>
			<div className='flex items-center justify-between border-b border-border px-4 py-3 bg-secondary/30'>
				<div className='flex items-center gap-2'>
					<div className='flex gap-1.5'>
						<div className='h-3 w-3 rounded-full bg-red-500/80' />
						<div className='h-3 w-3 rounded-full bg-yellow-500/80' />
						<div className='h-3 w-3 rounded-full bg-green-500/80' />
					</div>
					<span className='ml-3 text-sm text-muted-foreground'>
						AltStudio Editor
					</span>
				</div>
				<div className='flex items-center gap-1'>
					{tabs.map((tab) => (
						<button
							key={tab}
							onClick={() => setActiveTab(tab)}
							className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
								activeTab === tab
									? 'bg-secondary text-foreground'
									: 'text-muted-foreground hover:text-foreground'
							}`}
						>
							{tab}
						</button>
					))}
				</div>
			</div>

			<div className='p-4 overflow-auto max-h-100'>
				{activeTab === 'source.json' && (
					<pre className='font-mono text-sm'>
						<code>
							{sampleCode.split('\n').map((line, i) => (
								<div
									key={i}
									className='flex'
								>
									<span className='w-8 text-right pr-4 text-muted-foreground select-none'>
										{i + 1}
									</span>
									<span className='text-foreground'>
										{line.includes('"') &&
										line.includes(':') ? (
											<>
												<span className='text-sky-400'>
													{line.split(':')[0]}
												</span>
												<span className='text-muted-foreground'>
													:
												</span>
												<span className='text-emerald-400'>
													{line
														.split(':')
														.slice(1)
														.join(':')}
												</span>
											</>
										) : line.includes('"') ? (
											<span className='text-emerald-400'>
												{line}
											</span>
										) : (
											<span className='text-muted-foreground'>
												{line}
											</span>
										)}
									</span>
								</div>
							))}
						</code>
					</pre>
				)}

				{activeTab === 'Preview' && (
					<div className='flex flex-col items-center justify-center py-12 text-center'>
						<div className='h-16 w-16 rounded-2xl bg-linear-to-br from-blue-500 to-purple-600 mb-4' />
						<h3 className='font-semibold'>My AltSource</h3>
						<p className='text-sm text-muted-foreground mt-1'>
							1 app available
						</p>
					</div>
				)}

				{activeTab === 'Apps' && (
					<div className='space-y-3'>
						<div className='flex items-center gap-4 p-3 rounded-lg bg-secondary/50 border border-border'>
							<div className='h-12 w-12 rounded-xl bg-linear-to-br from-orange-500 to-pink-600' />
							<div className='flex-1'>
								<h4 className='font-medium'>Example App</h4>
								<p className='text-sm text-muted-foreground'>
									v1.0.0 • Developer
								</p>
							</div>
							<span className='text-xs text-muted-foreground'>
								15 MB
							</span>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
