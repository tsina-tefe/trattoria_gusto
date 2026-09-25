import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type QuestionGroup } from '@/types/question-groups.d';
import { type Branch, type Department } from '@/types/evaluator-group.d';
import { Head, Link, useForm } from '@inertiajs/react';
import React, { useMemo, useState } from 'react';
import { Search, CheckSquare, XSquare } from 'lucide-react';

type EmployeeOption = {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    branch_id?: number;
    department_id?: number;
    branch?: {
        id: number;
        name: string;
    };
    department?: {
        id: number;
        name: string;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Evaluator Groups',
        href: '/evaluator-groups',
    },
    {
        title: 'Create Evaluator Group',
        href: '/evaluator-groups/create',
    },
];

export default function CreateEvaluatorGroup({
    questionGroups,
    employees,
    branches,
    departments,
}: {
    questionGroups: QuestionGroup[];
    employees: EmployeeOption[];
    branches: Branch[];
    departments: Department[];
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterBranch, setFilterBranch] = useState<string>('all');
    const [filterDepartment, setFilterDepartment] = useState<string>('all');

    const { data, setData, post, errors, processing } = useForm({
        name: '',
        question_group_id: '',
        employee_ids: [] as number[],
    });

    // Filter employees based on search, branch, and department
    const filteredEmployees = useMemo(() => {
        return employees.filter((emp) => {
            if (!emp) return false;
            const fullName = `${emp.first_name || ''} ${emp.last_name || ''}`.toLowerCase();
            const email = (emp.email || '').toLowerCase();
            const query = searchQuery.toLowerCase();
            const matchesSearch = fullName.includes(query) || email.includes(query);
            const matchesBranch = filterBranch === 'all' || emp.branch_id?.toString() === filterBranch;
            const matchesDepartment = filterDepartment === 'all' || emp.department_id?.toString() === filterDepartment;
            return matchesSearch && matchesBranch && matchesDepartment;
        });
    }, [employees, searchQuery, filterBranch, filterDepartment]);

    function toggleEmployee(id: number, checked: boolean | string) {
        setData('employee_ids', checked ? [...data.employee_ids, id] : data.employee_ids.filter((x) => x !== id));
    }

    function selectAll() {
        setData('employee_ids', filteredEmployees.map((emp) => emp.id));
    }

    function deselectAll() {
        setData('employee_ids', []);
    }

    function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        post('/evaluator-groups');
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Evaluator Group" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Card>
                    <CardHeader className="flex items-center justify-between">
                        <CardTitle>Create Evaluator Group</CardTitle>
                        <CardAction>
                            <Link href={'/evaluator-groups'}>
                                <Button variant={'default'}>Go Back</Button>
                            </Link>
                        </CardAction>
                    </CardHeader>
                    <hr />
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Group Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g. Performance Review Team"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="question_group_id">Question Group</Label>
                                <Select
                                    value={data.question_group_id.toString()}
                                    onValueChange={(value) => setData('question_group_id', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select question group" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {questionGroups.map((group) => (
                                            <SelectItem key={group.id} value={group.id.toString()}>
                                                {group.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.question_group_id} />
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label>Select Evaluators ({data.employee_ids.length} selected)</Label>
                                    <div className="flex gap-2">
                                        <Button type="button" variant="outline" size="sm" onClick={selectAll}>
                                            <CheckSquare className="mr-1 h-4 w-4" />
                                            Select All
                                        </Button>
                                        <Button type="button" variant="outline" size="sm" onClick={deselectAll}>
                                            <XSquare className="mr-1 h-4 w-4" />
                                            Deselect All
                                        </Button>
                                    </div>
                                </div>

                                {/* Search and Filters */}
                                <div className="grid gap-3 md:grid-cols-3">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                        <Input
                                            placeholder="Search employees..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-9"
                                        />
                                    </div>
                                    <Select value={filterBranch} onValueChange={setFilterBranch}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Filter by branch" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Branches</SelectItem>
                                            {branches.map((branch) => (
                                                <SelectItem key={branch.id} value={branch.id.toString()}>
                                                    {branch.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Filter by department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Departments</SelectItem>
                                            {departments.map((dept) => (
                                                <SelectItem key={dept.id} value={dept.id.toString()}>
                                                    {dept.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Employees List */}
                                <div className="max-h-96 overflow-y-auto rounded-md border p-4">
                                    {filteredEmployees.length === 0 ? (
                                        <p className="py-8 text-center text-sm text-gray-500">No employees found</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {filteredEmployees.map((emp) => {
                                                const checked = data.employee_ids.includes(emp.id);
                                                return (
                                                    <label
                                                        key={emp.id}
                                                        className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                                                    >
                                                        <Checkbox
                                                            checked={checked}
                                                            onCheckedChange={(c) => toggleEmployee(emp.id, c)}
                                                        />
                                                        <div className="flex-1">
                                                            <p className="font-medium text-sm">
                                                                {emp.first_name} {emp.last_name}
                                                            </p>
                                                            <p className="text-xs text-gray-500">{emp.email}</p>
                                                            <div className="mt-1 flex gap-2">
                                                                {emp.branch && (
                                                                    <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800 dark:bg-green-900 dark:text-green-200">
                                                                        {emp.branch.name}
                                                                    </span>
                                                                )}
                                                                {emp.department && (
                                                                    <span className="inline-block rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                                                        {emp.department.name}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                                <InputError message={errors.employee_ids as any} />
                            </div>

                            <div className="flex items-center gap-3">
                                <Button type="submit" disabled={processing}>
                                    Create Evaluator Group
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

