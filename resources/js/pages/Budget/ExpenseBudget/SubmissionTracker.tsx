import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Check, ChevronsUpDown, Filter, Plus, X } from 'lucide-react';
import { useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Expense Submission Tracker', href: '/budget/expense-budget/submission-tracker' },
];

type BranchOption = {
    id: number;
    name: string;
    branch_code: string | null;
};

type DepartmentOption = {
    id: number;
    name: string;
};

type ExpenseItemOption = {
    id: number;
    name: string;
    frequent_expense: boolean;
};

type TrackerRow = {
    branch: string;
    department: string;
    submissions: Record<string, boolean>;
};

type FiscalYearOption = {
    id: number;
    name: string;
};

type FiscalMonthOption = {
    id: number;
    name: string;
    fiscal_year_id: number;
};

type SubmissionTrackerProps = {
    rows: TrackerRow[];
    allExpenseItems: ExpenseItemOption[];
    visibleExpenseItems: ExpenseItemOption[];
    frequentExpenseItems: ExpenseItemOption[];
    branches: BranchOption[];
    departments: DepartmentOption[];
    fiscalYears: FiscalYearOption[];
    fiscalMonths: FiscalMonthOption[];
    request?: {
        branch_id?: string;
        department_id?: string;
        fiscal_month_id?: string;
        fiscal_year_id?: string;
        expense_item_id?: string;
        expense_item_ids?: string;
    };
};

function isHeadOfficeBranch(branch: BranchOption | null | undefined): boolean {
    if (!branch) {
        return false;
    }

    if (branch.branch_code?.toUpperCase() === 'HO') {
        return true;
    }

    return branch.name.includes('Head Office');
}

function countSubmittedExpenses(
    submissions: Record<string, boolean>,
    visibleExpenseItemIds: string[],
): number {
    return visibleExpenseItemIds.filter((id) => submissions[id]).length;
}

function formatTrackerLabel(name: string, submittedCount: number): string {
    return `${name}(${submittedCount})`;
}

function buildFilterParams(
    selectedBranch: string,
    selectedDepartment: string,
    selectedFiscalMonth: string,
    selectedFiscalYear: string,
    selectedExpenseItem: string,
    expenseItemIds: string[] | null,
): Record<string, string> {
    const params: Record<string, string> = {};

    if (selectedBranch !== 'all') {
        params.branch_id = selectedBranch;
    }
    if (selectedDepartment !== 'all') {
        params.department_id = selectedDepartment;
    }
    if (selectedFiscalMonth !== 'all') {
        params.fiscal_month_id = selectedFiscalMonth;
    }
    if (selectedFiscalYear !== 'all') {
        params.fiscal_year_id = selectedFiscalYear;
    }
    if (selectedExpenseItem !== 'all') {
        params.expense_item_id = selectedExpenseItem;
    }
    if (expenseItemIds && expenseItemIds.length > 0) {
        params.expense_item_ids = expenseItemIds.join(',');
    }

    return params;
}

export default function ExpenseSubmissionTracker({
    rows,
    allExpenseItems,
    visibleExpenseItems,
    frequentExpenseItems,
    branches,
    departments,
    fiscalYears,
    fiscalMonths,
    request,
}: SubmissionTrackerProps) {
    const [selectedBranch, setSelectedBranch] = useState<string>(request?.branch_id ?? 'all');
    const [selectedDepartment, setSelectedDepartment] = useState<string>(request?.department_id ?? 'all');
    const [selectedFiscalMonth, setSelectedFiscalMonth] = useState<string>(request?.fiscal_month_id ?? 'all');
    const [selectedFiscalYear, setSelectedFiscalYear] = useState<string>(request?.fiscal_year_id ?? 'all');
    const [selectedExpenseItem, setSelectedExpenseItem] = useState<string>(request?.expense_item_id ?? 'all');
    const [openBranchFilter, setOpenBranchFilter] = useState(false);
    const [openDepartmentFilter, setOpenDepartmentFilter] = useState(false);
    const [openExpenseItemFilter, setOpenExpenseItemFilter] = useState(false);
    const [openAddColumn, setOpenAddColumn] = useState(false);

    const visibleExpenseItemIds = useMemo(
        () => visibleExpenseItems.map((item) => String(item.id)),
        [visibleExpenseItems],
    );

    const filteredFiscalMonths = useMemo(() => {
        if (selectedFiscalYear === 'all') {
            return fiscalMonths;
        }

        return fiscalMonths.filter((month) => String(month.fiscal_year_id) === selectedFiscalYear);
    }, [fiscalMonths, selectedFiscalYear]);

    const selectedBranchOption =
        selectedBranch === 'all' ? null : branches.find((branch) => branch.id.toString() === selectedBranch) ?? null;

    const selectedDepartmentOption =
        selectedDepartment === 'all'
            ? null
            : departments.find((department) => department.id.toString() === selectedDepartment) ?? null;

    const selectedExpenseItemOption = useMemo(
        () =>
            selectedExpenseItem === 'all'
                ? null
                : allExpenseItems.find((item) => String(item.id) === selectedExpenseItem) ?? null,
        [allExpenseItems, selectedExpenseItem],
    );

    const addableExpenseItems = useMemo(
        () => allExpenseItems.filter((item) => !visibleExpenseItemIds.includes(String(item.id))),
        [allExpenseItems, visibleExpenseItemIds],
    );

    const canFilterByDepartment = isHeadOfficeBranch(selectedBranchOption);

    function resolveExpenseItemIdsForParams(override: string[] | null | undefined): string[] | null {
        if (override !== undefined) {
            return override;
        }

        if (selectedExpenseItem !== 'all') {
            return [selectedExpenseItem];
        }

        if (request?.expense_item_ids) {
            return request.expense_item_ids.split(',').filter(Boolean);
        }

        const frequentIds = frequentExpenseItems.map((item) => String(item.id));
        const isCustomColumns =
            visibleExpenseItemIds.length !== frequentIds.length ||
            visibleExpenseItemIds.some((id, index) => id !== frequentIds[index]);

        return isCustomColumns ? visibleExpenseItemIds : null;
    }

    function applyFilters(
        overrides: Partial<{
            branch: string;
            department: string;
            fiscal_month: string;
            fiscal_year: string;
            expense_item: string;
            expense_item_ids: string[] | null;
        }> = {},
    ) {
        const expenseItem = overrides.expense_item ?? selectedExpenseItem;
        const expenseItemIds = resolveExpenseItemIdsForParams(overrides.expense_item_ids);

        const params = buildFilterParams(
            overrides.branch ?? selectedBranch,
            overrides.department ?? selectedDepartment,
            overrides.fiscal_month ?? selectedFiscalMonth,
            overrides.fiscal_year ?? selectedFiscalYear,
            expenseItem,
            expenseItemIds,
        );

        router.get('/budget/expense-budget/submission-tracker', params, { preserveState: true, replace: true });
    }

    function handleBranchFilterSelect(branchId: string) {
        setOpenBranchFilter(false);
        setSelectedBranch(branchId);
        setSelectedDepartment('all');
        applyFilters({ branch: branchId, department: 'all' });
    }

    function handleDepartmentFilterSelect(departmentId: string) {
        setOpenDepartmentFilter(false);
        setSelectedDepartment(departmentId);
        applyFilters({ department: departmentId });
    }

    function handleExpenseItemFilterSelect(expenseItemId: string) {
        setOpenExpenseItemFilter(false);
        setSelectedExpenseItem(expenseItemId);

        if (expenseItemId === 'all') {
            applyFilters({ expense_item: 'all', expense_item_ids: null });
            return;
        }

        applyFilters({ expense_item: expenseItemId, expense_item_ids: [expenseItemId] });
    }

    function handleFiscalMonthChange(value: string) {
        setSelectedFiscalMonth(value);
        applyFilters({ fiscal_month: value });
    }

    function handleFiscalYearChange(value: string) {
        setSelectedFiscalYear(value);
        setSelectedFiscalMonth('all');
        applyFilters({ fiscal_year: value, fiscal_month: 'all' });
    }

    function addExpenseItemColumn(expenseItemId: string) {
        setOpenAddColumn(false);
        const nextIds = [...visibleExpenseItemIds, expenseItemId];
        setSelectedExpenseItem('all');
        applyFilters({ expense_item: 'all', expense_item_ids: nextIds });
    }

    function removeExpenseItemColumn(expenseItemId: string) {
        if (visibleExpenseItemIds.length <= 1) {
            return;
        }

        const nextIds = visibleExpenseItemIds.filter((id) => id !== expenseItemId);
        const nextExpenseItemFilter =
            selectedExpenseItem === expenseItemId ? 'all' : selectedExpenseItem;

        if (selectedExpenseItem === expenseItemId) {
            setSelectedExpenseItem('all');
        }

        applyFilters({
            expense_item: nextExpenseItemFilter,
            expense_item_ids: nextIds,
        });
    }

    function clearFilters() {
        setSelectedBranch('all');
        setSelectedDepartment('all');
        setSelectedFiscalMonth('all');
        setSelectedFiscalYear('all');
        setSelectedExpenseItem('all');
        router.get('/budget/expense-budget/submission-tracker', {}, { preserveState: true, replace: true });
    }

    const hasActiveFilters =
        selectedBranch !== 'all' ||
        selectedDepartment !== 'all' ||
        selectedFiscalMonth !== 'all' ||
        selectedFiscalYear !== 'all' ||
        selectedExpenseItem !== 'all' ||
        Boolean(request?.expense_item_ids);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Expense Submission Tracker" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="size-4 text-muted-foreground" />
                            Filters
                        </CardTitle>
                        <div className="flex flex-wrap items-end gap-3 pt-2">
                            <div className="flex flex-wrap gap-2">
                                <Popover open={openBranchFilter} onOpenChange={setOpenBranchFilter}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            className="w-[180px] justify-between font-normal"
                                        >
                                            {selectedBranchOption?.name ?? 'All Branches'}
                                            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                                        <Command>
                                            <CommandInput placeholder="Search branches..." />
                                            <CommandList className="max-h-60">
                                                <CommandEmpty>No branches found.</CommandEmpty>
                                                <CommandGroup>
                                                    <CommandItem
                                                        value="All Branches"
                                                        onSelect={() => handleBranchFilterSelect('all')}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                'mr-2 size-4',
                                                                selectedBranch === 'all' ? 'opacity-100' : 'opacity-0',
                                                            )}
                                                        />
                                                        All Branches
                                                    </CommandItem>
                                                    {branches.map((branch) => (
                                                        <CommandItem
                                                            key={branch.id}
                                                            value={branch.name}
                                                            onSelect={() => handleBranchFilterSelect(branch.id.toString())}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    'mr-2 size-4',
                                                                    selectedBranch === branch.id.toString()
                                                                        ? 'opacity-100'
                                                                        : 'opacity-0',
                                                                )}
                                                            />
                                                            {branch.name}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                <Popover open={openDepartmentFilter} onOpenChange={setOpenDepartmentFilter}>
                                    <div className={cn(!canFilterByDepartment && 'cursor-not-allowed')}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className="w-[180px] justify-between font-normal"
                                                disabled={!canFilterByDepartment}
                                            >
                                                {selectedDepartmentOption?.name ?? 'All Departments'}
                                                <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                    </div>
                                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                                        <Command>
                                            <CommandInput placeholder="Search departments..." />
                                            <CommandList className="max-h-60">
                                                <CommandEmpty>No departments found.</CommandEmpty>
                                                <CommandGroup>
                                                    <CommandItem
                                                        value="All Departments"
                                                        onSelect={() => handleDepartmentFilterSelect('all')}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                'mr-2 size-4',
                                                                selectedDepartment === 'all' ? 'opacity-100' : 'opacity-0',
                                                            )}
                                                        />
                                                        All Departments
                                                    </CommandItem>
                                                    {departments.map((department) => (
                                                        <CommandItem
                                                            key={department.id}
                                                            value={department.name}
                                                            onSelect={() =>
                                                                handleDepartmentFilterSelect(department.id.toString())
                                                            }
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    'mr-2 size-4',
                                                                    selectedDepartment === department.id.toString()
                                                                        ? 'opacity-100'
                                                                        : 'opacity-0',
                                                                )}
                                                            />
                                                            {department.name}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                <Popover open={openExpenseItemFilter} onOpenChange={setOpenExpenseItemFilter}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            className="w-[200px] justify-between font-normal"
                                        >
                                            {selectedExpenseItemOption?.name ?? 'All Expense Items'}
                                            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                                        <Command>
                                            <CommandInput placeholder="Search expense items..." />
                                            <CommandList className="max-h-60">
                                                <CommandEmpty>No expense items found.</CommandEmpty>
                                                <CommandGroup>
                                                    <CommandItem
                                                        value="All Expense Items"
                                                        onSelect={() => handleExpenseItemFilterSelect('all')}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                'mr-2 size-4',
                                                                selectedExpenseItem === 'all' ? 'opacity-100' : 'opacity-0',
                                                            )}
                                                        />
                                                        All Expense Items
                                                    </CommandItem>
                                                    {allExpenseItems.map((item) => (
                                                        <CommandItem
                                                            key={item.id}
                                                            value={item.name}
                                                            onSelect={() =>
                                                                handleExpenseItemFilterSelect(String(item.id))
                                                            }
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    'mr-2 size-4',
                                                                    selectedExpenseItem === String(item.id)
                                                                        ? 'opacity-100'
                                                                        : 'opacity-0',
                                                                )}
                                                            />
                                                            {item.name}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                <Select value={selectedFiscalYear} onValueChange={handleFiscalYearChange}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="All Fiscal Years" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Fiscal Years</SelectItem>
                                        {fiscalYears.map((year) => (
                                            <SelectItem key={year.id} value={year.id.toString()}>
                                                {year.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={selectedFiscalMonth} onValueChange={handleFiscalMonthChange}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="All Fiscal Months" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Fiscal Months</SelectItem>
                                        {filteredFiscalMonths.map((month) => (
                                            <SelectItem key={month.id} value={month.id.toString()}>
                                                {month.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {hasActiveFilters && (
                                    <Button type="button" variant="secondary" onClick={clearFilters}>
                                        <X className="mr-1 size-4" />
                                        Clear Filters
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <hr />
                    <CardContent className="pt-6">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm text-muted-foreground">
                                Showing {visibleExpenseItems.length} expense item column
                                {visibleExpenseItems.length === 1 ? '' : 's'}
                            </p>
                            <Popover open={openAddColumn} onOpenChange={setOpenAddColumn}>
                                <PopoverTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        disabled={addableExpenseItems.length === 0}
                                    >
                                        <Plus className="mr-1 size-4" />
                                        Add Expense Item Column
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[280px] p-0" align="end">
                                    <Command>
                                        <CommandInput placeholder="Search expense items..." />
                                        <CommandList className="max-h-60">
                                            <CommandEmpty>No more expense items to add.</CommandEmpty>
                                            <CommandGroup>
                                                {addableExpenseItems.map((item) => (
                                                    <CommandItem
                                                        key={item.id}
                                                        value={item.name}
                                                        onSelect={() => addExpenseItemColumn(String(item.id))}
                                                    >
                                                        <Plus className="mr-2 size-4 opacity-60" />
                                                        {item.name}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <Table>
                            <TableHeader className="bg-slate-500 dark:bg-slate-700">
                                <TableRow>
                                    <TableHead className="sticky left-0 z-30 min-w-[180px] bg-slate-500 font-bold text-white dark:bg-slate-700">
                                        Branch
                                    </TableHead>
                                    <TableHead className="sticky left-[180px] z-40 min-w-[180px] bg-slate-500 font-bold text-white shadow-[4px_0_8px_-2px_rgba(0,0,0,0.25)] dark:bg-slate-700">
                                        Department
                                    </TableHead>
                                    {visibleExpenseItems.map((item) => (
                                        <TableHead
                                            key={item.id}
                                            className="relative z-0 min-w-[160px] bg-slate-500 text-center font-bold text-white dark:bg-slate-700"
                                        >
                                            <div className="flex items-center justify-center gap-1">
                                                <span className="truncate">{item.name}</span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-6 shrink-0 text-white hover:bg-white/20 hover:text-white"
                                                    onClick={() => removeExpenseItemColumn(String(item.id))}
                                                    disabled={visibleExpenseItems.length <= 1}
                                                    title="Remove column"
                                                >
                                                    <X className="size-3.5" />
                                                </Button>
                                            </div>
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rows.length > 0 ? (
                                    rows.map((row, index) => {
                                        const stickyRowBg =
                                            index % 2 === 1
                                                ? 'bg-slate-100 dark:bg-slate-800'
                                                : 'bg-white dark:bg-background';
                                        const submittedCount = countSubmittedExpenses(
                                            row.submissions,
                                            visibleExpenseItemIds,
                                        );
                                        const isHeadOfficeRow = row.department !== '-';
                                        const branchLabel = isHeadOfficeRow
                                            ? row.branch
                                            : formatTrackerLabel(row.branch, submittedCount);
                                        const departmentLabel = isHeadOfficeRow
                                            ? formatTrackerLabel(row.department, submittedCount)
                                            : row.department;

                                        return (
                                            <TableRow
                                                key={`${row.branch}-${row.department}-${index}`}
                                                className="odd:bg-slate-100 dark:odd:bg-slate-800"
                                            >
                                                <TableCell
                                                    className={cn(
                                                        'sticky left-0 z-20 min-w-[180px] font-medium',
                                                        stickyRowBg,
                                                    )}
                                                >
                                                    {branchLabel}
                                                </TableCell>
                                                <TableCell
                                                    className={cn(
                                                        'sticky left-[180px] z-30 min-w-[180px] shadow-[4px_0_8px_-2px_rgba(0,0,0,0.12)]',
                                                        stickyRowBg,
                                                    )}
                                                >
                                                    {departmentLabel}
                                                </TableCell>
                                                {visibleExpenseItems.map((item) => {
                                                    const submitted = row.submissions[String(item.id)] ?? false;

                                                    return (
                                                        <TableCell
                                                            key={item.id}
                                                            className="relative z-0 bg-inherit text-center"
                                                        >
                                                            {submitted ? (
                                                                <Check className="mx-auto size-5 text-green-600" />
                                                            ) : (
                                                                <X className="mx-auto size-5 text-red-500" />
                                                            )}
                                                        </TableCell>
                                                    );
                                                })}
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={2 + visibleExpenseItems.length}
                                            className="py-8 text-center text-muted-foreground"
                                        >
                                            No Results Found!
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
