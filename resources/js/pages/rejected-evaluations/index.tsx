import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardAction } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import TablePagination from '@/components/table-pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { type BreadcrumbItem } from '@/types';

interface EvaluationPeriod {
  id: number;
  evaluation_period_name: string;
}

interface RejectedEvaluation {
  id: number;
  evaluation: {
    id: number;
    name: string;
  };
  evaluatee_name: string;
  evaluation_period: string;
  evaluator: string;
  average_score: number | null;
  evaluation_type: string;
  rejected_at: string;
  rejection_reason: string | null;
}

interface Props {
  items: {
    data: RejectedEvaluation[];
    links: any[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
  periods: EvaluationPeriod[];
  request: {
    search?: string;
    period_id?: string;
  };
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Rejected Evaluations', href: '/rejected-evaluations' },
];

export default function RejectedEvaluationsIndex({ items, periods, request }: Props) {
  const [search, setSearch] = useState(request.search || '');
  const [periodId, setPeriodId] = useState(request.period_id || 'all');
  const [showForceAcceptDialog, setShowForceAcceptDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(route('rejected-evaluations.index'), { search, period_id: periodId !== 'all' ? periodId : undefined }, { preserveState: true, replace: true });
  };

  const openForceAcceptDialog = (id: number) => {
    setSelectedId(id);
    setShowForceAcceptDialog(true);
  };

  const confirmForceAccept = () => {
    if (selectedId) {
      router.post(route('rejected-evaluations.approve', selectedId), {}, {
        preserveScroll: true,
        onSuccess: () => {
          setShowForceAcceptDialog(false);
          setSelectedId(null);
        }
      });
    }
  };

  const openCancelDialog = (id: number) => {
    setSelectedId(id);
    setShowCancelDialog(true);
  };

  const confirmCancel = () => {
    if (selectedId) {
      router.delete(route('rejected-evaluations.cancel', selectedId), {
        preserveScroll: true,
        onSuccess: () => {
          setShowCancelDialog(false);
          setSelectedId(null);
        }
      });
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Rejected Evaluations" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Rejected Evaluations</CardTitle>
            <form className="ml-4 flex gap-2" onSubmit={submitSearch}>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search evaluations..."
              />
              <Select value={periodId} onValueChange={setPeriodId}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Filter by period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Periods</SelectItem>
                  {periods.map((period) => (
                    <SelectItem key={period.id} value={String(period.id)}>
                      {period.evaluation_period_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="submit" variant="outline">Search</Button>
            </form>
            <CardAction />
          </CardHeader>
          <hr />
          <CardContent>
            <Table>
              <TableHeader className="bg-slate-500 dark:bg-slate-700">
                <TableRow>
                  <TableHead className="font-bold text-white">ID</TableHead>
                  <TableHead className="font-bold text-white">Evaluation</TableHead>
                  <TableHead className="font-bold text-white">Evaluatee</TableHead>
                  <TableHead className="font-bold text-white">Type</TableHead>
                  <TableHead className="font-bold text-white">Period</TableHead>
                  <TableHead className="font-bold text-white">Evaluator</TableHead>
                  <TableHead className="font-bold text-white">Avg Score</TableHead>
                  <TableHead className="font-bold text-white">Rejected At</TableHead>
                  <TableHead className="font-bold text-white">Reason</TableHead>
                  <TableHead className="font-bold text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.data.map((item, index) => (
                  <TableRow key={item.id} className="odd:bg-slate-100 dark:odd:bg-slate-800">
                    <TableCell>{(items.from ?? 0) + index}</TableCell>
                    <TableCell className="font-medium">{item.evaluation.name}</TableCell>
                    <TableCell>{item.evaluatee_name}</TableCell>
                    <TableCell>
                      <Badge className={
                        item.evaluation_type === 'Personal'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                          : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      }>
                        {item.evaluation_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.evaluation_period}</TableCell>
                    <TableCell>{item.evaluator}</TableCell>
                    <TableCell>{item.average_score?.toFixed(2) ?? 'N/A'}</TableCell>
                    <TableCell>
                      {item.rejected_at ? new Date(item.rejected_at).toLocaleString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {item.rejection_reason ? (
                        <span className="max-w-xs truncate block" title={item.rejection_reason}>
                          {item.rejection_reason}
                        </span>
                      ) : (
                        'No reason'
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => openForceAcceptDialog(item.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="mr-1 h-4 w-4" />
                          Force Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => openCancelDialog(item.id)}
                        >
                          <Trash2 className="mr-1 h-4 w-4" />
                          Cancel
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          {items.data.length > 0 ? (
            <TablePagination total={items.total} from={items.from} to={items.to} links={items.links} />
          ) : (
            <div className="flex h-full items-center justify-center p-8">No Results Found!</div>
          )}
        </Card>
      </div>

      {/* Force Accept Confirmation Dialog */}
      <Dialog open={showForceAcceptDialog} onOpenChange={setShowForceAcceptDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Force Accept Rejected Evaluation</DialogTitle>
            <DialogDescription>
              Are you sure you want to force accept this rejected evaluation? This will override the rejection and change the status to "Accepted", keeping all evaluation data intact.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForceAcceptDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmForceAccept} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="mr-2 h-4 w-4" />
              Force Accept
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Evaluation</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this evaluation? This will permanently delete it and allow the evaluator to re-evaluate. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmCancel}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
