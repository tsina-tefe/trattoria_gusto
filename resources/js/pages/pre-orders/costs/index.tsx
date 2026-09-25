import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';
import {
    BarChart3,
    Plus,
    Pencil,
    Trash2,
    X,
    Check,
    AlertCircle,
    Calendar,
    DollarSign,
    StickyNote,
    Tag,
    Filter,
    Package,
    TrendingUp,
    Save,
    Loader2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
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
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Pre-Orders', href: '/pre-orders' },
    { title: 'Cost Records', href: '/pre-orders/costs' },
];

type Category = {
    id: number;
    name: string;
};

type Holiday = {
    id: number;
    name: string;
    date: string;
};

type User = {
    id: number;
    name: string;
};

type ActiveProduct = {
    id: number;
    product_name: string;
    unit_price: number;
    existing_cost?: number | null;
};

type CostEntry = {
    id: number;
    category_id: number;
    holiday_id: number;
    amount: number;
    date: string;
    notes?: string;
    created_by: number;
    category: Category;
    holiday: Holiday;
    creator: User;
};

type PaginatedCosts = {
    data: CostEntry[];
    current_page: number;
    last_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

type Props = {
    costs: PaginatedCosts;
    categories: Category[];
    holidays: Holiday[];
    flash?: { success?: string; error?: string };
};

export default function CostRecords({ costs, categories, holidays }: Props) {
    // Cost records state
    const [showCreate, setShowCreate] = useState(false);
    const [editCost, setEditCost] = useState<CostEntry | null>(null);
    const [deleteCost, setDeleteCost] = useState<CostEntry | null>(null);
    const [filterHoliday, setFilterHoliday] = useState<string>('all');

    // Product cost management state
    const [activeProducts, setActiveProducts] = useState<ActiveProduct[]>([]);
    const [productHoliday, setProductHoliday] = useState<string>(holidays[0]?.id?.toString() || '');
    const [productCosts, setProductCosts] = useState<Record<number, string>>({});
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [savingProducts, setSavingProducts] = useState(false);

    // Create form
    const createForm = useForm({
        category_id: '',
        holiday_id: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
    });

    // Edit form
    const editForm = useForm({
        category_id: '',
        holiday_id: '',
        amount: '',
        date: '',
        notes: '',
    });

    // Load active products when holiday changes
    const loadProducts = useCallback((holidayId: string) => {
        if (!holidayId) return;
        setLoadingProducts(true);
        fetch(`/pre-orders/costs/active-products?holiday_id=${holidayId}`)
            .then(res => {
                if (!res.ok) return [];
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    setActiveProducts(data);
                    // Pre-fill existing costs
                    const existing: Record<number, string> = {};
                    data.forEach((p: ActiveProduct) => {
                        if (p.existing_cost !== null && p.existing_cost !== undefined) {
                            existing[p.id] = p.existing_cost.toString();
                        }
                    });
                    setProductCosts(existing);
                }
            })
            .catch(() => {})
            .finally(() => setLoadingProducts(false));
    }, []);

    // Load products on mount and when holiday changes
    useEffect(() => {
        if (productHoliday) {
            loadProducts(productHoliday);
        }
    }, [productHoliday, loadProducts]);

    const openEdit = (cost: CostEntry) => {
        setEditCost(cost);
        editForm.setData({
            category_id: cost.category_id?.toString() || '',
            holiday_id: cost.holiday_id.toString(),
            amount: cost.amount?.toString() || '',
            date: cost.date.slice(0, 10),
            notes: cost.notes || '',
        });
    };

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/pre-orders/costs', {
            preserveScroll: true,
            onSuccess: () => {
                createForm.reset();
                setShowCreate(false);
            },
        });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editCost) return;
        editForm.put(`/pre-orders/costs/${editCost.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setEditCost(null);
                editForm.reset();
            },
        });
    };

    const confirmDelete = () => {
        if (!deleteCost) return;
        router.delete(`/pre-orders/costs/${deleteCost.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteCost(null);
            },
        });
    };

    const saveProductCosts = () => {
        const entries = Object.entries(productCosts)
            .filter(([, cost]) => cost !== '' && parseFloat(cost) > 0)
            .map(([productId, cost]) => ({
                pre_order_product_id: parseInt(productId),
                cost_per_unit: parseFloat(cost),
            }));

        if (entries.length === 0) return;

        setSavingProducts(true);
        router.post('/pre-orders/costs/bulk-update-products', {
            holiday_id: productHoliday,
            product_costs: entries,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setSavingProducts(false);
                loadProducts(productHoliday);
            },
            onError: () => setSavingProducts(false),
        });
    };

    const formatCurrency = (val: string | number) =>
        Number(val).toLocaleString('en-ET', { style: 'currency', currency: 'ETB' });

    const formatDate = (val: string) =>
        new Date(val).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    // Client-side holiday filter for cost records
    const displayed = filterHoliday === 'all'
        ? costs.data
        : costs.data.filter(c => c.holiday_id.toString() === filterHoliday);

    // Total for displayed rows
    const displayedTotal = displayed.reduce((sum, c) => sum + Number(c.amount), 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Cost Records" />

            <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8">

                {/* Header */}
                <div className="relative overflow-hidden rounded-2xl bg-primary text-primary-foreground p-8 shadow-lg">
                    <div className="absolute -right-20 -top-20 size-64 rounded-full bg-background/10 blur-3xl" />
                    <div className="relative z-10 flex items-center justify-between gap-6 flex-wrap">
                        <div className="flex items-center gap-6">
                            <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-background/10 shadow-inner backdrop-blur-md border border-primary-foreground/20">
                                <BarChart3 className="size-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Cost Records</h1>
                                <p className="mt-2 text-primary-foreground/90 text-lg font-medium">
                                    Track expenses for each holiday pre-order campaign.
                                </p>
                            </div>
                        </div>
                        <Button
                            id="btn-add-cost"
                            variant="secondary"
                            className="shrink-0 gap-2 shadow-lg"
                            onClick={() => setShowCreate(true)}
                            disabled={categories.length === 0}
                        >
                            <Plus className="size-4" />
                            Record Cost
                        </Button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <Card className="border shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <DollarSign className="size-4" /> Total Expenses (Page)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-foreground">{formatCurrency(displayedTotal)}</p>
                        </CardContent>
                    </Card>
                    <Card className="border shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Tag className="size-4" /> Categories
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-foreground">{categories.length}</p>
                        </CardContent>
                    </Card>
                    <Card className="border shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <StickyNote className="size-4" /> Records Shown
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-foreground">{displayed.length} <span className="text-sm font-normal text-muted-foreground">/ {costs.total}</span></p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter Row */}
                <div className="flex flex-wrap items-end gap-3">
                    <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
                            <Filter className="size-3 inline mr-1" />Holiday
                        </span>
                        <Select value={filterHoliday} onValueChange={setFilterHoliday}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="All Holidays" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Holidays</SelectItem>
                                {holidays.map(h => (
                                    <SelectItem key={h.id} value={h.id.toString()}>
                                        {h.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Category CTA if none exist */}
                {categories.length === 0 ? (
                    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-muted/20 text-center p-10">
                        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
                            <Tag className="size-7 text-muted-foreground" />
                        </div>
                        <p className="text-lg font-semibold text-foreground">No categories defined yet</p>
                        <p className="mt-1 text-sm text-muted-foreground max-w-md">
                            You need to create at least one cost category before recording expenses.
                        </p>
                        <Button className="mt-6 gap-2" onClick={() => router.visit('/pre-orders/costs/categories')}>
                            <Plus className="size-4" /> Setup Categories
                        </Button>
                    </div>
                ) : displayed.length === 0 ? (
                    <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-muted/20 text-center p-10">
                        <p className="text-lg font-semibold text-foreground">No cost records found</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {filterHoliday !== 'all' ? 'Try a different holiday filter, or r' : 'R'}ecord your first expense.
                        </p>
                    </div>
                ) : (
                    /* Cost Records Table */
                    <Card className="border shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/40">
                                        <TableHead className="font-semibold">Date</TableHead>
                                        <TableHead className="font-semibold">Category</TableHead>
                                        <TableHead className="font-semibold">Holiday</TableHead>
                                        <TableHead className="font-semibold text-right">Amount</TableHead>
                                        <TableHead className="font-semibold">Notes</TableHead>
                                        <TableHead className="font-semibold">Recorded By</TableHead>
                                        <TableHead className="font-semibold text-center w-[100px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {displayed.map((cost) => (
                                        <TableRow key={cost.id} className="group hover:bg-muted/20 transition-colors">
                                            <TableCell className="whitespace-nowrap">
                                                <span className="flex items-center gap-1.5 text-sm">
                                                    <Calendar className="size-3.5 text-muted-foreground" />
                                                    {formatDate(cost.date)}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="font-medium">{cost.category?.name}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-medium">{cost.holiday?.name}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-mono font-semibold text-foreground">
                                                {formatCurrency(cost.amount)}
                                            </TableCell>
                                            <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                                                {cost.notes || '—'}
                                            </TableCell>
                                            <TableCell className="text-sm">{cost.creator?.name}</TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        id={`btn-edit-cost-${cost.id}`}
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-8 text-muted-foreground hover:text-foreground"
                                                        onClick={() => openEdit(cost)}
                                                    >
                                                        <Pencil className="size-3.5" />
                                                    </Button>
                                                    <Button
                                                        id={`btn-delete-cost-${cost.id}`}
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-8 text-muted-foreground hover:text-destructive"
                                                        onClick={() => setDeleteCost(cost)}
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {/* Total Row */}
                                    <TableRow className="bg-muted/30 font-semibold border-t-2">
                                        <TableCell colSpan={3} className="text-right text-sm text-muted-foreground">
                                            Page Total
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-primary text-base">
                                            {formatCurrency(displayedTotal)}
                                        </TableCell>
                                        <TableCell colSpan={3} />
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                )}

                {/* Pagination */}
                {costs.last_page > 1 && (
                    <div className="flex items-center justify-center gap-1 pt-2">
                        {costs.links.map((link, idx) => (
                            <Button
                                key={idx}
                                variant={link.active ? 'default' : 'ghost'}
                                size="sm"
                                disabled={!link.url}
                                className="min-w-[36px] px-3 text-xs"
                                onClick={() => link.url && router.visit(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* Product Cost Management — Always visible, own holiday     */}
                {/* ═══════════════════════════════════════════════════════════ */}
                <Card className="border shadow-sm overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-3">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                                    <Package className="size-5 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-bold">Product Cost Management</CardTitle>
                                    <p className="text-sm text-muted-foreground mt-0.5">
                                        Set cost per unit for each product per holiday to track margins.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                        Set costs for
                                    </span>
                                    <Select value={productHoliday} onValueChange={setProductHoliday}>
                                        <SelectTrigger id="product-holiday-select" className="w-[200px]">
                                            <SelectValue placeholder="Select holiday" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {holidays.map(h => (
                                                <SelectItem key={h.id} value={h.id.toString()}>
                                                    {h.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {!productHoliday ? (
                            <div className="flex min-h-[150px] items-center justify-center text-muted-foreground p-6">
                                <p>Select a holiday above to manage product costs.</p>
                            </div>
                        ) : loadingProducts ? (
                            <div className="flex min-h-[150px] items-center justify-center gap-2 text-muted-foreground p-6">
                                <Loader2 className="size-5 animate-spin" />
                                <p>Loading products...</p>
                            </div>
                        ) : activeProducts.length === 0 ? (
                            <div className="flex min-h-[150px] items-center justify-center text-muted-foreground p-6">
                                <p>No active products found.</p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/30">
                                                <TableHead className="font-semibold">Product</TableHead>
                                                <TableHead className="font-semibold text-right">Selling Price</TableHead>
                                                <TableHead className="font-semibold text-right w-[160px]">Cost / Unit (ETB)</TableHead>
                                                <TableHead className="font-semibold text-right">Margin</TableHead>
                                                <TableHead className="font-semibold text-right">Margin %</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {activeProducts.map((product) => {
                                                const costVal = parseFloat(productCosts[product.id] || '0') || 0;
                                                const sellingPrice = Number(product.unit_price);
                                                const margin = sellingPrice - costVal;
                                                const marginPct = sellingPrice > 0 ? (margin / sellingPrice) * 100 : 0;
                                                const hasCost = productCosts[product.id] !== undefined && productCosts[product.id] !== '';

                                                return (
                                                    <TableRow key={product.id} className="hover:bg-muted/10 transition-colors">
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                                                    <Package className="size-4 text-primary" />
                                                                </div>
                                                                <span className="font-medium">{product.product_name}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right font-mono text-sm">
                                                            {formatCurrency(sellingPrice)}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Input
                                                                id={`product-cost-${product.id}`}
                                                                type="number"
                                                                step="0.01"
                                                                min="0"
                                                                placeholder="0.00"
                                                                className="w-[140px] ml-auto text-right font-mono"
                                                                value={productCosts[product.id] ?? ''}
                                                                onChange={(e) => setProductCosts(prev => ({
                                                                    ...prev,
                                                                    [product.id]: e.target.value,
                                                                }))}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {hasCost ? (
                                                                <span className={`font-mono font-semibold ${margin >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>
                                                                    {formatCurrency(margin)}
                                                                </span>
                                                            ) : (
                                                                <span className="text-muted-foreground">—</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {hasCost ? (
                                                                <Badge
                                                                    variant={marginPct >= 30 ? 'default' : marginPct >= 0 ? 'secondary' : 'destructive'}
                                                                    className="font-mono text-xs"
                                                                >
                                                                    <TrendingUp className="size-3 mr-1" />
                                                                    {marginPct.toFixed(1)}%
                                                                </Badge>
                                                            ) : (
                                                                <span className="text-muted-foreground">—</span>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-muted/20">
                                    <span className="text-sm text-muted-foreground">
                                        {Object.values(productCosts).filter(v => v !== '' && parseFloat(v) > 0).length} of {activeProducts.length} products with costs
                                    </span>
                                    <Button
                                        id="btn-save-product-costs"
                                        onClick={saveProductCosts}
                                        disabled={savingProducts}
                                        className="gap-2"
                                    >
                                        {savingProducts ? (
                                            <>
                                                <Loader2 className="size-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="size-4" />
                                                Save All Costs
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Create Dialog */}
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Plus className="size-5 text-primary" /> Record Expense
                        </DialogTitle>
                        <DialogDescription>
                            Select a category, holiday, amount and date.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitCreate} className="space-y-4 mt-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label>Category <span className="text-destructive">*</span></Label>
                                <Select value={createForm.data.category_id} onValueChange={v => createForm.setData('category_id', v)}>
                                    <SelectTrigger id="create-category">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map(c => (
                                            <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {createForm.errors.category_id && (
                                    <p className="text-xs text-destructive">{createForm.errors.category_id}</p>
                                )}
                                {createForm.errors.category_id && (
                                    <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="size-3" /> {createForm.errors.category_id}</p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label>Holiday <span className="text-destructive">*</span></Label>
                                <Select value={createForm.data.holiday_id} onValueChange={v => createForm.setData('holiday_id', v)}>
                                    <SelectTrigger id="create-holiday">
                                        <SelectValue placeholder="Select holiday" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {holidays.map(h => (
                                            <SelectItem key={h.id} value={h.id.toString()}>{h.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {createForm.errors.holiday_id && (
                                    <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="size-3" /> {createForm.errors.holiday_id}</p>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="create-amount">Amount (ETB) <span className="text-destructive">*</span></Label>
                                <Input
                                    id="create-amount"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={createForm.data.amount}
                                    onChange={e => createForm.setData('amount', e.target.value)}
                                    placeholder="0.00"
                                    required
                                />
                                {createForm.errors.amount && (
                                    <p className="text-xs text-destructive">{createForm.errors.amount}</p>
                                )}
                                {createForm.errors.amount && (
                                    <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="size-3" /> {createForm.errors.amount}</p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="create-date">Date <span className="text-destructive">*</span></Label>
                                <Input
                                    id="create-date"
                                    type="date"
                                    value={createForm.data.date}
                                    onChange={e => createForm.setData('date', e.target.value)}
                                    required
                                />
                                {createForm.errors.date && (
                                    <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="size-3" /> {createForm.errors.date}</p>
                                )}
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="create-notes">Notes <span className="text-muted-foreground text-xs">(optional)</span></Label>
                            <Textarea
                                id="create-notes"
                                value={createForm.data.notes}
                                onChange={e => createForm.setData('notes', e.target.value)}
                                placeholder="e.g. Purchased 500 boxes from XYZ supplier"
                                rows={2}
                            />
                        </div>
                        <DialogFooter className="gap-2 pt-2">
                            <Button type="button" variant="ghost" onClick={() => { setShowCreate(false); createForm.reset(); }}>
                                <X className="size-4 mr-1.5" /> Cancel
                            </Button>
                            <Button id="btn-create-cost-submit" type="submit" disabled={createForm.processing}>
                                {createForm.processing ? (
                                    <span className="flex items-center gap-2"><Loader2 className="size-4 animate-spin" /> Saving...</span>
                                ) : (
                                    <span className="flex items-center gap-2"><Check className="size-4" /> Record Cost</span>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editCost} onOpenChange={open => { if (!open) setEditCost(null); }}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Pencil className="size-5 text-primary" /> Edit Cost Entry
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitEdit} className="space-y-4 mt-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label>Category <span className="text-destructive">*</span></Label>
                                <Select value={editForm.data.category_id} onValueChange={v => editForm.setData('category_id', v)}>
                                    <SelectTrigger id="edit-category">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map(c => (
                                            <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {editForm.errors.category_id && (
                                    <p className="text-xs text-destructive">{editForm.errors.category_id}</p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label>Holiday <span className="text-destructive">*</span></Label>
                                <Select value={editForm.data.holiday_id} onValueChange={v => editForm.setData('holiday_id', v)}>
                                    <SelectTrigger id="edit-holiday">
                                        <SelectValue placeholder="Select holiday" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {holidays.map(h => (
                                            <SelectItem key={h.id} value={h.id.toString()}>{h.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-amount">Amount (ETB) <span className="text-destructive">*</span></Label>
                                <Input
                                    id="edit-amount"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={editForm.data.amount}
                                    onChange={e => editForm.setData('amount', e.target.value)}
                                    required
                                />
                                {editForm.errors.amount && (
                                    <p className="text-xs text-destructive">{editForm.errors.amount}</p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-date">Date <span className="text-destructive">*</span></Label>
                                <Input
                                    id="edit-date"
                                    type="date"
                                    value={editForm.data.date}
                                    onChange={e => editForm.setData('date', e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="edit-notes">Notes</Label>
                            <Textarea
                                id="edit-notes"
                                value={editForm.data.notes}
                                onChange={e => editForm.setData('notes', e.target.value)}
                                rows={2}
                            />
                        </div>
                        <DialogFooter className="gap-2 pt-2">
                            <Button type="button" variant="ghost" onClick={() => setEditCost(null)}>
                                <X className="size-4 mr-1.5" /> Cancel
                            </Button>
                            <Button id="btn-edit-cost-submit" type="submit" disabled={editForm.processing}>
                                {editForm.processing ? (
                                    <span className="flex items-center gap-2"><Loader2 className="size-4 animate-spin" /> Saving...</span>
                                ) : (
                                    <span className="flex items-center gap-2"><Check className="size-4" /> Save Changes</span>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirm Dialog */}
            <Dialog open={!!deleteCost} onOpenChange={open => { if (!open) setDeleteCost(null); }}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <Trash2 className="size-5" /> Delete Cost Entry
                        </DialogTitle>
                        <DialogDescription className="pt-1">
                            Are you sure you want to delete this <strong>{formatCurrency(deleteCost?.amount ?? 0)}</strong> entry
                            for <strong>{deleteCost?.category?.name}</strong>? This cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 mt-2">
                        <Button variant="ghost" onClick={() => setDeleteCost(null)}>Cancel</Button>
                        <Button
                            id="btn-confirm-delete-cost"
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
