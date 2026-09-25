import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { Head, router, usePage } from '@inertiajs/react';
import { BreadcrumbItem, SharedData } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { PencilIcon, CheckIcon, XIcon, PlusIcon } from 'lucide-react';
import { ActionSuccessModal } from '@/components/pre-order/action-success-modal';

interface PaymentSetting {
    id: number;
    payment_method: string;
    validation_pattern: string | null;
    example: string | null;
    is_active: boolean;
}

interface Props {
    paymentSettings: PaymentSetting[];
}

export default function PaymentSettings({ paymentSettings }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Pre-Orders', href: '/pre-orders' },
        { title: 'Payment Settings', href: '/pre-order-payment-settings' },
    ];

    // Permission check
    const { auth } = usePage<SharedData>().props;
    const permissions = auth.user?.permissions || [];
    const canManage = permissions.includes('manage pre-order payment settings') || true; // Fallback since Route is protected

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState({
        validation_pattern: '',
        example: '',
        is_active: true
    });
    const [successModal, setSuccessModal] = useState({ isOpen: false, title: '', description: '' });

    const handleEdit = (setting: PaymentSetting) => {
        setEditingId(setting.id);
        setEditForm({
            validation_pattern: setting.validation_pattern || '',
            example: setting.example || '',
            is_active: setting.is_active
        });
    };

    const handleCancel = () => {
        setEditingId(null);
    };

    const handleSave = (id: number) => {
        // Prepare data replacing empty string with nulls
        const data = {
            validation_pattern: editForm.validation_pattern.trim() || null,
            example: editForm.example.trim() || null,
            is_active: editForm.is_active
        };

        router.put(`/pre-order-payment-settings/${id}`, data, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingId(null);
                setSuccessModal({
                    isOpen: true,
                    title: 'Settings Updated',
                    description: 'The payment method validation setting has been successfully updated.',
                });
            },
            onError: (errors) => {
                const message = Object.values(errors).flat()[0] || 'An error occurred';
                toast.error(message);
            }
        });
    };

    const handleToggleActive = (setting: PaymentSetting, newStatus: boolean) => {
        router.put(`/pre-order-payment-settings/${setting.id}`, {
            validation_pattern: setting.validation_pattern,
            example: setting.example,
            is_active: newStatus
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`${setting.payment_method} has been ${newStatus ? 'activated' : 'deactivated'}.`);
            },
            onError: (errors) => {
                const message = Object.values(errors).flat()[0] || 'An error occurred';
                toast.error(message);
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payment Settings" />

            <div className="container mx-auto p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Payment Method Verification Settings"
                        description="Configure validation rules for transaction references by payment method."
                    />
                </div>

                <div className="rounded-lg border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[150px]">Payment Method</TableHead>
                                <TableHead className="w-[300px]">Regex Pattern</TableHead>
                                <TableHead className="w-[200px]">Example Reference</TableHead>
                                <TableHead className="w-[100px] text-center">Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paymentSettings.map((setting) => (
                                <TableRow key={setting.id}>
                                    <TableCell className="font-medium">{setting.payment_method}</TableCell>

                                    <TableCell>
                                        {editingId === setting.id ? (
                                            <Input
                                                value={editForm.validation_pattern}
                                                onChange={(e) => setEditForm({ ...editForm, validation_pattern: e.target.value })}
                                                placeholder="e.g. ^\d{10}$ or leave empty"
                                                className="h-8"
                                            />
                                        ) : (
                                            <code className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                                {setting.validation_pattern || 'No validation (accepts any)'}
                                            </code>
                                        )}
                                    </TableCell>

                                    <TableCell>
                                        {editingId === setting.id ? (
                                            <Input
                                                value={editForm.example}
                                                onChange={(e) => setEditForm({ ...editForm, example: e.target.value })}
                                                placeholder="e.g. FT24123..."
                                                className="h-8"
                                            />
                                        ) : (
                                            setting.example || <span className="text-muted-foreground italic">None</span>
                                        )}
                                    </TableCell>

                                    <TableCell className="text-center">
                                        {editingId === setting.id ? (
                                            <Switch
                                                checked={editForm.is_active}
                                                onCheckedChange={(checked) => setEditForm({ ...editForm, is_active: checked })}
                                            />
                                        ) : (
                                            <Switch
                                                checked={setting.is_active}
                                                onCheckedChange={(checked) => handleToggleActive(setting, checked)}
                                                disabled={!canManage}
                                            />
                                        )}
                                    </TableCell>

                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {editingId === setting.id ? (
                                                <>
                                                    <Button variant="ghost" size="icon" onClick={() => handleSave(setting.id)} className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50">
                                                        <CheckIcon className="size-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={handleCancel} className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
                                                        <XIcon className="size-4" />
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(setting)} className="h-8 w-8" disabled={!canManage}>
                                                    <PencilIcon className="size-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <ActionSuccessModal
                isOpen={successModal.isOpen}
                onClose={() => setSuccessModal({ ...successModal, isOpen: false })}
                title={successModal.title}
                description={successModal.description}
            />
        </AppLayout>
    );
}
