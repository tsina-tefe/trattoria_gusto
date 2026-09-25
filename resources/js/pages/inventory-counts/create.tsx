import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { useMemo, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { usePermission } from '@/hooks/user-permissions';
import type { Branch, ChildCategory, Product, InventoryPeriod } from '@/types/inventory-count';
import { CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

type FiscalYear = {
	id: number;
	name: string;
};

type PageProps = {
	branches: Branch[];
	userBranchId: number | null;
	canManageAllBranches: boolean;
	inventoryPeriods: InventoryPeriod[];
	childCategories: ChildCategory[];
	products: Product[];
};

type PreviousCount = {
	id: number;
	count: string;
	product_id: number;
};

type ModalState = {
	isOpen: boolean;
	type: 'success' | 'validation' | 'error';
	title: string;
	message: string;
	details?: string[];
};

export default function CreateInventoryCount({
	branches = [],
	userBranchId,
	canManageAllBranches = false,
	inventoryPeriods = [],
	childCategories = [],
	products = []
}: PageProps) {
	const { can } = usePermission();

	const [branchId, setBranchId] = useState<string>(userBranchId ? String(userBranchId) : '');
	const [inventoryPeriodId, setInventoryPeriodId] = useState<string>('');
	const [childCategoryId, setChildCategoryId] = useState<string>('');
	const [productCounts, setProductCounts] = useState<Record<number, string>>({});
	const [previousCounts, setPreviousCounts] = useState<Record<number, PreviousCount>>({});
	const [loadingPrevious, setLoadingPrevious] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [modal, setModal] = useState<ModalState>({ isOpen: false, type: 'success', title: '', message: '' });

	const filteredProducts = useMemo(() => {
		if (!childCategoryId) return [];
		return products.filter((p) => String(p.child_category_id) === childCategoryId);
	}, [products, childCategoryId]);

	// Fetch previous counts when category/period/branch changes
	useEffect(() => {
		if (branchId && inventoryPeriodId && childCategoryId) {
			setLoadingPrevious(true);
			axios.get(route('inventory-counts.previous'), {
				params: {
					branch_id: branchId,
					inventory_period_id: inventoryPeriodId,
					child_category_id: childCategoryId,
				}
			})
				.then((response) => {
					const counts = response.data.counts;
					setPreviousCounts(counts);

					// Pre-fill product counts with previous values
					const prefilledCounts: Record<number, string> = {};
					Object.values(counts).forEach((count: any) => {
						prefilledCounts[count.product_id] = count.count;
					});
					setProductCounts(prefilledCounts);

					// Show success message if previous counts found
					if (response.data.success && response.data.message) {
						toast.success(response.data.message);
					}
				})
				.catch((error) => {
					console.error('Failed to fetch previous counts:', error);
					const errorMessage = error.response?.data?.message || 'Unable to load previous counts';
					const errorDetails = error.response?.data?.details;

					if (errorDetails) {
						toast.error(errorMessage, { description: errorDetails });
					} else {
						toast.error(errorMessage);
					}
				})
				.finally(() => {
					setLoadingPrevious(false);
				});
		} else {
			setPreviousCounts({});
			setProductCounts({});
		}
	}, [branchId, inventoryPeriodId, childCategoryId]);

	const handleCountChange = (productId: number, value: string) => {
		setProductCounts((prev) => ({
			...prev,
			[productId]: value,
		}));
	};

	const getValidationError = (product: Product, value: string): string | null => {
		if (!value || value === '') return null;

		const numValue = parseFloat(value);
		if (isNaN(numValue)) return 'Invalid number';

		if (product.min_count_threshold !== null && product.min_count_threshold !== undefined) {
			if (numValue < product.min_count_threshold) {
				return `Minimum: ${product.min_count_threshold}`;
			}
		}

		if (product.max_count_threshold !== null && product.max_count_threshold !== undefined) {
			if (numValue > product.max_count_threshold) {
				return `Maximum: ${product.max_count_threshold}`;
			}
		}

		return null;
	};

	const handleSubmit = () => {
		if (!branchId || !inventoryPeriodId || !childCategoryId) {
			setModal({
				isOpen: true,
				type: 'error',
				title: 'Missing Fields',
				message: 'Please select branch, period, and category.'
			});
			return;
		}

		const countsData = [];
		const limitErrors: string[] = [];

		for (const product of filteredProducts) {
			const value = productCounts[product.id];
			if (!value || value === '') continue;

			const validationError = getValidationError(product, value);
			if (validationError) {
				limitErrors.push(`${product.product_name}: limit is ${validationError}`);
			}

			if (!validationError) {
				countsData.push({
					branch_id: Number(branchId),
					inventory_period_id: Number(inventoryPeriodId),
					child_category_id: Number(childCategoryId),
					product_id: product.id,
					count: parseFloat(value),
				});
			}
		}

		if (limitErrors.length > 0) {
			setModal({
				isOpen: true,
				type: 'validation',
				title: 'Limit Validation Error',
				message: 'Please resolve the following count limits before submitting:',
				details: limitErrors
			});
			return; // Stop submission if there are validation errors
		}

		if (countsData.length === 0) {
			setModal({
				isOpen: true,
				type: 'error',
				title: 'No Data',
				message: 'No valid counts entered to submit.'
			});
			return;
		}

		setIsSubmitting(true);
		router.post(route('inventory-counts.bulk'), { counts: countsData }, {
			preserveState: true,
			onSuccess: (page) => {
				setModal({
					isOpen: true,
					type: 'success',
					title: 'Success',
					message: (page.props as any).flash?.success || 'Counts successfully submitted and tracked.'
				});
			},
			onError: (errors) => {
				setModal({
					isOpen: true,
					type: 'error',
					title: 'Submission Failed',
					message: (errors as any).counts || 'Failed to submit counts to the server.'
				});
			},
			onFinish: () => {
				setIsSubmitting(false);
			}
		});
	};

	const hasAnyCounts = Object.values(productCounts).some(count => count && parseFloat(count) > 0);

	return (
		<AppLayout
			breadcrumbs={[
				{ title: 'Inventory Counts', href: '/inventory-counts' },
				{ title: 'Create', href: '/inventory-counts/create' },
			]}
		>
			<Head title="Create Inventory Count" />
			<div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-2 sm:p-4">
				<Card className="w-full max-w-6xl mx-auto">
					<CardHeader>
						<CardTitle className="text-xl sm:text-2xl">Create Inventory Count</CardTitle>
						<p className="text-sm text-muted-foreground mt-2">
							Enter the inventory amounts for the selected category. When finished, submit the counts to log them into the system. Previous counts will be shown if available.
						</p>
					</CardHeader>
					<CardContent className="p-4 sm:p-6">
						<div className="space-y-4 sm:space-y-6">
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
								<div className="space-y-2">
									<Label>Branch *</Label>
									<Select value={branchId} onValueChange={(value) => setBranchId(value)} disabled={!canManageAllBranches}>
										<SelectTrigger>
											<SelectValue placeholder="Select branch" />
										</SelectTrigger>
										<SelectContent>
											{branches.map((branch) => (
												<SelectItem key={branch.id} value={String(branch.id)}>
													{branch.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									{!canManageAllBranches && userBranchId && (
										<p className="text-sm text-muted-foreground">Restricted to your branch</p>
									)}
								</div>
								<div className="space-y-2">
									<Label>Inventory Period *</Label>
									<Select value={inventoryPeriodId} onValueChange={(value) => setInventoryPeriodId(value)}>
										<SelectTrigger>
											<SelectValue placeholder="Select inventory period" />
										</SelectTrigger>
										<SelectContent>
											{inventoryPeriods.length === 0 ? (
												<div className="p-2 text-sm text-muted-foreground">No active inventory periods available</div>
											) : (
												inventoryPeriods.map((period) => (
													<SelectItem key={period.id} value={String(period.id)}>
														{period.inventory_period_name}
													</SelectItem>
												))
											)}
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label>Child Category *</Label>
									<Select
										value={childCategoryId}
										onValueChange={(value) => {
											setChildCategoryId(value);
											setProductCounts({});
										}}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select category" />
										</SelectTrigger>
										<SelectContent>
											{childCategories.map((category) => (
												<SelectItem key={category.id} value={String(category.id)}>
													{category.child_name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>

							{childCategoryId && filteredProducts.length > 0 && (
								<div className="space-y-2 col-span-full">
									<div className="flex items-center justify-between">
										<Label className="text-sm sm:text-base">Products - Enter counts for each product:</Label>
										{loadingPrevious && (
											<div className="flex items-center gap-2 text-sm text-muted-foreground">
												<Loader2 className="h-4 w-4 animate-spin" />
												Loading previous counts...
											</div>
										)}
									</div>
									<div className="rounded-md border overflow-x-auto">
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead className="whitespace-nowrap">Product Name</TableHead>
													<TableHead className="whitespace-nowrap w-[120px]">Previous</TableHead>
													<TableHead className="whitespace-nowrap w-[200px]">Count</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{filteredProducts.map((product) => {
													const validationError = getValidationError(product, productCounts[product.id] || '');
													const previousCount = previousCounts[product.id];

													return (
														<TableRow key={product.id} className={validationError ? 'bg-red-50 dark:bg-red-950/20' : ''}>
															<TableCell className="font-medium">
																{product.product_name}
															</TableCell>
															<TableCell>
																{previousCount ? (
																	<Badge variant="secondary" className="font-mono">
																		{previousCount.count}
																	</Badge>
																) : (
																	<span className="text-xs text-muted-foreground">-</span>
																)}
															</TableCell>
															<TableCell>
																<div className="space-y-1">
																	<Input
																		type="number"
																		step="0.01"
																		min="0"
																		value={productCounts[product.id] || ''}
																		onChange={(e) =>
																			handleCountChange(product.id, e.target.value)
																		}
																		placeholder="0.00"
																		className={`w-full ${validationError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
																	/>
																	{validationError && (
																		<p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
																			<AlertCircle className="h-3 w-3" />
																			{validationError}
																		</p>
																	)}
																</div>
															</TableCell>
														</TableRow>
													);
												})}
											</TableBody>
										</Table>
									</div>
								</div>
							)}

							{childCategoryId && filteredProducts.length === 0 && (
								<div className="col-span-full rounded-md border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
									No products found for this category. Please add products first.
								</div>
							)}

							<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 col-span-full pt-6">
								<Button
									type="button"
									onClick={handleSubmit}
									className="w-full sm:w-auto gap-2 bg-green-600 hover:bg-green-700 text-white"
									disabled={!hasAnyCounts || isSubmitting}
								>
									{isSubmitting ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<CheckCircle2 className="h-4 w-4" />
									)}
									Submit Counts
								</Button>
								<Link href="/inventory-counts" className="w-full sm:w-auto">
									<Button type="button" variant="outline" className="w-full gap-2 text-muted-foreground">
										Back to Inventory Counts
										<ArrowRight className="h-4 w-4" />
									</Button>
								</Link>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			<Dialog open={modal.isOpen} onOpenChange={(isOpen) => setModal(prev => ({ ...prev, isOpen }))}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className={
							modal.type === 'success' ? 'text-green-600' :
								modal.type === 'validation' ? 'text-amber-600' :
									'text-red-600'
						}>
							{modal.title}
						</DialogTitle>
						<DialogDescription className="text-base text-foreground mt-2">
							{modal.message}
						</DialogDescription>
					</DialogHeader>
					{modal.details && modal.details.length > 0 && (
						<div className="py-2">
							<ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground overflow-y-auto max-h-48">
								{modal.details.map((detail, idx) => (
									<li key={idx}>{detail}</li>
								))}
							</ul>
						</div>
					)}
					<DialogFooter className="mt-4">
						<Button onClick={() => setModal(prev => ({ ...prev, isOpen: false }))}>
							Close
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</AppLayout>
	);
}
