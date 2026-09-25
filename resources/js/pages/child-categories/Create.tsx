import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { usePermission } from '@/hooks/user-permissions';
import { Head, Link, useForm } from '@inertiajs/react';

export default function CreateChildCategory() {
	const { can } = usePermission();
	const { data, setData, post, processing, errors } = useForm({
		child_name: '',
		status: 'Active' as 'Active' | 'Inactive',
	});

	function submit(e: React.FormEvent) {
		e.preventDefault();
		post(route('child-categories.store'));
	}

	return (
		<AppLayout breadcrumbs={[{ title: 'Child Categories', href: '/child-categories' }, { title: 'Create', href: '/child-categories/create' }]}>
			<Head title="Create Child Category" />
			<div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
				<Card>
					<CardHeader>
						<CardTitle>Create Child Category</CardTitle>
					</CardHeader>
					<CardContent>
						<form className="grid max-w-xl gap-4" onSubmit={submit}>
							<div className="grid gap-2">
								<Label htmlFor="child_name">Name</Label>
								<Input 
									id="child_name" 
									value={data.child_name} 
									onChange={(e) => setData('child_name', e.target.value)} 
									required 
									maxLength={100} 
								/>
								{errors.child_name && <p className="text-sm text-red-600">{errors.child_name}</p>}
							</div>
							<div className="grid gap-2">
								<Label>Status</Label>
								<Select value={data.status} onValueChange={(v) => setData('status', v as 'Active' | 'Inactive')}>
									<SelectTrigger>
										<SelectValue placeholder="Select status" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="Active">Active</SelectItem>
										<SelectItem value="Inactive">Inactive</SelectItem>
									</SelectContent>
								</Select>
								{errors.status && <p className="text-sm text-red-600">{errors.status}</p>}
							</div>
							<div className="flex items-center gap-2">
								<Button type="submit" disabled={processing || !can('create child categories')}>Save</Button>
								<Link href="/child-categories">
									<Button type="button" variant="outline">Cancel</Button>
								</Link>
							</div>
						</form>
					</CardContent>
				</Card>
			</div>
		</AppLayout>
	);
}


