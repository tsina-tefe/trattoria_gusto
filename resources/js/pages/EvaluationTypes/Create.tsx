import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import React from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Evaluation Types',
        href: '/evaluation-types',
    },
    {
        title: 'Create Evaluation Type',
        href: '/evaluation-types/create',
    },
];

export default function CreateEvaluationType() {
    const { data, setData, post, errors, processing } = useForm({
        name: '',
        evaluation_type: '',
    });

    function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        post('/evaluation-types');
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Evaluation Type" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Card>
                    <CardHeader className="flex items-center justify-between">
                        <CardTitle>Create Evaluation Type</CardTitle>
                        <CardAction>
                            <Link href={'/evaluation-types'}>
                                <Button variant={'default'}>Go Back</Button>
                            </Link>
                        </CardAction>
                    </CardHeader>
                    <hr />
                    <CardContent>
                        <form onSubmit={submit}>
                            <div className="mb-4">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    aria-invalid={!!errors.name}
                                    placeholder="Enter evaluation type name"
                                />
                                <InputError message={errors.name} />
                            </div>
                            <div className="mb-4">
                                <Label htmlFor="evaluation_type">Type</Label>
                                <Select
                                    value={data.evaluation_type}
                                    onValueChange={(value) => setData('evaluation_type', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="person">Person</SelectItem>
                                        <SelectItem value="department">Department</SelectItem>
                                        <SelectItem value="branch">Branch</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.evaluation_type} />
                            </div>
                            <div className="flex justify-end">
                                <Button size={'lg'} type="submit" disabled={processing}>
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