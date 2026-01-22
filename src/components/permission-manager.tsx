import type { AppPermissions } from '@lib/types';

import { useState } from 'react';

import { HugeiconsIcon } from '@hugeicons/react';
import {
	PlusSignIcon,
	Delete02Icon,
	Shield01Icon,
	SquareLock01Icon,
} from '@hugeicons/core-free-icons';

import { Button } from '@ui/button';
import { Input } from '@ui/input';
import { Label } from '@ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@ui/select';

interface PermissionManagerProps {
	permissions: AppPermissions;
	onUpdate: (permissions: AppPermissions) => void;
}

const commonEntitlements = [
	{ value: 'com.apple.security.application-groups', label: 'App Groups' },
	{ value: 'com.apple.developer.siri', label: 'Siri' },
	{ value: 'com.apple.developer.healthkit', label: 'HealthKit' },
	{ value: 'com.apple.developer.game-center', label: 'Game Center' },
	{ value: 'com.apple.developer.networking.wifi-info', label: 'WiFi Info' },
	{ value: 'com.apple.developer.nfc.readersession.formats', label: 'NFC' },
	{
		value: 'com.apple.developer.associated-domains',
		label: 'Associated Domains',
	},
];

const commonPrivacyKeys = [
	{ value: 'NSPhotoLibraryUsageDescription', label: 'Photo Library' },
	{ value: 'NSCameraUsageDescription', label: 'Camera' },
	{ value: 'NSMicrophoneUsageDescription', label: 'Microphone' },
	{
		value: 'NSLocationWhenInUseUsageDescription',
		label: 'Location (When In Use)',
	},
	{ value: 'NSLocationAlwaysUsageDescription', label: 'Location (Always)' },
	{ value: 'NSContactsUsageDescription', label: 'Contacts' },
	{ value: 'NSCalendarsUsageDescription', label: 'Calendars' },
	{ value: 'NSLocalNetworkUsageDescription', label: 'Local Network' },
	{ value: 'NSBluetoothAlwaysUsageDescription', label: 'Bluetooth' },
	{ value: 'NSFaceIDUsageDescription', label: 'Face ID' },
];

export function PermissionManager({
	permissions,
	onUpdate,
}: PermissionManagerProps) {
	const [newEntitlement, setNewEntitlement] = useState<string | undefined>(
		undefined,
	);
	const [customEntitlement, setCustomEntitlement] = useState('');
	const [newPrivacyKey, setNewPrivacyKey] = useState<string | undefined>(
		undefined,
	);
	const [customPrivacyKey, setCustomPrivacyKey] = useState('');
	const [newPrivacyValue, setNewPrivacyValue] = useState('');

	const handleAddEntitlement = (entitlement: string | undefined) => {
		if (entitlement && !permissions.entitlements.includes(entitlement)) {
			onUpdate({
				...permissions,
				entitlements: [...permissions.entitlements, entitlement],
			});
			setNewEntitlement(undefined);
			setCustomEntitlement('');
		}
	};

	const handleAddCustomEntitlement = () => {
		if (
			customEntitlement &&
			!permissions.entitlements.includes(customEntitlement)
		) {
			onUpdate({
				...permissions,
				entitlements: [...permissions.entitlements, customEntitlement],
			});
			setCustomEntitlement('');
		}
	};

	const handleRemoveEntitlement = (entitlement: string) => {
		onUpdate({
			...permissions,
			entitlements: permissions.entitlements.filter(
				(e) => e !== entitlement,
			),
		});
	};

	const handleEntitlementChange = (value: string | null) =>
		setNewEntitlement(value ?? undefined);

	const handleAddPrivacy = () => {
		const keyToUse = newPrivacyKey || customPrivacyKey;
		if (keyToUse && newPrivacyValue && !permissions.privacy[keyToUse]) {
			onUpdate({
				...permissions,
				privacy: {
					...permissions.privacy,
					[keyToUse]: newPrivacyValue,
				},
			});
			setNewPrivacyKey(undefined);
			setCustomPrivacyKey('');
			setNewPrivacyValue('');
		}
	};

	const handleUpdatePrivacy = (key: string, value: string) => {
		onUpdate({
			...permissions,
			privacy: { ...permissions.privacy, [key]: value },
		});
	};

	const handleRemovePrivacy = (key: string) => {
		const newPrivacy = { ...permissions.privacy };
		delete newPrivacy[key];
		onUpdate({ ...permissions, privacy: newPrivacy });
	};

	const handlePrivacyKeyChange = (value: string | null) =>
		setNewPrivacyKey(value ?? undefined);

	const availableEntitlements = commonEntitlements.filter(
		(e) => !permissions.entitlements.includes(e.value),
	);
	const availablePrivacyKeys = commonPrivacyKeys.filter(
		(p) => !permissions.privacy[p.value],
	);

	return (
		<div className='space-y-6'>
			{/* Entitlements */}
			<div className='space-y-4 p-4 rounded-xl border border-border bg-card/30'>
				<div className='flex items-center gap-2'>
					<HugeiconsIcon
						icon={Shield01Icon}
						size={16}
						className='text-primary'
					/>
					<h3 className='font-medium text-foreground'>
						Entitlements
					</h3>
				</div>
				<p className='text-xs text-muted-foreground'>
					System capabilities your app requires
				</p>

				{availableEntitlements.length > 0 && (
					<div className='flex gap-2'>
						<Select
							value={newEntitlement}
							onValueChange={handleEntitlementChange}
						>
							<SelectTrigger className='bg-card border-border text-foreground flex-1'>
								<SelectValue placeholder='Select an entitlement...' />
							</SelectTrigger>
							<SelectContent className='bg-card border-border'>
								{availableEntitlements.map((entitlement) => (
									<SelectItem
										key={entitlement.value}
										value={entitlement.value}
									>
										{entitlement.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Button
							onClick={() => handleAddEntitlement(newEntitlement)}
							disabled={!newEntitlement}
							size='icon'
							className='bg-primary hover:bg-primary/90'
						>
							<HugeiconsIcon
								icon={PlusSignIcon}
								size={16}
							/>
						</Button>
					</div>
				)}

				<div className='flex gap-2'>
					<Input
						value={customEntitlement}
						onChange={(e) => setCustomEntitlement(e.target.value)}
						placeholder='Or enter custom entitlement...'
						className='bg-card border-border text-foreground placeholder:text-muted-foreground font-mono text-sm'
					/>
					<Button
						onClick={handleAddCustomEntitlement}
						disabled={!customEntitlement}
						variant='outline'
						size='icon'
						className='bg-transparent border-border text-muted-foreground hover:text-foreground hover:bg-muted'
					>
						<HugeiconsIcon
							icon={PlusSignIcon}
							size={16}
						/>
					</Button>
				</div>

				{permissions.entitlements.length > 0 && (
					<div className='space-y-2'>
						{permissions.entitlements.map((entitlement) => {
							const label = commonEntitlements.find(
								(e) => e.value === entitlement,
							)?.label;
							return (
								<div
									key={entitlement}
									className='flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border'
								>
									<div>
										{label && (
											<p className='text-sm font-medium text-foreground'>
												{label}
											</p>
										)}
										<p className='text-xs text-muted-foreground font-mono'>
											{entitlement}
										</p>
									</div>
									<Button
										variant='ghost'
										size='icon'
										onClick={() =>
											handleRemoveEntitlement(entitlement)
										}
										className='text-muted-foreground hover:text-destructive hover:bg-destructive/10'
									>
										<HugeiconsIcon
											icon={Delete02Icon}
											size={16}
										/>
									</Button>
								</div>
							);
						})}
					</div>
				)}
			</div>

			{/* Privacy Descriptions */}
			<div className='space-y-4 p-4 rounded-xl border border-border bg-card/30'>
				<div className='flex items-center gap-2'>
					<HugeiconsIcon
						icon={SquareLock01Icon}
						size={16}
						className='text-chart-4'
					/>
					<h3 className='font-medium text-foreground'>
						Privacy Descriptions
					</h3>
				</div>
				<p className='text-xs text-muted-foreground'>
					Usage descriptions shown to users when requesting
					permissions
				</p>

				<div className='space-y-3'>
					<div className='flex gap-2'>
						{availablePrivacyKeys.length > 0 ?
							<Select
								value={newPrivacyKey}
								onValueChange={handlePrivacyKeyChange}
							>
								<SelectTrigger className='bg-card border-border text-foreground w-50'>
									<SelectValue placeholder='Permission type' />
								</SelectTrigger>
								<SelectContent className='bg-card border-border'>
									{availablePrivacyKeys.map((privacy) => (
										<SelectItem
											key={privacy.value}
											value={privacy.value}
										>
											{privacy.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						:	<Input
								value={customPrivacyKey}
								onChange={(e) =>
									setCustomPrivacyKey(e.target.value)
								}
								placeholder='Custom permission key...'
								className='bg-card border-border text-foreground placeholder:text-muted-foreground w-50 font-mono text-sm'
							/>
						}
						<Input
							value={newPrivacyValue}
							onChange={(e) => setNewPrivacyValue(e.target.value)}
							placeholder='Usage description...'
							className='bg-card border-border text-foreground placeholder:text-muted-foreground flex-1'
						/>
						<Button
							onClick={handleAddPrivacy}
							disabled={
								(!newPrivacyKey && !customPrivacyKey) ||
								!newPrivacyValue
							}
							size='icon'
							className='bg-primary hover:bg-primary/90'
						>
							<HugeiconsIcon
								icon={PlusSignIcon}
								size={16}
							/>
						</Button>
					</div>
				</div>

				{Object.entries(permissions.privacy).length > 0 && (
					<div className='space-y-3'>
						{Object.entries(permissions.privacy).map(
							([key, value]) => {
								const label =
									commonPrivacyKeys.find(
										(p) => p.value === key,
									)?.label || key;
								return (
									<div
										key={key}
										className='p-3 rounded-lg bg-muted/50 border border-border space-y-2'
									>
										<div className='flex items-center justify-between'>
											<Label className='text-sm font-medium text-foreground'>
												{label}
											</Label>
											<Button
												variant='ghost'
												size='icon'
												onClick={() =>
													handleRemovePrivacy(key)
												}
												className='text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8'
											>
												<HugeiconsIcon
													icon={Delete02Icon}
													size={16}
												/>
											</Button>
										</div>
										<Input
											value={value}
											onChange={(e) =>
												handleUpdatePrivacy(
													key,
													e.target.value,
												)
											}
											className='bg-card border-border text-foreground text-sm'
										/>
										<p className='text-xs text-muted-foreground font-mono'>
											{key}
										</p>
									</div>
								);
							},
						)}
					</div>
				)}
			</div>
		</div>
	);
}
