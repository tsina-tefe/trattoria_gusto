import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Position } from '@/types/positions';
import { Head, Link, useForm } from '@inertiajs/react';
import React from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Positions',
        href: '/positions',
    },
    {
        title: 'Edit Position',
        href: null,
    },
];

export default function EditPosition({ position }: { position: Position }) {
    const { data, setData, put, errors, processing } = useForm({
        title: position.title,
        level: position.level,
        description: position.description || '',
    });

    function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        put(`/positions/${position.id}`);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Position" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Card>
                    <CardHeader className="flex items-center justify-between">
                        <CardTitle>Edit Position</CardTitle>
                        <CardAction>
                            <Link href="/positions">
                                <Button variant="default">Go Back</Button>
                            </Link>
                        </CardAction>
                    </CardHeader>
                    <hr />
                    <CardContent>
                        <form onSubmit={submit}>
                            <div className="mb-4">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    aria-invalid={!!errors.title}
                                    placeholder="Enter position title"
                                />
                                <InputError message={errors.title} />
                            </div>
                            <div className="mb-4">
                                <Label htmlFor="level">Level</Label>
                                <Select
                                    value={data.level}
                                    onValueChange={(value) => setData('level', value as 'Team' | 'Manager' | 'Director' | 'General Manager' | 'CEO')}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Team">Team</SelectItem>
                                        <SelectItem value="Manager">Manager</SelectItem>
                                        <SelectItem value="Director">Director</SelectItem>
                                        <SelectItem value="General Manager">General Manager</SelectItem>
                                        <SelectItem value="CEO">CEO</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.level} />
                            </div>
                            <div className="mb-4">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    type="text"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    aria-invalid={!!errors.description}
                                    placeholder="Enter description (optional)"
                                />
                                <InputError message={errors.description} />
                            </div>
                            <div className="flex justify-end">
                                <Button size="lg" type="submit" disabled={processing}>
                                    Update
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}