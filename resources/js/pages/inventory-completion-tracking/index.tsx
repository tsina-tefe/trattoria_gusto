import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Package, CheckCircle, X, AlertCircle, Eye } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Inventory Completion Tracking', href: '/inventory-completion-tracking' },
];

interface FiscalYear {
  id: number;
  name: string;
}

interface InventoryPeriod {
  id: number;
  inventory_period_name: string;
  status: string;
  fiscal_year_id: number;
}

interface PeriodCompletion {
  inventory_period_id: number;
  inventory_period_name: string;
  counted_child_categories: number;
  total_child_categories: number;
  status: 'not_started' | 'in_progress' | 'completed';
}

interface BranchCompletion {
  branch_id: number;
  branch_name: string;
  periods: PeriodCompletion[];
}

interface MissingChildCategory {
  id: number;
  child_name: string;
}

type PageProps = {
  inventoryPeriods: InventoryPeriod[];
  fiscalYears: FiscalYear[];
  completionData: BranchCompletion[];
  filters: {
    fiscal_year_id?: string;
    inventory_period_id?: string;
    status?: string;
  };
};

export default function InventoryCompletionTrackingIndex({ 
  inventoryPeriods = [],
  fiscalYears = [],
  completionData: initialCompletionData = [],
  filters = {},
}: PageProps) {
  const [missingCategories, setMissingCategories] = useState<MissingChildCategory[]>([]);
  const [loadingMissing, setLoadingMissing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');

  const yearFilter = filters.fiscal_year_id ?? 'all';
  const periodFilter = filters.inventory_period_id ?? (inventoryPeriods.length > 0 ? String(inventoryPeriods[0].id) : 'all');
  const statusFilter = filters.status ?? 'all';



  const setYearFilter = (value: string) => {
    router.get('/inventory-completion-tracking', {
      fiscal_year_id: value === 'all' ? undefined : value,
      inventory_period_id: periodFilter === 'all' ? undefined : periodFilter,
      status: statusFilter === 'all' ? undefined : statusFilter,
    }, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const setPeriodFilter = (value: string) => {
    router.get('/inventory-completion-tracking', {
      fiscal_year_id: yearFilter === 'all' ? undefined : yearFilter,
      inventory_period_id: value === 'all' ? undefined : value,
      status: statusFilter === 'all' ? undefined : statusFilter,
    }, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const setStatusFilter = (value: string) => {
    router.get('/inventory-completion-tracking', {
      fiscal_year_id: yearFilter === 'all' ? undefined : yearFilter,
      inventory_period_id: periodFilter === 'all' ? undefined : periodFilter,
      status: value === 'all' ? undefined : value,
    }, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  // Calculate summary statistics
  const filteredPeriods = periodFilter !== 'all' 
    ? inventoryPeriods.filter(p => p.id === parseInt(periodFilter))
    : yearFilter !== 'all'
    ? inventoryPeriods.filter(p => p.fiscal_year_id === parseInt(yearFilter))
    : inventoryPeriods;

  const totalBranches = initialCompletionData.length;
  const allPeriodStatuses = initialCompletionData.flatMap(branch => branch.periods.map(p => p.status));
  
  const completedCount = allPeriodStatuses.filter(s => s === 'completed').length;
  const inProgressCount = allPeriodStatuses.filter(s => s === 'in_progress').length;
  const notStartedCount = allPeriodStatuses.filter(s => s === 'not_started').length;

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'not_started':
        return 'bg-gray-100 text-gray-800';
      default:
        return '';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      case 'not_started':
        return 'Not Started';
      default:
        return status;
    }
  };

  // Add safety check
  if (!Array.isArray(initialCompletionData)) {
    console.error('completionData is not an array:', initialCompletionData);
  }

  const fetchMissingCategories = async (branchId: number, periodId: number, branchName: string, periodName: string) => {
    setLoadingMissing(true);
    setSelectedBranch(branchName);
    setSelectedPeriod(periodName);
    setDialogOpen(true);
    
    try {
      const response = await fetch(`/inventory-completion-tracking/${branchId}/${periodId}/missing-categories`);
      const data = await response.json();
      setMissingCategories(data.missing_child_categories || []);
    } catch (error) {
      console.error('Error fetching missing categories:', error);
      setMissingCategories([]);
    } finally {
      setLoadingMissing(false);
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Inventory Completion Tracking" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Not Started</CardTitle>
              <X className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{notStartedCount}</div>
              <p className="text-xs text-muted-foreground">No counts yet</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{inProgressCount}</div>
              <p className="text-xs text-muted-foreground">Currently counting</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedCount}</div>
              <p className="text-xs text-muted-foreground">Approved completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{allPeriodStatuses.length}</div>
              <p className="text-xs text-muted-foreground">Branch × Period entries</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <CardTitle>Branch Completion Status</CardTitle>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Filter by year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {fiscalYears.map(year => (
                      <SelectItem key={year.id} value={String(year.id)}>
                        {year.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={periodFilter} onValueChange={setPeriodFilter}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Filter by period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Periods</SelectItem>
                    {inventoryPeriods
                      .filter(period => yearFilter === 'all' || period.fiscal_year_id === parseInt(yearFilter))
                      .map(period => (
                        <SelectItem key={period.id} value={String(period.id)}>
                          {period.inventory_period_name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="not_started">Not Started</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Branch</TableHead>
                    {filteredPeriods.map(period => (
                      <TableHead key={period.id}>{period.inventory_period_name}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {initialCompletionData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={filteredPeriods.length + 1} className="text-center text-muted-foreground">
                        No data available
                      </TableCell>
                    </TableRow>
                  ) : (
                    initialCompletionData.map(branch => {
                        return (
                          <TableRow key={branch.branch_id}>
                            <TableCell className="font-medium">{branch.branch_name}</TableCell>
                            {filteredPeriods.map(period => {
                              const periodData = branch.periods.find(p => p.inventory_period_id === period.id);
                              const status = periodData?.status || 'not_started';
                              const counted = periodData?.counted_child_categories || 0;
                              const total = periodData?.total_child_categories || 0;

                              return (
                                <TableCell key={period.id}>
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex flex-col gap-1">
                                      <Badge 
                                        variant="outline"
                                        className={getStatusBadgeStyle(status)}
                                      >
                                        {getStatusLabel(status)}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">
                                        {counted}/{total} categories
                                      </span>
                                    </div>
                                    {counted < total && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => fetchMissingCategories(branch.branch_id, period.id, branch.branch_name, period.inventory_period_name)}
                                        className="h-8 w-8 p-0"
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
          </CardContent>
        </Card>

        {/* Missing Categories Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Missing Child Categories</DialogTitle>
              <DialogDescription>
                Branch: <span className="font-semibold">{selectedBranch}</span> | Period: <span className="font-semibold">{selectedPeriod}</span>
              </DialogDescription>
            </DialogHeader>
            
            {loadingMissing ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Loading missing categories...</div>
              </div>
            ) : missingCategories.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">All child categories have been counted!</div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  The following child categories have not been counted yet:
                </div>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">#</TableHead>
                        <TableHead>Child Category Name</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {missingCategories.map((category, index) => (
                        <TableRow key={category.id}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell>{category.child_name}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="text-sm font-medium">
                  Total missing: {missingCategories.length} {missingCategories.length === 1 ? 'category' : 'categories'}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
