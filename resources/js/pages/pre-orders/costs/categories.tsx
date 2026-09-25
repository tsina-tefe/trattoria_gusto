import { type BreadcrumbItem } from '@/types';
import { Head, useForm, router } from '@inertiajs/react';
import { toast } from 'sonner';
import { useState } from 'react';
import {
    FolderKey,
    Plus,
    Pencil,
    Trash2,
    X,
    Check,
    AlertCircle,
    Tag,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Pre-Orders', href: '/pre-orders' },
    { title: 'Cost Categories', href: '/pre-orders/costs/categories' },
];

type Category = {
    id: number;
    name: string;
    description: string | null;
    costs_count?: number;
};

type Props = {
    categories: Category[];
    flash?: { success?: string; error?: string };
};

export default function CostCategories({ categories, flash }: Props) {
    const [showCreate, setShowCreate] = useState(false);
    const [editCategory, setEditCategory] = useState<Category | null>(null);
    const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);

    // Create Form
    const createForm = useForm({ name: '', description: '' });

    // Edit Form
    const editForm = useForm({ name: '', description: '' });

    const openEdit = (cat: Category) => {
        setEditCategory(cat);
        editForm.setData({ name: cat.name, description: cat.description ?? '' });
    };

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/pre-orders/costs/categories', {
            preserveScroll: true,
            onSuccess: (page: any) => {
                toast.success(page.props.flash?.success ?? 'Category created.');
                createForm.reset();
                setShowCreate(false);
            },
            onError: () => toast.error('Failed to create category.'),
        });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editCategory) return;
        editForm.put(`/pre-orders/costs/categories/${editCategory.id}`, {
            preserveScroll: true,
            onSuccess: (page: any) => {
                toast.success(page.props.flash?.success ?? 'Category updated.');
                setEditCategory(null);
            },
            onError: () => toast.error('Failed to update category.'),
        });
    };

    const confirmDelete = () => {
        if (!deleteCategory) return;
        router.delete(`/pre-orders/costs/categories/${deleteCategory.id}`, {
            preserveScroll: true,
            onSuccess: (page: any) => {
                const flash = (page.props as any).flash;
                if (flash?.error) {
                    toast.error(flash.error);
                } else {
                    toast.success(flash?.success ?? 'Category deleted.');
                }
                setDeleteCategory(null);
            },
            onError: () => toast.error('Failed to delete category.'),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Cost Categories" />

            <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
                {/* Header */}
                <div className="relative overflow-hidden rounded-2xl bg-primary text-primary-foreground p-8 shadow-lg">
                    <div className="absolute -right-20 -top-20 size-64 rounded-full bg-background/10 blur-3xl" />
                    <div className="relative z-10 flex items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-background/10 shadow-inner backdrop-blur-md border border-primary-foreground/20">
                                <FolderKey className="size-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Cost Categories</h1>
                                <p className="mt-2 text-primary-foreground/90 text-lg font-medium">
                                    Define expense types for your pre-order campaigns.
                                </p>
                            </div>
                        </div>
                        <Button
                            id="btn-add-category"
                            variant="secondary"
                            className="shrink-0 gap-2 shadow-lg"
                            onClick={() => setShowCreate(true)}
                        >
                            <Plus className="size-4" />
                            Add Category
                        </Button>
                    </div>
                </div>

                {/* Categories Grid */}
                {categories.length === 0 ? (
                    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-muted/20 text-center p-10">
                        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
                            <Tag className="size-7 text-muted-foreground" />
                        </div>
                        <p className="text-lg font-semibold text-foreground">No categories yet</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Create your first expense category to start tracking costs.
                        </p>
                        <Button className="mt-6 gap-2" onClick={() => setShowCreate(true)}>
                            <Plus className="size-4" /> Add First Category
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {categories.map((cat) => (
                            <Card
                                key={cat.id}
                                className="group border shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                <FolderKey className="size-5" />
                                            </div>
                                            <CardTitle className="text-base leading-tight">{cat.name}</CardTitle>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                id={`btn-edit-category-${cat.id}`}
                                                size="icon"
                                                variant="ghost"
                                                className="size-8 text-muted-foreground hover:text-foreground"
                                                onClick={() => openEdit(cat)}
                                            >
                                                <Pencil className="size-3.5" />
                                            </Button>
                                            <Button
                                                id={`btn-delete-category-${cat.id}`}
                                                size="icon"
                                                variant="ghost"
                                                className="size-8 text-muted-foreground hover:text-destructive"
                                                onClick={() => setDeleteCategory(cat)}
                                            >
                                                <Trash2 className="size-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                {cat.description && (
                                    <CardContent className="pt-0">
                                        <CardDescription className="text-sm">{cat.description}</CardDescription>
                                    </CardContent>
                                )}
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Dialog */}
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Plus className="size-5 text-primary" /> New Cost Category
                        </DialogTitle>
                        <DialogDescription>
                            Give your category a clear name (e.g. "Ingredients", "Packaging").
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitCreate} className="space-y-4 mt-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="create-name">Name <span className="text-destructive">*</span></Label>
                            <Input
                                id="create-name"
                                value={createForm.data.name}
                                onChange={e => createForm.setData('name', e.target.value)}
                                placeholder="e.g. Packaging"
                                required
                            />
                            {createForm.errors.name && (
                                <p className="text-xs text-destructive flex items-center gap-1">
                                    <AlertCircle className="size-3" /> {createForm.errors.name}
                                </p>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="create-description">Description <span className="text-muted-foreground text-xs">(optional)</span></Label>
                            <Textarea
                                id="create-description"
                                value={createForm.data.description}
                                onChange={e => createForm.setData('description', e.target.value)}
                                placeholder="Brief description of this expense type..."
                                rows={3}
                            />
                        </div>
                        <DialogFooter className="gap-2 pt-2">
                            <Button type="button" variant="ghost" onClick={() => { setShowCreate(false); createForm.reset(); }}>
                                <X className="size-4 mr-1.5" /> Cancel
                            </Button>
                            <Button id="btn-create-category-submit" type="submit" disabled={createForm.processing}>
                                {createForm.processing ? (
                                    <span className="flex items-center gap-2"><div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</span>
                                ) : (
                                    <span className="flex items-center gap-2"><Check className="size-4" /> Create Category</span>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editCategory} onOpenChange={open => { if (!open) setEditCategory(null); }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Pencil className="size-5 text-primary" /> Edit Category
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitEdit} className="space-y-4 mt-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="edit-name">Name <span className="text-destructive">*</span></Label>
                            <Input
                                id="edit-name"
                                value={editForm.data.name}
                                onChange={e => editForm.setData('name', e.target.value)}
                                required
                            />
                            {editForm.errors.name && (
                                <p className="text-xs text-destructive flex items-center gap-1">
                                    <AlertCircle className="size-3" /> {editForm.errors.name}
                                </p>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea
                                id="edit-description"
                                value={editForm.data.description}
                                onChange={e => editForm.setData('description', e.target.value)}
                                rows={3}
                            />
                        </div>
                        <DialogFooter className="gap-2 pt-2">
                            <Button type="button" variant="ghost" onClick={() => setEditCategory(null)}>
                                <X className="size-4 mr-1.5" /> Cancel
                            </Button>
                            <Button id="btn-edit-category-submit" type="submit" disabled={editForm.processing}>
                                {editForm.processing ? (
                                    <span className="flex items-center gap-2"><div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</span>
                                ) : (
                                    <span className="flex items-center gap-2"><Check className="size-4" /> Save Changes</span>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirm Dialog */}
            <Dialog open={!!deleteCategory} onOpenChange={open => { if (!open) setDeleteCategory(null); }}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <Trash2 className="size-5" /> Delete Category
                        </DialogTitle>
                        <DialogDescription className="pt-1">
                            Are you sure you want to delete <strong>"{deleteCategory?.name}"</strong>? This cannot be undone. Categories with existing cost records cannot be deleted.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 mt-2">
                        <Button variant="ghost" onClick={() => setDeleteCategory(null)}>Cancel</Button>
                        <Button
                            id="btn-confirm-delete-category"
                            variant="destructive"
                            onClick={confirmDelete}
                        >
                            <Trash2 className="size-4 mr-1.5" /> Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
