import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import TablePagination from '@/components/table-pagination';
import { ClipboardList, Download, FilterX } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

type LinkedForm = { id: number; title: string };
type FiscalOption = { id: number; name: string; fiscal_year_id?: number };

type ResultRow = {
	employee_id: number;
	employee_name: string;
	department_name: string;
	branch_name: string;
	form_id: number;
	form_title: string;
	submission_id: number;
	fiscal_year_id: number | null;
	fiscal_year_name: string | null;
	fiscal_month_id: number | null;
	fiscal_month_name: string;
	score: number | null;
	status: 'pass' | 'fail' | 'not_scored';
	status_label: string;
};

type Summary = {
	rows: number;
	employees: number;
	pass: number;
	fail: number;
	not_scored: number;
};

type Filters = {
	search: string;
	form_id: string;
	status: string;
	fiscal_year_id: string;
	fiscal_month_id: string;
};

type PageState = 'ready' | 'no_forms';

const breadcrumbs: BreadcrumbItem[] = [
	{ title: 'Form', href: '/forms' },
	{ title: 'Evaluation Results', href: '/forms/evaluation-results' },
];

function statusClass(status: ResultRow['status']) {
	if (status === 'pass') return 'bg-green-100 text-green-800 border-green-200';
	if (status === 'fail') return 'bg-red-100 text-red-800 border-red-200';
	return 'bg-gray-100 text-gray-700 border-gray-200';
}

export default function EvaluationResults({
	pageState,
	linkedForms = [],
	rows,
	summary,
	fiscalYears = [],
	fiscalMonths = [],
	filters,
}: {
	pageState: PageState;
	linkedForms: LinkedForm[];
	rows: {
		data: ResultRow[];
		total: number;
		from: number;
		to: number;
		links: any[];
	};
	summary: Summary;
	fiscalYears: FiscalOption[];
	fiscalMonths: FiscalOption[];
	filters: Filters;
}) {
	const [searchInput, setSearchInput] = useState(filters.search);

	useEffect(() => {
		setSearchInput(filters.search);
	}, [filters.search]);

	const monthsForYear = useMemo(() => {
		if (filters.fiscal_year_id === 'all') return fiscalMonths;
		return fiscalMonths.filter((month) => String(month.fiscal_year_id) === filters.fiscal_year_id);
	}, [fiscalMonths, filters.fiscal_year_id]);

	function applyFilters(next: Partial<Filters>) {
		const params: Record<string, string> = {
			search: next.search ?? filters.search,
			form_id: next.form_id ?? filters.form_id,
			status: next.status ?? filters.status,
			fiscal_year_id: next.fiscal_year_id ?? filters.fiscal_year_id,
			fiscal_month_id: next.fiscal_month_id ?? filters.fiscal_month_id,
		};

		router.get('/forms/evaluation-results', params, {
			preserveState: true,
			preserveScroll: true,
			replace: true,
		});
	}

	function resetFilters() {
		router.get(
			'/forms/evaluation-results',
			{
				search: '',
				form_id: 'all',
				status: 'all',
				fiscal_year_id: 'all',
				fiscal_month_id: 'all',
			},
			{ preserveState: true, preserveScroll: true, replace: true },
		);
	}

	function exportCsv() {
		const params = new URLSearchParams({
			search: filters.search,
			form_id: filters.form_id,
			status: filters.status,
			fiscal_year_id: filters.fiscal_year_id,
			fiscal_month_id: filters.fiscal_month_id,
			export: 'csv',
		});
		window.location.href = `/forms/evaluation-results?${params.toString()}`;
	}

	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<Head title="Evaluation Results" />
			<div className="mx-auto max-w-[90rem] space-y-6 pb-12">
				<div>
					<h2 className="text-2xl font-bold tracking-tight text-amber-900">Evaluation Results</h2>
					<p className="text-muted-foreground">
						Employees scored on forms with attendance roster, employee lookup, or evaluation grid.
						Pass is 75 or above.
					</p>
				</div>

				{pageState === 'no_forms' && (
					<div className="rounded-xl border border-dashed border-amber-300 bg-amber-50/60 p-8 text-center">
						<ClipboardList className="mx-auto mb-3 h-10 w-10 text-amber-500" />
						<h3 className="text-lg font-medium text-gray-900">No scoring forms</h3>
						<p className="mx-auto mt-1 max-w-xl text-gray-600">
							Create a form that includes an attendance roster, employee lookup, or evaluation grid to
							see results here.
						</p>
						<Button asChild className="mt-4" variant="outline">
							<Link href="/forms">Open Forms</Link>
						</Button>
					</div>
				)}

				{pageState === 'ready' && (
					<>
						<div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
							{[
								['Rows', summary.rows],
								['Employees', summary.employees],
								['Pass', summary.pass],
								['Fail', summary.fail],
								['Not scored', summary.not_scored],
							].map(([label, value]) => (
								<div key={String(label)} className="rounded-lg border bg-white px-4 py-3">
									<p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
									<p className="mt-1 text-2xl font-bold text-amber-950">{value}</p>
								</div>
							))}
						</div>

						<div className="flex flex-col gap-3 rounded-lg border bg-white p-4 lg:flex-row lg:flex-wrap lg:items-center">
							<form
								className="lg:max-w-xs"
								onSubmit={(e) => {
									e.preventDefault();
									applyFilters({ search: searchInput });
								}}
							>
								<Input
									value={searchInput}
									onChange={(e) => setSearchInput(e.target.value)}
									placeholder="Search branch or form"
								/>
							</form>
							<Select value={filters.form_id} onValueChange={(value) => applyFilters({ form_id: value })}>
								<SelectTrigger className="lg:w-56">
									<SelectValue placeholder="Form" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All scoring forms</SelectItem>
									{linkedForms.map((form) => (
										<SelectItem key={form.id} value={String(form.id)}>
											{form.title}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Select value={filters.status} onValueChange={(value) => applyFilters({ status: value })}>
								<SelectTrigger className="lg:w-40">
									<SelectValue placeholder="Status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All statuses</SelectItem>
									<SelectItem value="pass">Pass</SelectItem>
									<SelectItem value="fail">Fail</SelectItem>
									<SelectItem value="not_scored">Not scored</SelectItem>
								</SelectContent>
							</Select>
							<Select
								value={filters.fiscal_year_id}
								onValueChange={(value) => applyFilters({ fiscal_year_id: value, fiscal_month_id: 'all' })}
							>
								<SelectTrigger className="lg:w-44">
									<SelectValue placeholder="Fiscal year" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All years</SelectItem>
									{fiscalYears.map((year) => (
										<SelectItem key={year.id} value={String(year.id)}>
											{year.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Select
								value={filters.fiscal_month_id}
								onValueChange={(value) => applyFilters({ fiscal_month_id: value })}
							>
								<SelectTrigger className="lg:w-44">
									<SelectValue placeholder="Fiscal month" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All months</SelectItem>
									{monthsForYear.map((month) => (
										<SelectItem key={month.id} value={String(month.id)}>
											{month.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Button type="button" variant="ghost" onClick={resetFilters} className="text-gray-600">
								<FilterX className="mr-2 h-4 w-4" /> Reset
							</Button>
							<Button
								type="button"
								variant="outline"
								onClick={exportCsv}
								disabled={summary.rows === 0}
								className="lg:ml-auto"
							>
								<Download className="mr-2 h-4 w-4" /> Export CSV
							</Button>
						</div>

						<div className="overflow-hidden rounded-lg border bg-white">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Branch</TableHead>
										<TableHead>Department</TableHead>
										<TableHead>Employee Name</TableHead>
										<TableHead>Form</TableHead>
										<TableHead>Fiscal month</TableHead>
										<TableHead className="text-right">Score</TableHead>
										<TableHead>Status</TableHead>
										<TableHead />
									</TableRow>
								</TableHeader>
								<TableBody>
									{rows.data.length === 0 ? (
										<TableRow>
											<TableCell colSpan={8} className="py-12 text-center text-gray-500">
												{summary.rows === 0
													? 'No employees have an assessment matching these filters.'
													: 'No rows match these filters.'}
											</TableCell>
										</TableRow>
									) : (
										rows.data.map((row) => (
											<TableRow
												key={`${row.employee_id}-${row.form_id}-${row.fiscal_month_id ?? 'none'}-${row.submission_id}`}
											>
												<TableCell>{row.branch_name}</TableCell>
												<TableCell>{row.department_name || '—'}</TableCell>
												<TableCell className="font-medium text-gray-900">
													{row.employee_name || '—'}
												</TableCell>
												<TableCell>{row.form_title}</TableCell>
												<TableCell>
													<div className="flex flex-col">
														<span>{row.fiscal_month_name}</span>
														{row.fiscal_year_name && (
															<span className="text-xs text-muted-foreground">
																{row.fiscal_year_name}
															</span>
														)}
													</div>
												</TableCell>
												<TableCell className="text-right font-semibold">
													{row.score === null ? '—' : `${row.score.toFixed(1)}`}
												</TableCell>
												<TableCell>
													<span
														className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass(row.status)}`}
													>
														{row.status_label}
													</span>
												</TableCell>
												<TableCell className="text-right">
													<Link
														href={`/submissions/${row.submission_id}`}
														className="text-sm font-medium text-amber-800 hover:underline"
													>
														View
													</Link>
												</TableCell>
											</TableRow>
										))
									)}
								</TableBody>
							</Table>

							{rows.data.length > 0 && (
								<TablePagination total={rows.total} from={rows.from} to={rows.to} links={rows.links} />
							)}
						</div>
					</>
				)}
			</div>
		</AppLayout>
	);
}
