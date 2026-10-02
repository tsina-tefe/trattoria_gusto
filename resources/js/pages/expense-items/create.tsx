import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import React from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Expense Items',
        href: '/expense-items',
    },
    {
        title: 'Create Expense Item',
        href: '/expense-items/create',
    },
];

export default function CreateExpenseItem() {
    const { data, setData, post, errors, processing } = useForm({
        expense_parent_acc_code: '',
        code: '',
        expense_type: '',
        frequent_expense: false,
        is_expense: true,
    });

    function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        post('/expense-items');
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Expense Item" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Card>
                    <CardHeader className="flex items-center justify-between">
                        <CardTitle>Create Expense Item</CardTitle>
                        <CardAction>
                            <Link href="/expense-items">
                                <Button variant="default">Go Back</Button>
                            </Link>
                        </CardAction>
                    </CardHeader>
                    <hr />
                    <CardContent>
                        <form onSubmit={submit}>
                            <div className="mb-4">
                                <Label htmlFor="expense_parent_acc_code">Parent Acc Code</Label>
                                <Input
                                    id="expense_parent_acc_code"
                                    type="number"
                                    value={data.expense_parent_acc_code}
                                    onChange={(e) => setData('expense_parent_acc_code', e.target.value)}
                                    aria-invalid={!!errors.expense_parent_acc_code}
                                    placeholder="Enter parent acc code"
                                />
                                <InputError message={errors.expense_parent_acc_code} />
                            </div>
                            <div className="mb-4">
                                <Label htmlFor="code">Code</Label>
                                <Input
                                    id="code"
                                    type="number"
                                    value={data.code}
                                    onChange={(e) => setData('code', e.target.value)}
                                    aria-invalid={!!errors.code}
                                    placeholder="Enter code"
                                />
                                <InputError message={errors.code} />
                            </div>
                            <div className="mb-4">
                                <Label htmlFor="expense_type">Expense Type</Label>
                                <Input
                                    id="expense_type"
                                    type="text"
                                    value={data.expense_type}
                                    onChange={(e) => setData('expense_type', e.target.value)}
                                    aria-invalid={!!errors.expense_type}
                                    placeholder="Enter expense type"
                                />
                                <InputError message={errors.expense_type} />
                            </div>
                            <div className="mb-4 flex items-center gap-2">
                                <Label htmlFor="frequent_expense">Frequent Expense</Label>
                                <input
                                    id="frequent_expense"
                                    type="checkbox"
                                    checked={data.frequent_expense}
                                    onChange={(e) => setData('frequent_expense', e.target.checked)}
                                />
                                <InputError message={errors.frequent_expense} />
                            </div>
                            <div className="mb-4 flex items-center gap-2">
                                <Label htmlFor="is_expense">Is Expense</Label>
                                <input
                                    id="is_expense"
                                    type="checkbox"
                                    checked={data.is_expense}
                                    onChange={(e) => setData('is_expense', e.target.checked)}
                                />
                                <InputError message={errors.is_expense} />
                            </div>
                            <div className="flex justify-end">
                                <Button size="lg" type="submit" disabled={processing}>
                                    Create
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
