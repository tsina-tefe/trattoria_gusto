import SmsBalance from '@/components/sms-balance/SmsBalance';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PowerIcon, PowerOffIcon, AlertCircleIcon, CheckCircle2Icon } from 'lucide-react';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import InputError from '@/components/input-error';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'SMS Management', href: '/sms-balance' },
];

type SmsSettings = {
    id: number;
    is_active: boolean;
    deactivation_reason: string | null;
    updated_by: number | null;
    updater?: {
        id: number;
        name: string;
    };
    created_at: string;
    updated_at: string;
};

type Props = {
    balance: any;
    smsSettings: SmsSettings;
    lastUpdated: string;
    userPermissions: string[];
};

export default function SmsBalanceIndex({ balance, smsSettings, lastUpdated, userPermissions }: Props) {
    const { flash } = usePage<{ flash: { success?: string; warning?: string; error?: string } }>().props;
    const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
    const [isActivating, setIsActivating] = useState(false);

    const canManageSms = userPermissions.includes('manage sms settings');

    const { data, setData, post, processing, errors, reset } = useForm({
        reason: '',
    });

    // Show flash messages
    if (flash.success) {
        toast.success(flash.success);
    }
    if (flash.warning) {
        toast.warning(flash.warning);
    }
    if (flash.error) {
        toast.error(flash.error);
    }

    const handleActivate = () => {
        setIsActivating(true);
        router.post(
            route('sms-balance.activate'),
            {},
            {
                onFinish: () => setIsActivating(false),
            }
        );
    };

    const handleDeactivate = () => {
        post(route('sms-balance.deactivate'), {
            onSuccess: () => {
                setIsDeactivateDialogOpen(false);
                reset();
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="SMS Management" />

            <div className="container mx-auto space-y-6 p-6">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* SMS Status Card */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        SMS Service Status
                                        {smsSettings.is_active ? (
                                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                <CheckCircle2Icon className="mr-1 size-3" />
                                                Active
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                                <AlertCircleIcon className="mr-1 size-3" />
                                                Deactivated
                                            </Badge>
                                        )}
                                    </CardTitle>
                                    <CardDescription>
                                        {smsSettings.is_active
                                            ? 'SMS notifications are currently enabled and will be sent automatically'
                                            : 'SMS notifications are currently disabled and will not be sent'}
                                    </CardDescription>
                                </div>
                                {canManageSms && (
                                    <div>
                                        {smsSettings.is_active ? (
                                            <Button
                                                variant="destructive"
                                                onClick={() => setIsDeactivateDialogOpen(true)}
                                                className="flex items-center gap-2"
                                            >
                                                <PowerOffIcon className="size-4" />
                                                Deactivate SMS
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="default"
                                                onClick={handleActivate}
                                                disabled={isActivating}
                                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                                            >
                                                <PowerIcon className="size-4" />
                                                {isActivating ? 'Activating...' : 'Activate SMS'}
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {!smsSettings.is_active && smsSettings.deactivation_reason && (
                                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
                                    <div className="flex items-start gap-3">
                                        <AlertCircleIcon className="size-5 text-amber-600 dark:text-amber-400" />
                                        <div className="space-y-1">
                                            <p className="font-semibold text-sm text-amber-900 dark:text-amber-100">
                                                Deactivation Reason:
                                            </p>
                                            <p className="text-sm text-amber-800 dark:text-amber-200">
                                                {smsSettings.deactivation_reason}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="grid gap-4 md:grid-cols-2">
                                {smsSettings.updater && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Last Updated By</p>
                                        <p className="font-medium">{smsSettings.updater.name}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm text-muted-foreground">Last Updated</p>
                                    <p className="font-medium">{new Date(smsSettings.updated_at).toLocaleString()}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* SMS Balance Card */}
                    <SmsBalance balance={balance} lastUpdated={lastUpdated} />
                </div>
            </div>

            {/* Deactivate Dialog */}
            <Dialog open={isDeactivateDialogOpen} onOpenChange={setIsDeactivateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Deactivate SMS Service</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for deactivating the SMS service. This will prevent all SMS
                            notifications from being sent until the service is reactivated.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="reason">Deactivation Reason *</Label>
                            <Textarea
                                id="reason"
                                placeholder="e.g., Low balance - recharging account, Maintenance, etc."
                                value={data.reason}
                                onChange={(e) => setData('reason', e.target.value)}
                                rows={4}
                                className="resize-none"
                            />
                            <InputError message={errors.reason} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setIsDeactivateDialogOpen(false);
                                reset();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleDeactivate}
                            disabled={processing || !data.reason}
                        >
                            {processing ? 'Deactivating...' : 'Deactivate'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
