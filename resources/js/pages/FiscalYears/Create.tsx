import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type BreadcrumbItem } from '@/types';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        gregorian_start_date: '',
        gregorian_end_date: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('fiscal-years.store'));
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Ethiopian Fiscal Years', href: '/fiscal-years' },
        { title: 'Create Fiscal Year', href: '/fiscal-years/create' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Fiscal Year" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Card>
                    <CardHeader className="flex items-center justify-between">
                        <CardTitle>Create Ethiopian Fiscal Year</CardTitle>
                        <CardAction>
                            <Link href={'/fiscal-years'}>
                                <Button variant={'default'}>Go Back</Button>
                            </Link>
                        </CardAction>
                    </CardHeader>
                    <hr />
                    <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Fiscal Year Name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="e.g., EFY 2017"
                                className={errors.name ? 'border-red-500' : ''}
                            />
                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                            <p className="text-xs text-gray-500">
                                Ethiopian Fiscal Year format (e.g., EFY 2017, EFY 2018)
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="gregorian_start_date">Gregorian Start Date</Label>
                                <Input
                                    id="gregorian_start_date"
                                    type="date"
                                    value={data.gregorian_start_date}
                                    onChange={(e) => setData('gregorian_start_date', e.target.value)}
                                    className={errors.gregorian_start_date ? 'border-red-500' : ''}
                                />
                                {errors.gregorian_start_date && (
                                    <p className="text-sm text-red-500">{errors.gregorian_start_date}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="gregorian_end_date">Gregorian End Date</Label>
                                <Input
                                    id="gregorian_end_date"
                                    type="date"
                                    value={data.gregorian_end_date}
                                    onChange={(e) => setData('gregorian_end_date', e.target.value)}
                                    className={errors.gregorian_end_date ? 'border-red-500' : ''}
                                />
                                {errors.gregorian_end_date && (
                                    <p className="text-sm text-red-500">{errors.gregorian_end_date}</p>
                                )}
                            </div>
                        </div>

                        {/* Status removed */}

                        <div className="flex justify-end gap-4">
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Creating...' : 'Create Fiscal Year'}
                            </Button>
                            <Button type="button" variant="outline" asChild>
                                <Link href={'/fiscal-years'}>Cancel</Link>
                            </Button>
                        </div>
                    </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

