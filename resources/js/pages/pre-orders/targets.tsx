import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Target } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger
} from '@/components/ui/dialog';
import { type SharedData } from '@/types';
import { useEffect } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Pre-Orders', href: '/pre-orders' },
    { title: 'Targets', href: '/pre-order-targets' },
];

type TargetRow = {
    id: number;
    holiday: { id: number; name: string } | null;
    order_type: { id: number; name: string } | null;
    target_count: number;
    created_at: string;
};

type Props = {
    targets: TargetRow[];
    holidays: { id: number; name: string }[];
    orderTypes: { id: number; name: string }[];
};

export default function TargetsPage({ targets, holidays, orderTypes }: Props) {
    const [createOpen, setCreateOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<TargetRow | null>(null);

    const { flash } = usePage<SharedData>().props;

    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
    }, [flash.success, flash.error]);

    const createForm = useForm({
        holiday_id: '',
        order_type_id: '',
        target_count: '',
    });

    const editForm = useForm({
        target_count: '',
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('pre-order-targets.store'), {
            onSuccess: () => { createForm.reset(); setCreateOpen(false); },
        });
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editTarget) return;
        editForm.put(route('pre-order-targets.update', editTarget.id), {
            onSuccess: () => { editForm.reset(); setEditTarget(null); },
        });
    };

    const handleDelete = (id: number) => {
        if (!confirm('Delete this target?')) return;
        router.delete(route('pre-order-targets.destroy', id));
    };

    const openEdit = (t: TargetRow) => {
        setEditTarget(t);
        editForm.setData('target_count', String(t.target_count));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pre-Order Targets" />
            <div className="container mx-auto space-y-6 p-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                            <Target className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Pre-Order Targets</h1>
                            <p className="text-sm text-muted-foreground">
                                Set paid-order targets per holiday and order type for KPI tracking.
                            </p>
                        </div>
                    </div>

                    <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" /> New Target
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create Target</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreate} className="space-y-4 pt-2">
                                <div className="space-y-1">
                                    <Label>Holiday *</Label>
                                    <Select
                                        value={createForm.data.holiday_id}
                                        onValueChange={v => createForm.setData('holiday_id', v)}
                                    >
                                        <SelectTrigger><SelectValue placeholder="Select holiday" /></SelectTrigger>
                                        <SelectContent>
                                            {holidays.map(h => <SelectItem key={h.id} value={String(h.id)}>{h.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    {createForm.errors.holiday_id && <p className="text-xs text-destructive">{createForm.errors.holiday_id}</p>}
                                </div>

                                <div className="space-y-1">
                                    <Label>Order Type <span className="text-muted-foreground">(optional — blank = applies to all)</span></Label>
                                    <Select
                                        value={createForm.data.order_type_id || 'all'}
                                        onValueChange={v => createForm.setData('order_type_id', v === 'all' ? '' : v)}
                                    >
                                        <SelectTrigger><SelectValue placeholder="All order types" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All order types</SelectItem>
                                            {orderTypes.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1">
                                    <Label>Target (paid orders) *</Label>
                                    <Input
                                        type="number"
                                        min={1}
                                        value={createForm.data.target_count}
                                        onChange={e => createForm.setData('target_count', e.target.value)}
                                        placeholder="e.g. 500"
                                    />
                                    {createForm.errors.target_count && <p className="text-xs text-destructive">{createForm.errors.target_count}</p>}
                                </div>

                                <DialogFooter>
                                    <Button type="submit" disabled={createForm.processing}>Save Target</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Targets</CardTitle>
                        <CardDescription>{targets.length} target{targets.length !== 1 ? 's' : ''} configured</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {targets.length === 0 ? (
                            <p className="py-8 text-center text-muted-foreground">No targets yet. Click "New Target" to create one.</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Holiday</TableHead>
                                        <TableHead>Order Type</TableHead>
                                        <TableHead className="text-right">Target (paid orders)</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {targets.map(t => (
                                        <TableRow key={t.id}>
                                            <TableCell className="font-medium">{t.holiday?.name ?? '—'}</TableCell>
                                            <TableCell>{t.order_type?.name ?? <span className="text-muted-foreground italic">All types</span>}</TableCell>
                                            <TableCell className="text-right font-bold">{t.target_count.toLocaleString()}</TableCell>
                                            <TableCell className="text-muted-foreground text-sm">{t.created_at}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => openEdit(t)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(t.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Edit Dialog */}
            <Dialog open={!!editTarget} onOpenChange={open => { if (!open) setEditTarget(null); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Target — {editTarget?.holiday?.name} / {editTarget?.order_type?.name ?? 'All types'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEdit} className="space-y-4 pt-2">
                        <div className="space-y-1">
                            <Label>Target (paid orders) *</Label>
                            <Input
                                type="number"
                                min={1}
                                value={editForm.data.target_count}
                                onChange={e => editForm.setData('target_count', e.target.value)}
                            />
                            {editForm.errors.target_count && <p className="text-xs text-destructive">{editForm.errors.target_count}</p>}
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={editForm.processing}>Update</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
