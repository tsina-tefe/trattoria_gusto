import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { MessageSquareText, Save, Sparkles, Variable, Copy, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Pre-Orders', href: '/pre-orders' },
    { title: 'SMS Templates', href: '/pre-orders/sms-templates' },
];

type SmsTemplate = {
    id: number;
    name: string;
    content: string;
    variables: string[];
};

export default function Index({ templates }: { templates: SmsTemplate[] }) {
    const [selectedTemplate, setSelectedTemplate] = useState<SmsTemplate | null>(templates[0] || null);
    
    // Track message length for SMS segments (roughly 160 per standard, or 70 for Unicode/Geez)
    const [messageLength, setMessageLength] = useState(0);

    const { data, setData, put, processing, clearErrors } = useForm({
        content: selectedTemplate?.content || '',
    });

    const isFormDirty = selectedTemplate ? data.content !== selectedTemplate.content : false;

    useEffect(() => {
        setMessageLength(data.content.length);
    }, [data.content]);

    const handleSelectTemplate = (template: SmsTemplate) => {
        setSelectedTemplate(template);
        setData('content', template.content);
        clearErrors();
    };

    const insertVariable = (variable: string) => {
        const textarea = document.getElementById('template-content') as HTMLTextAreaElement;
        
        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = data.content;
            const newText = text.substring(0, start) + variable + text.substring(end);
            
            setData('content', newText);
            
            // Set focus back and move cursor after inserted variable
            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(start + variable.length, start + variable.length);
            }, 10);
        } else {
            setData('content', data.content + variable);
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTemplate) return;

        put(`/pre-orders/sms-templates/${selectedTemplate.id}`, {
            preserveScroll: true,
            onSuccess: (page: any) => {
                toast.success(page.props.success || 'Template updated successfully');
                const updatedTemplate = { ...selectedTemplate, content: data.content };
                setSelectedTemplate(updatedTemplate);
            },
            onError: () => {
                toast.error('Failed to update template');
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="SMS Templates" />

            <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
                {/* Premium Header */}
                <div className="relative overflow-hidden rounded-2xl bg-primary text-primary-foreground p-8 shadow-lg">
                    <div className="absolute inset-0 bg-[url('/img/grid.svg')] opacity-20 dark:opacity-10 dark:invert"></div>
                    <div className="absolute -right-20 -top-20 size-64 rounded-full bg-background/10 blur-3xl"></div>
                    <div className="relative z-10 flex items-center gap-6">
                        <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-background/10 shadow-inner backdrop-blur-md border border-primary-foreground/20">
                            <MessageSquareText className="size-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl shadow-sm">
                                SMS Templates
                            </h1>
                            <p className="mt-2 text-primary-foreground/90 text-lg font-medium drop-shadow-sm">
                                Design and manage automated customer notifications.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Sidebar - Template Selection */}
                    <div className="lg:col-span-4 space-y-4">
                        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-2">
                            Available Templates
                        </h2>
                        <div className="grid gap-3">
                            {templates.map(template => (
                                <button
                                    key={template.id}
                                    onClick={() => handleSelectTemplate(template)}
                                    className={`relative group flex flex-col items-start gap-1 p-4 rounded-xl text-left transition-all duration-300 border ${
                                        selectedTemplate?.id === template.id 
                                        ? 'bg-background border-primary shadow-sm ring-1 ring-primary/50' 
                                        : 'bg-muted/30 border-transparent hover:bg-background hover:border-border hover:shadow-sm'
                                    }`}
                                >
                                    <div className="flex items-center w-full justify-between">
                                        <span className={`font-semibold ${selectedTemplate?.id === template.id ? 'text-primary' : 'text-foreground'}`}>
                                            {template.name}
                                        </span>
                                        {selectedTemplate?.id === template.id && (
                                            <Sparkles className="size-4 text-primary animate-pulse" />
                                        )}
                                    </div>
                                    <span className="text-xs text-muted-foreground line-clamp-1 group-hover:line-clamp-none transition-all">
                                        {template.content || "Empty template"}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right Area - Editor */}
                    <div className="lg:col-span-8">
                        {selectedTemplate ? (
                            <Card className="border-0 shadow-xl ring-1 ring-border/50 bg-white/50 dark:bg-black/20 backdrop-blur-sm overflow-hidden">
                                <CardHeader className="bg-muted/30 border-b pb-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-2xl flex items-center gap-2 text-primary">
                                                {selectedTemplate.name}
                                            </CardTitle>
                                            <CardDescription className="mt-2 text-base">
                                                Use the dynamic variables to personalize the message.
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                
                                <form onSubmit={submit}>
                                    <CardContent className="p-6 space-y-6">
                                        {/* Variables Section */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                                                <Variable className="size-4 text-primary" />
                                                Dynamic Variables
                                            </div>
                                            <div className="flex flex-wrap gap-2 p-4 bg-muted/40 rounded-xl border border-dashed">
                                                {selectedTemplate.variables?.map(variable => (
                                                    <button
                                                        key={variable}
                                                        type="button"
                                                        onClick={() => insertVariable(variable)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors border border-primary/20 group"
                                                    >
                                                        {variable}
                                                        <Copy className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </button>
                                                ))}
                                                {(!selectedTemplate.variables || selectedTemplate.variables.length === 0) && (
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground w-full py-2">
                                                        <AlertCircle className="size-4" />
                                                        No dynamic variables are available for this specific template.
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Textarea */}
                                        <div className="space-y-2 relative">
                                            <Textarea
                                                id="template-content"
                                                rows={10}
                                                value={data.content}
                                                onChange={e => setData('content', e.target.value)}
                                                className="resize-y font-mono text-sm leading-relaxed p-4 rounded-xl border-muted-foreground/20 focus-visible:ring-primary/50 dark:bg-black/40 overflow-hidden shadow-inner"
                                                placeholder="Write your SMS message here..."
                                            />
                                            {/* Character Count Indicator */}
                                            <div className={`absolute bottom-3 right-4 text-xs font-medium px-2 py-1 rounded bg-background/80 backdrop-blur border ${
                                                messageLength > 160 ? (messageLength > 330 ? 'text-red-500 border-red-200' : 'text-amber-500 border-amber-200') : 'text-muted-foreground border-border'
                                            }`}>
                                                {messageLength} chars
                                            </div>
                                        </div>
                                    </CardContent>

                                    <CardFooter className="bg-muted/10 border-t p-6 flex items-center justify-between">
                                        <p className="text-xs text-muted-foreground">
                                            {isFormDirty ? 'Unsaved changes' : 'Template is up to date'}
                                        </p>
                                        <Button 
                                            type="submit" 
                                            disabled={processing || !isFormDirty}
                                            className="min-w-[140px] shadow-lg shadow-primary/20 transition-all rounded-full"
                                        >
                                            {processing ? (
                                                <span className="flex items-center gap-2">
                                                    <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Saving...
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    <Save className="size-4" />
                                                    Save Changes
                                                </span>
                                            )}
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Card>
                        ) : (
                            <div className="h-full min-h-[400px] flex items-center justify-center rounded-2xl border-2 border-dashed bg-muted/20">
                                <div className="text-center space-y-3">
                                    <div className="mx-auto size-12 rounded-full bg-muted flex items-center justify-center">
                                        <MessageSquareText className="size-6 text-muted-foreground" />
                                    </div>
                                    <p className="text-muted-foreground font-medium">Select a template to view and edit</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
