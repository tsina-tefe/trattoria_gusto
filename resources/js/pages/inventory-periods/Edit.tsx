import { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePermission } from '@/hooks/user-permissions';

type FiscalYearOption = {
	id: number;
	name: string;
};

type FiscalMonthOption = {
	id: number;
	name: string;
	fiscal_year_id: number;
};

type InventoryPeriod = {
	id: number;
	inventory_period_name: string;
	fiscal_year_id: number;
	fiscal_month_id: number;
	status: 'active' | 'inactive';
};

type PageProps = {
	inventoryPeriod: InventoryPeriod;
	fiscalYears: FiscalYearOption[];
	fiscalMonths: FiscalMonthOption[];
};

export default function EditInventoryPeriod() {
	const { props } = usePage<PageProps>();
	const inventoryPeriod = props.inventoryPeriod;
	const fiscalYears = props.fiscalYears ?? [];
	const fiscalMonths = props.fiscalMonths ?? [];
	const { can } = usePermission();

	const [inventoryPeriodName, setInventoryPeriodName] = useState(inventoryPeriod.inventory_period_name);
	const [fiscalYearId, setFiscalYearId] = useState<string>(String(inventoryPeriod.fiscal_year_id));
	const [fiscalMonthId, setFiscalMonthId] = useState<string>(String(inventoryPeriod.fiscal_month_id));
	const [status, setStatus] = useState<'active' | 'inactive'>(inventoryPeriod.status);

	const filteredMonths = useMemo(() => {
		if (!fiscalYearId) {
			return fiscalMonths;
		}
		return fiscalMonths.filter((month) => String(month.fiscal_year_id) === fiscalYearId);
	}, [fiscalMonths, fiscalYearId]);

	useEffect(() => {
		if (!fiscalYearId) {
			setFiscalMonthId('');
			return;
		}
		if (!filteredMonths.find((month) => String(month.id) === fiscalMonthId)) {
			setFiscalMonthId('');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fiscalYearId]);

	function save(e: React.FormEvent) {
		e.preventDefault();
		router.put(route('inventory-periods.update', inventoryPeriod.id), {
			inventory_period_name: inventoryPeriodName,
			fiscal_year_id: Number(fiscalYearId),
			fiscal_month_id: Number(fiscalMonthId),
			status,
		});
	}

	return (
		<AppLayout
			breadcrumbs={[
				{ title: 'Inventory Periods', href: '/inventory-periods' },
				{ title: 'Edit Inventory Period', href: `/inventory-periods/${inventoryPeriod.id}/edit` },
			]}
		>
			<Head title="Edit Inventory Period" />
			<div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
				<Card className="max-w-2xl">
					<CardHeader>
						<CardTitle>Edit Inventory Period</CardTitle>
					</CardHeader>
					<CardContent>
						<form className="space-y-6" onSubmit={save}>
								<div className="space-y-2">
									<Label htmlFor="inventory_period_name">Name</Label>
									<Input
										id="inventory_period_name"
										value={inventoryPeriodName}
										onChange={(e) => setInventoryPeriodName(e.target.value)}
										required
										maxLength={191}
									/>
								</div>
								<div className="space-y-2">
									<Label>Fiscal Year</Label>
									<Select
										value={fiscalYearId}
										onValueChange={(value) => setFiscalYearId(value)}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select fiscal year" />
										</SelectTrigger>
										<SelectContent>
											{fiscalYears.map((year) => (
												<SelectItem key={year.id} value={String(year.id)}>
													{year.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label>Fiscal Month</Label>
									<Select
										value={fiscalMonthId}
										onValueChange={(value) => setFiscalMonthId(value)}
										disabled={!fiscalYearId}
									>
										<SelectTrigger>
											<SelectValue placeholder={fiscalYearId ? 'Select fiscal month' : 'Select fiscal year first'} />
										</SelectTrigger>
										<SelectContent>
											{filteredMonths.map((month) => (
												<SelectItem key={month.id} value={String(month.id)}>
													{month.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label>Status</Label>
									<Select value={status} onValueChange={(value) => setStatus(value as typeof status)}>
										<SelectTrigger>
											<SelectValue placeholder="Select status" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="active">Active</SelectItem>
											<SelectItem value="inactive">Inactive</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="flex items-center gap-2">
									<Button
										type="submit"
										disabled={
											!can('update inventory periods') ||
											!inventoryPeriodName.trim() ||
											!fiscalYearId ||
											!fiscalMonthId
										}
									>
										Save
									</Button>
									<Link href="/inventory-periods">
										<Button type="button" variant="outline">
											Back
										</Button>
									</Link>
								</div>
							</form>
					</CardContent>
				</Card>
			</div>
		</AppLayout>
	);
}


