import TablePagination from '@/components/table-pagination';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePermission } from '@/hooks/user-permissions';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export interface ExpenseItem {
    expense_parent_acc_code: number;
    code: number;
    expense_type: string;
    frequent_expense: boolean;
    is_expense: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Expense Items',
        href: '/expense-items',
    },
];

export default function ExpenseItems({ expenseItems, request }: { expenseItems: { data: ExpenseItem[], total: number, from: number, to: number, links: any[] }, request?: { search?: string } }) {
    const { flash } = usePage<{ flash: { message?: string } }>().props;
    const [search, setSearch] = useState<string>(request?.search ?? '');
    const { can } = usePermission();

    useEffect(() => {
        if (flash.message) {
            toast.success(flash.message);
        }
    }, [flash.message]);

    function submitSearch(e: React.FormEvent) {
        e.preventDefault();
        router.get('/expense-items', { search }, { preserveState: true, replace: true });
    }

    function deleteExpenseItem(id: number) {
        if (confirm('Are you sure you want to delete this expense item?')) {
            router.delete(`/expense-items/${id}`);
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Expense Items" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Card>
                    <CardHeader className="flex items-center justify-between">
                        <CardTitle>Expense Items Management</CardTitle>
                        <form className="ml-4 flex gap-2" onSubmit={submitSearch}>
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search expense items..."
                            />
                            <Button type="submit" variant="outline">Search</Button>
                        </form>
                        <CardAction>
                                <Link href="/expense-items/create">
                                    <Button variant="default">Add New</Button>
                                </Link>
                        </CardAction>
                    </CardHeader>
                    <hr />
                    <CardContent>
                        <Table>
                            <TableHeader className="bg-slate-500 dark:bg-slate-700">
                        <TableRow>
                            <TableHead className="font-bold text-white">Parent Acc Code</TableHead>
                            <TableHead className="font-bold text-white">Code</TableHead>
                            <TableHead className="font-bold text-white">Expense Type</TableHead>
                            <TableHead className="font-bold text-white">Frequent Expense</TableHead>
                            <TableHead className="font-bold text-white">Is Expense</TableHead>
                            <TableHead className="font-bold text-white">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {expenseItems.data
                            .map((expenseItem, index) => (
                            <TableRow key={expenseItem.expense_parent_acc_code} className="odd:bg-slate-100 dark:odd:bg-slate-800">
                                <TableCell>{expenseItem.expense_parent_acc_code}</TableCell>
                                <TableCell>{expenseItem.code}</TableCell>
                                <TableCell>{expenseItem.expense_type}</TableCell>
                                <TableCell>{expenseItem.frequent_expense ? 'Yes' : 'No'}</TableCell>
                                <TableCell>{expenseItem.is_expense ? 'Yes' : 'No'}</TableCell>
                                        <TableCell>
                                                <Link href={`/expense-items/${expenseItem.expense_parent_acc_code}/edit`}>
                                                    <Button variant="outline" size="sm">
                                                        Edit
                                                    </Button>
                                                </Link>
                                                <Button
                                                    className="m-2"
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => deleteExpenseItem(expenseItem.expense_parent_acc_code)}
                                                >
                                                    Delete
                                                </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                    {expenseItems.data.length > 0 ? (
                        <TablePagination
                            total={expenseItems.total}
                            from={expenseItems.from}
                            to={expenseItems.to}
                            links={expenseItems.links}
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center">No Results Found!</div>
                    )}
                </Card>
            </div>
        </AppLayout>
    );
}
