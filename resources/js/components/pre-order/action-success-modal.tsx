import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2Icon } from 'lucide-react';

interface ActionSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    buttonText?: string;
}

export function ActionSuccessModal({
    isOpen,
    onClose,
    title = 'Action Successful',
    description = 'The operation was completed successfully.',
    buttonText = 'Dismiss',
}: ActionSuccessModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader className="flex flex-col items-center gap-4 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                        <CheckCircle2Icon className="h-10 w-10 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="space-y-1">
                        <DialogTitle className="text-xl">{title}</DialogTitle>
                        <DialogDescription className="text-base">
                            {description}
                        </DialogDescription>
                    </div>
                </DialogHeader>
                <DialogFooter className="sm:justify-center">
                    <Button
                        type="button"
                        onClick={onClose}
                        className="w-full sm:w-32 bg-green-600 hover:bg-green-700 text-white"
                    >
                        {buttonText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
