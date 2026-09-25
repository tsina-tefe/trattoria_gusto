import { type BreadcrumbItem, type PaginationData } from '@/types';
import { type CollectionDay } from '@/types/pre-order';
import { Head, router, useForm } from '@inertiajs/react';
import { PlusIcon, SearchIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Collection Days', href: '/settings/collection-days' },
];

type Props = {
    collectionDays: PaginationData<CollectionDay>;
    holidays: { id: number; name: string }[];
    filters: {
        search?: string;
        status?: string;
    };
};

export default function Index({ collectionDays, holidays, filters }: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingDay, setEditingDay] = useState<CollectionDay | null>(null);
    const [search, setSearch] = useState(filters.search || '');

    const createForm = useForm({
        name: '',
        display_order: '0',
        status: 'Active' as 'Active' | 'Inactive',
        holiday_id: '',
    });

    const editForm = useForm({
        name: '',
        display_order: '0',
        status: 'Active' as 'Active' | 'Inactive',
        holiday_id: '',
    });

    const handleSearch = () => {
        router.get('/settings/collection-days', { search }, { preserveState: true });
    };

    const handleCreate: FormEventHandler = (e) => {
        e.preventDefault();
        createForm.post(route('collection-days.store'), {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEdit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!editingDay) return;

        editForm.put(route('collection-days.update', editingDay.id), {
            onSuccess: () => {
                setIsEditOpen(false);
                setEditingDay(null);
                editForm.reset();
            },
        });
    };

    const openEditDialog = (day: CollectionDay) => {
        setEditingDay(day);
        editForm.setData({
            name: day.name,
            display_order: day.display_order.toString(),
            status: day.status,
            holiday_id: day.holiday_id ? day.holiday_id.toString() : '',
        });
        setIsEditOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this collection day?')) {
            router.delete(route('collection-days.destroy', id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Collection Days" />

            <div className="container mx-auto p-6 space-y-6">
                {/* Header with Create Button */}
                <div className="flex items-center justify-between">
                    <Heading
                        title="Collection Days"
                        description="Manage collection days (Eve, Christmas, After Christmas, etc.)"
                    />
                    <Button onClick={() => setIsCreateOpen(true)}>
                        <PlusIcon className="mr-2 size-4" />
                        Add Collection Day
                    </Button>
                </div>

                {/* Search Bar */}
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search collection days..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="pl-10"
                        />
                    </div>
                    <Button onClick={handleSearch}>Search</Button>
                </div>

                {/* Collection Days Table */}
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Holiday</TableHead>
                                <TableHead>Display Order</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {collectionDays.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                                        No collection days found. Click "Add Collection Day" to create one.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                collectionDays.data.map((day) => (
                                    <TableRow key={day.id}>
                                        <TableCell className="font-medium">{day.name}</TableCell>
                                        <TableCell>{day.holiday?.name || '-'}</TableCell>
                                        <TableCell>{day.display_order}</TableCell>
                                        <TableCell>
                                            <span
                                                className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${day.status === 'Active'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                                                    }`}
                                            >
                                                {day.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openEditDialog(day)}
                                                >
                                                    <PencilIcon className="size-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(day.id)}
                                                >
                                                    <Trash2Icon className="size-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Collection Day</DialogTitle>
                        <DialogDescription>Create a new collection day</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g., Christmas Eve, Christmas, After Christmas"
                                value={createForm.data.name}
                                onChange={(e) => createForm.setData('name', e.target.value)}
                                required
                            />
                            <InputError message={createForm.errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="display_order">Display Order</Label>
                            <Input
                                id="display_order"
                                type="number"
                                min="0"
                                value={createForm.data.display_order}
                                onChange={(e) => createForm.setData('display_order', e.target.value)}
                                required
                            />
                            <p className="text-xs text-muted-foreground">Lower numbers appear first</p>
                            <InputError message={createForm.errors.display_order} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="holiday_id">Holiday (Optional)</Label>
                            <Select
                                value={createForm.data.holiday_id}
                                onValueChange={(value) => createForm.setData('holiday_id', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a holiday" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {holidays.map((holiday) => (
                                        <SelectItem key={holiday.id} value={holiday.id.toString()}>
                                            {holiday.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={createForm.errors.holiday_id} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={createForm.data.status}
                                onValueChange={(value) => createForm.setData('status', value as 'Active' | 'Inactive')}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={createForm.errors.status} />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createForm.processing}>
                                Create Collection Day
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Collection Day</DialogTitle>
                        <DialogDescription>Update collection day details</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEdit} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit_name">Name</Label>
                            <Input
                                id="edit_name"
                                value={editForm.data.name}
                                onChange={(e) => editForm.setData('name', e.target.value)}
                                required
                            />
                            <InputError message={editForm.errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit_display_order">Display Order</Label>
                            <Input
                                id="edit_display_order"
                                type="number"
                                min="0"
                                value={editForm.data.display_order}
                                onChange={(e) => editForm.setData('display_order', e.target.value)}
                                required
                            />
                            <p className="text-xs text-muted-foreground">Lower numbers appear first</p>
                            <InputError message={editForm.errors.display_order} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit_holiday_id">Holiday (Optional)</Label>
                            <Select
                                value={editForm.data.holiday_id}
                                onValueChange={(value) => editForm.setData('holiday_id', value === 'none' ? '' : value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a holiday" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {holidays.map((holiday) => (
                                        <SelectItem key={holiday.id} value={holiday.id.toString()}>
                                            {holiday.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={editForm.errors.holiday_id} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit_status">Status</Label>
                            <Select
                                value={editForm.data.status}
                                onValueChange={(value) => editForm.setData('status', value as 'Active' | 'Inactive')}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={editForm.errors.status} />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={editForm.processing}>
                                Update Collection Day
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
