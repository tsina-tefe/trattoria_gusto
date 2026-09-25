import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Check, ChevronsUpDown } from 'lucide-react';
import React, { useState } from 'react';
import { cn } from '@/lib/utils';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Employees',
        href: '/employees',
    },
    {
        title: 'Create Employee',
        href: '/employees/create',
    },
];

interface SelectOption {
    id: number;
    name?: string;
    title?: string;
}

export default function CreateEmployee({
    branches,
    departments,
    positions,
}: {
    branches: SelectOption[];
    departments: SelectOption[];
    positions: SelectOption[];
}) {
    const { data, setData, post, errors, processing, setError } = useForm({
        employee_code: '',
        first_name: '',
        last_name: '',
        phone: '',
        gender: '' as 'male' | 'female' | '',
        date_of_birth: '',
        email: '',
        hire_date: '',
        image: null as File | null,
        branch_id: '',
        department_id: '',
        position_id: '',
        status: 'active' as 'active' | 'inactive' | 'terminated',
    });

    const [imagePreview, setImagePreview] = useState<string | null>(null);

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] || null;
        setData('image', file);
        if (file) {
            setImagePreview(URL.createObjectURL(file));
        } else {
            setImagePreview(null);
        }
    }

    function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!data.image || data.image instanceof File) {
            post('/employees', {
                onFinish: () => {
                    if (imagePreview) {
                        URL.revokeObjectURL(imagePreview); // Clean up preview URL
                    }
                },
            });
        } else {
            setError('image', 'Please select a valid image file.');
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Employee" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Card>
                    <CardHeader className="flex items-center justify-between">
                        <CardTitle>Create Employee</CardTitle>
                        <CardAction>
                            <Link href="/employees">
                                <Button variant="default">Go Back</Button>
                            </Link>
                        </CardAction>
                    </CardHeader>
                    <hr />
                    <CardContent>
                        <form onSubmit={submit}>
                            <Tabs defaultValue="personal" className="w-full">
                                <TabsList className="grid w-full grid-cols-4">
                                    <TabsTrigger value="personal">Personal Info</TabsTrigger>
                                    <TabsTrigger value="contact">Contact Info</TabsTrigger>
                                    <TabsTrigger value="employment">Employment Details</TabsTrigger>
                                    <TabsTrigger value="image">Profile Image</TabsTrigger>
                                </TabsList>
                                <TabsContent value="personal">
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="mb-4">
                                            <Label htmlFor="employee_code">Employee Code</Label>
                                            <Input
                                                id="employee_code"
                                                type="text"
                                                value={data.employee_code}
                                                onChange={(e) => setData('employee_code', e.target.value)}
                                                aria-invalid={!!errors.employee_code}
                                                placeholder="Enter employee code"
                                            />
                                            <InputError message={errors.employee_code} />
                                        </div>
                                        <div className="mb-4">
                                            <Label htmlFor="first_name">First Name</Label>
                                            <Input
                                                id="first_name"
                                                type="text"
                                                value={data.first_name}
                                                onChange={(e) => setData('first_name', e.target.value)}
                                                aria-invalid={!!errors.first_name}
                                                placeholder="Enter first name"
                                            />
                                            <InputError message={errors.first_name} />
                                        </div>
                                        <div className="mb-4">
                                            <Label htmlFor="last_name">Last Name</Label>
                                            <Input
                                                id="last_name"
                                                type="text"
                                                value={data.last_name}
                                                onChange={(e) => setData('last_name', e.target.value)}
                                                aria-invalid={!!errors.last_name}
                                                placeholder="Enter last name"
                                            />
                                            <InputError message={errors.last_name} />
                                        </div>
                                        <div className="mb-4">
                                            <Label htmlFor="gender">Gender</Label>
                                            <Select
                                                value={data.gender}
                                                onValueChange={(value) => setData('gender', value as 'male' | 'female')}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select gender" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="male">Male</SelectItem>
                                                    <SelectItem value="female">Female</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.gender} />
                                        </div>
                                        <div className="mb-4">
                                            <Label htmlFor="date_of_birth">Date of Birth</Label>
                                            <Input
                                                id="date_of_birth"
                                                type="date"
                                                value={data.date_of_birth}
                                                onChange={(e) => setData('date_of_birth', e.target.value)}
                                                aria-invalid={!!errors.date_of_birth}
                                            />
                                            <InputError message={errors.date_of_birth} />
                                        </div>
                                    </div>
                                </TabsContent>
                                <TabsContent value="contact">
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="mb-4">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                aria-invalid={!!errors.email}
                                                placeholder="Enter email (optional)"
                                            />
                                            <InputError message={errors.email} />
                                        </div>
                                        <div className="mb-4">
                                            <Label htmlFor="phone">Phone</Label>
                                            <Input
                                                id="phone"
                                                type="text"
                                                value={data.phone}
                                                onChange={(e) => setData('phone', e.target.value)}
                                                aria-invalid={!!errors.phone}
                                                placeholder="Enter phone (optional)"
                                            />
                                            <InputError message={errors.phone} />
                                        </div>
                                    </div>
                                </TabsContent>
                                <TabsContent value="employment">
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="mb-4">
                                            <Label htmlFor="branch_id">Branch</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        aria-expanded={false}
                                                        className="w-full justify-between"
                                                    >
                                                        {data.branch_id
                                                            ? branches.find((branch) => branch.id.toString() === data.branch_id)?.name
                                                            : 'Select branch...'}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-full p-0">
                                                    <Command>
                                                        <CommandInput placeholder="Search branches..." />
                                                        <CommandList>
                                                            <CommandEmpty>No branches found.</CommandEmpty>
                                                            <CommandGroup>
                                                                {branches.map((branch) => (
                                                                    <CommandItem
                                                                        key={branch.id}
                                                                        value={branch.name}
                                                                        onSelect={() => setData('branch_id', branch.id.toString())}
                                                                    >
                                                                        <Check
                                                                            className={cn(
                                                                                'mr-2 h-4 w-4',
                                                                                data.branch_id === branch.id.toString() ? 'opacity-100' : 'opacity-0'
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
                                            <InputError message={errors.branch_id} />
                                        </div>
                                        <div className="mb-4">
                                            <Label htmlFor="department_id">Department</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        aria-expanded={false}
                                                        className="w-full justify-between"
                                                    >
                                                        {data.department_id
                                                            ? departments.find((dept) => dept.id.toString() === data.department_id)?.name
                                                            : 'Select department...'}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-full p-0">
                                                    <Command>
                                                        <CommandInput placeholder="Search departments..." />
                                                        <CommandList>
                                                            <CommandEmpty>No departments found.</CommandEmpty>
                                                            <CommandGroup>
                                                                {departments.map((department) => (
                                                                    <CommandItem
                                                                        key={department.id}
                                                                        value={department.name}
                                                                        onSelect={() => setData('department_id', department.id.toString())}
                                                                    >
                                                                        <Check
                                                                            className={cn(
                                                                                'mr-2 h-4 w-4',
                                                                                data.department_id === department.id.toString() ? 'opacity-100' : 'opacity-0'
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
                                            <InputError message={errors.department_id} />
                                        </div>
                                        <div className="mb-4">
                                            <Label htmlFor="position_id">Position</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        aria-expanded={false}
                                                        className="w-full justify-between"
                                                    >
                                                        {data.position_id
                                                            ? positions.find((pos) => pos.id.toString() === data.position_id)?.title
                                                            : 'Select position...'}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-full p-0">
                                                    <Command>
                                                        <CommandInput placeholder="Search positions..." />
                                                        <CommandList>
                                                            <CommandEmpty>No positions found.</CommandEmpty>
                                                            <CommandGroup>
                                                                {positions.map((position) => (
                                                                    <CommandItem
                                                                        key={position.id}
                                                                        value={position.title}
                                                                        onSelect={() => setData('position_id', position.id.toString())}
                                                                    >
                                                                        <Check
                                                                            className={cn(
                                                                                'mr-2 h-4 w-4',
                                                                                data.position_id === position.id.toString() ? 'opacity-100' : 'opacity-0'
                                                                            )}
                                                                        />
                                                                        {position.title}
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                            <InputError message={errors.position_id} />
                                        </div>
                                        <div className="mb-4">
                                            <Label htmlFor="hire_date">Hire Date</Label>
                                            <Input
                                                id="hire_date"
                                                type="date"
                                                value={data.hire_date}
                                                onChange={(e) => setData('hire_date', e.target.value)}
                                                aria-invalid={!!errors.hire_date}
                                            />
                                            <InputError message={errors.hire_date} />
                                        </div>
                                        <div className="mb-4">
                                            <Label htmlFor="status">Status</Label>
                                            <Select
                                                value={data.status}
                                                onValueChange={(value) => setData('status', value as 'active' | 'inactive' | 'terminated')}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="active">Active</SelectItem>
                                                    <SelectItem value="inactive">Inactive</SelectItem>
                                                    <SelectItem value="terminated">Terminated</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.status} />
                                        </div>
                                    </div>
                                </TabsContent>
                                <TabsContent value="image">
                                    <div className="mb-4">
                                        <Label htmlFor="image">Profile Image</Label>
                                        {imagePreview && (
                                            <div className="mb-2">
                                                <img
                                                    src={imagePreview}
                                                    alt="Selected profile preview"
                                                    className="h-20 w-20 object-cover rounded-full"
                                                />
                                            </div>
                                        )}
                                        <Input
                                            id="image"
                                            type="file"
                                            accept="image/jpeg,image/png,image/jpg"
                                            onChange={handleImageChange}
                                            aria-invalid={!!errors.image}
                                        />
                                        <InputError message={errors.image} />
                                    </div>
                                </TabsContent>
                            </Tabs>
                            <div className="flex justify-end mt-4">
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