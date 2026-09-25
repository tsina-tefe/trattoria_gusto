import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import React from 'react';

const breadcrumbs: BreadcrumbItem[] = [
	{
		title: 'Create Role',
		href: '/roles/create',
	},
];

export default function CreateRoles({ permissions }: { permissions: string[] }) {
	const { data, setData, post, errors, processing } = useForm({
		name: '',
		permissions: [] as string[],
	});

	function submit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		post('/roles');
	}

	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<Head title="Create Role" />
			<div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
				<Card>
					<CardHeader className="flex items-center justify-between">
						<CardTitle>Create Role</CardTitle>
						<CardAction>
							<Link href={'/roles'}>
								<Button variant={'default'}>Go Back</Button>
							</Link>
						</CardAction>
					</CardHeader>
					<hr />
					<CardContent>
						<form onSubmit={submit}>
							<div className="mb-4">
								<Label htmlFor="name">Role Name</Label>
								<Input
									id="name"
									type="text"
									value={data.name}
									onChange={(e) => setData('name', e.target.value)}
									aria-invalid={!!errors.name}
								/>
								<InputError message={errors.name} />
							</div>

							<Label>Select Permissions</Label>
							<div className="my-4">
								<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
									{permissions.map((permission) => (
										<div key={permission} className="flex items-center gap-3">
											<Checkbox
												id={permission}
												onCheckedChange={(checked) => {
													if (checked) {
														setData('permissions', [...data.permissions, permission]);
													} else {
														setData(
															'permissions',
															data.permissions.filter((p) => p !== permission),
														);
													}
												}}
											/>
											<Label htmlFor={permission}>{permission}</Label>
										</div>
									))}
								</div>
							</div>

							<div className="flex justify-end">
								<Button size={'lg'} type="submit" disabled={processing}>
									Create
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>
			</div>
		</AppLayout>
	);
}
