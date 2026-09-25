import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { usePermission } from '@/hooks/user-permissions';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

type ChildCategory = {
	id: number;
	child_name: string;
	status: 'Active' | 'Inactive';
};

type PageProps = {
	childCategory: ChildCategory;
};

export default function EditChildCategory({ childCategory }: PageProps) {
	const { can } = usePermission();

	const [childName, setChildName] = useState(childCategory.child_name);
	const [status, setStatus] = useState<'Active' | 'Inactive'>(childCategory.status);

	function save(e: React.FormEvent) {
		e.preventDefault();
		router.put(route('child-categories.update', childCategory.id), {
			child_name: childName,
			status
		}, {
			onSuccess: () => toast.success('Updated successfully'),
			onError: () => toast.error('Update failed'),
		});
	}

	return (
		<AppLayout breadcrumbs={[{ title: 'Child Categories', href: '/child-categories' }, { title: 'Edit', href: `/child-categories/${childCategory.id}/edit` }]}>
			<Head title="Edit Child Category" />
			<div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
				<Card>
					<CardHeader>
						<CardTitle>Edit Child Category</CardTitle>
					</CardHeader>
					<CardContent>
						<form className="grid max-w-xl gap-4" onSubmit={save}>
								<div className="grid gap-2">
									<Label htmlFor="child_name">Name</Label>
									<Input id="child_name" value={childName} onChange={(e) => setChildName(e.target.value)} required maxLength={100} />
								</div>
								<div className="grid gap-2">
									<Label>Status</Label>
									<Select value={status} onValueChange={(v) => setStatus(v as 'Active' | 'Inactive')}>
										<SelectTrigger>
											<SelectValue placeholder="Select status" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="Active">Active</SelectItem>
											<SelectItem value="Inactive">Inactive</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="flex items-center gap-2">
									<Button type="submit" disabled={!can('update child categories')}>Save</Button>
									<Link href="/child-categories">
										<Button type="button" variant="outline">Back</Button>
									</Link>
								</div>
							</form>
					</CardContent>
				</Card>
			</div>
		</AppLayout>
	);
}


