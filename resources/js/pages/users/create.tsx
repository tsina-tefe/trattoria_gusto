import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, EmployeeOption } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Check, ChevronsUpDown } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Create User',
        href: '/users/create',
    },
];

export default function CreateUsers({ roles, employees }: { roles: string[]; employees: EmployeeOption[] }) {
    const { data, setData, post, errors, processing } = useForm({
        employee_id: '',
        name: '',
        email: '',
        password: '',
        roles: [] as string[],
    });

    function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        post('/users');
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create User" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Card>
                    <CardHeader className="flex items-center justify-between">
                        <CardTitle>Create User</CardTitle>
                        <CardAction>
                            <Link href={'/users'}>
                                <Button variant={'default'}>Go Back</Button>
                            </Link>
                        </CardAction>
                    </CardHeader>
                    <hr />
                    <CardContent>
                        <form onSubmit={submit}>
                            <div className="mb-4">
                                <Label htmlFor="employee_id">Employee</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={false}
                                            className="w-full justify-between"
                                        >
                                            {data.employee_id
                                                ? employees.find((emp) => emp.id.toString() === data.employee_id)?.name
                                                : 'Select employee...'}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0">
                                        <Command>
                                            <CommandInput placeholder="Search employees..." />
                                            <CommandList>
                                                <CommandEmpty>No employees found.</CommandEmpty>
                                                <CommandGroup>
                                                    {employees.map((employee) => (
                                                        <CommandItem
                                                            key={employee.id}
                                                            value={`${employee.employee_code} ${employee.name}`}
                                                            onSelect={() => setData('employee_id', employee.id.toString())}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    'mr-2 h-4 w-4',
                                                                    data.employee_id === employee.id.toString() ? 'opacity-100' : 'opacity-0'
                                                                )}
                                                            />
                                                            {employee.employee_code} - {employee.name}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                <InputError message={errors.employee_id} />
                            </div>
                            <div className="mb-4">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    aria-invalid={!!errors.name}
                                    placeholder="Enter user name"
                                />
                                <InputError message={errors.name} />
                            </div>
                            <div className="mb-4">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    aria-invalid={!!errors.email}
                                    placeholder="Enter email"
                                />
                                <InputError message={errors.email} />
                            </div>
                            <div className="mb-4">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    aria-invalid={!!errors.password}
                                    placeholder="Enter password"
                                />
                                <InputError message={errors.password} />
                            </div>
                            <Label>Select Roles</Label>
                            <div className="my-4">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                                    {roles.map((role) => (
                                        <div key={role} className="flex items-center gap-3">
                                            <Checkbox
                                                id={role}
                                                checked={data.roles.includes(role)}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setData('roles', [...data.roles, role]);
                                                    } else {
                                                        setData('roles', data.roles.filter((p) => p !== role));
                                                    }
                                                }}
                                            />
                                            <Label htmlFor={role}>{role}</Label>
                                        </div>
                                    ))}
                                </div>
                                <InputError message={errors.roles} />
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