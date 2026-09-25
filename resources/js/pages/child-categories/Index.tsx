import TablePagination from '@/components/table-pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { usePermission } from '@/hooks/user-permissions';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

type ChildCategory = {
	id: number;
	child_name: string;
	status: 'Active' | 'Inactive';
	created_at?: string | null;
	updated_at?: string | null;
};

type Paginated<T> = {
	data: T[];
	total: number;
	from: number;
	to: number;
	links: any[];
};

type PageProps = {
	childCategories: Paginated<ChildCategory>;
	filters: {
		search?: string;
		per_page?: number;
	};
};

export default function ChildCategoriesIndex({ childCategories, filters = {} }: PageProps) {
	const [search, setSearch] = useState(filters.search ?? '');
	const { can } = usePermission();

	function handleSearch(e: React.FormEvent) {
		e.preventDefault();
		router.get('/child-categories', { search }, {
			preserveState: true,
			preserveScroll: true,
		});
	}

	function deleteItem(id: number) {
		if (!confirm('Delete this child category?')) return;
		router.delete(route('child-categories.destroy', id), {
			preserveScroll: true,
			onSuccess: () => toast.success('Deleted successfully'),
			onError: () => toast.error('Delete failed'),
		});
	}

	return (
		<AppLayout breadcrumbs={[{ title: 'Child Categories', href: '/child-categories' }]}>
			<Head title="Child Categories" />
			<div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
				<Card>
					<CardHeader className="flex items-center justify-between">
						<CardTitle>Child Categories</CardTitle>
						<form className="ml-4 flex gap-2" onSubmit={handleSearch}>
							<Input
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								placeholder="Search..."
							/>
							<Button type="submit" variant="outline">Search</Button>
						</form>
						<CardAction>
							{can('create child categories') && (
								<Link href="/child-categories/create">
									<Button variant="default">Add New</Button>
								</Link>
							)}
						</CardAction>
					</CardHeader>
					<hr />
					<CardContent>
						<Table>
							<TableHeader className="bg-slate-500 dark:bg-slate-700">
								<TableRow>
									<TableHead className="font-bold text-white">#</TableHead>
									<TableHead className="font-bold text-white">Name</TableHead>
									<TableHead className="font-bold text-white">Status</TableHead>
									<TableHead className="font-bold text-white">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{childCategories.data.map((item, idx) => (
									<TableRow key={item.id} className="odd:bg-slate-100 dark:odd:bg-slate-800">
										<TableCell>{(childCategories.from ?? 0) + idx}</TableCell>
										<TableCell>{item.child_name}</TableCell>
										<TableCell>
											<Badge variant="outline">{item.status}</Badge>
										</TableCell>
										<TableCell>
											{can('update child categories') && (
												<Link href={`/child-categories/${item.id}/edit`}>
													<Button variant="outline" size="sm">Edit</Button>
												</Link>
											)}
											{can('delete child categories') && (
												<Button className="m-2" variant="destructive" size="sm" onClick={() => deleteItem(item.id)}>
													Delete
												</Button>
											)}
										</TableCell>
									</TableRow>
								))}
								{childCategories.data.length === 0 && (
									<TableRow><TableCell colSpan={4}>No Results Found!</TableCell></TableRow>
								)}
							</TableBody>
						</Table>
					</CardContent>
					<TablePagination
						from={childCategories.from}
						to={childCategories.to}
						total={childCategories.total}
						links={childCategories.links}
					/>
				</Card>
			</div>
		</AppLayout>
	);
}


