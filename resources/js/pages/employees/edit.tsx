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
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Check, ChevronsUpDown } from 'lucide-react';
import React, { useState } from 'react';
import { cn } from '@/lib/utils';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Employees',
        href: '/employees',
    },
    {
        title: 'Edit Employee',
        href: null,
    },
];

interface SelectOption {
    id: number;
    name?: string;
    title?: string;
}

interface Employee {
    id: number;
    employee_code: string;
    first_name: string;
    last_name: string;
    phone: string | null;
    gender: 'male' | 'female';
    date_of_birth: string | null;
    email: string | null;
    hire_date: string | null;
    image_id: number | null;
    image_path: string | null;
    branch_id: number;
    department_id: number;
    position_id: number;
    status: 'active' | 'inactive' | 'terminated';
}

export default function EditEmployee({
    employee,
    branches,
    departments,
    positions,
}: {
    employee: Employee;
    branches: SelectOption[];
    departments: SelectOption[];
    positions: SelectOption[];
}) {
    const { data, setData, post, put, errors, processing, setError } = useForm({
        employee_code: employee.employee_code,
        first_name: employee.first_name,
        last_name: employee.last_name,
        phone: employee.phone || '',
        gender: employee.gender,
        date_of_birth: employee.date_of_birth || '',
        email: employee.email || '',
        hire_date: employee.hire_date || '',
        image: null as File | null,
        _method: '' as string,
    remove_image: false as boolean,
        branch_id: employee.branch_id.toString(),
        department_id: employee.department_id.toString(),
        position_id: employee.position_id.toString(),
        status: employee.status,
    });

    // track explicit image removal request (mirrors form data)

    const [imagePreview, setImagePreview] = useState<string | null>(null);

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] || null;
        setData('image', file);
        // If user selects a new image, unset any previous remove_image flag
        if (file) {
            setData('remove_image', false);
        }
        if (file) {
            setImagePreview(URL.createObjectURL(file));
        } else {
            setImagePreview(null);
        }
    }

    function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const options = {
            onFinish: () => {
                if (imagePreview) {
                    URL.revokeObjectURL(imagePreview); // Clean up preview URL
                }
            },
        };

        // If an image File is present, build a FormData and send it via POST
        // with X-HTTP-Method-Override so Laravel treats it as PUT while receiving multipart data.
        if (data.image instanceof File) {
            const fd = new FormData();
            fd.append('_method', 'PUT');
            fd.append('employee_code', data.employee_code);
            fd.append('first_name', data.first_name);
            fd.append('last_name', data.last_name);
            fd.append('phone', data.phone || '');
            fd.append('gender', data.gender);
            fd.append('date_of_birth', data.date_of_birth || '');
            fd.append('email', data.email || '');
            fd.append('hire_date', data.hire_date || '');
            fd.append('branch_id', data.branch_id.toString());
            fd.append('department_id', data.department_id.toString());
            fd.append('position_id', data.position_id.toString());
            fd.append('status', data.status);
            fd.append('remove_image', data.remove_image ? '1' : '0');
            fd.append('image', data.image);

            router.post(`/employees/${employee.id}`, fd, {
                headers: {
                    'X-HTTP-Method-Override': 'PUT',
                },
                onFinish: () => {
                    if (imagePreview) {
                        URL.revokeObjectURL(imagePreview);
                    }
                },
            });

            return;
        }

        // No file present — use PUT (JSON) as before
        if (!data.image) {
            put(`/employees/${employee.id}`, options);
            return;
        }

        setError('image', 'Please select a valid image file.');
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Employee" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Card>
                    <CardHeader className="flex items-center justify-between">
                        <CardTitle>Edit Employee</CardTitle>
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
                                        {employee.image_path && !imagePreview && (
                                            <div className="mb-2">
                                                <img
                                                    src={`/storage/${employee.image_path}`}
                                                    alt={`${employee.first_name}'s current photo`}
                                                    className="h-20 w-20 object-cover rounded-full"
                                                />
                                            </div>
                                        )}
                                        {imagePreview && (
                                            <div className="mb-2">
                                                <img
                                                    src={imagePreview}
                                                    alt="Selected profile preview"
                                                    className="h-20 w-20 object-cover rounded-full"
                                                />
                                            </div>
                                        )}
                                        {/* Remove image control */}
                                        {employee.image_path && (
                                            <div className="mb-2 flex items-center gap-3">
                                                <input
                                                    id="remove_image"
                                                    type="checkbox"
                                                    checked={!!data.remove_image}
                                                    onChange={(e) => setData('remove_image', e.target.checked)}
                                                />
                                                <label htmlFor="remove_image" className="text-sm">
                                                    Remove current image
                                                </label>
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