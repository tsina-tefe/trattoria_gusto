import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { type BreadcrumbItem } from '@/types';
import type { EvaluatorGroup, EvaluatesGroup } from '@/types/evaluation';

type EvaluationCategory = {
    id: number;
    name: string;
};

type Props = {
    evaluatorGroups: EvaluatorGroup[];
    evaluatesGroups: EvaluatesGroup[];
    evaluationCategories: EvaluationCategory[];
};

export default function Create({ evaluatorGroups, evaluatesGroups, evaluationCategories }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        evaluator_group_id: '',
        evaluates_group_id: '',
    });

    const [nameInput, setNameInput] = React.useState('');
    const [showSuggestions, setShowSuggestions] = React.useState(false);
    const nameRef = React.useRef<HTMLDivElement>(null);

    const filtered = evaluationCategories.filter((c) =>
        c.name.toLowerCase().includes(nameInput.toLowerCase())
    );

    // Close suggestions on outside click
    React.useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (nameRef.current && !nameRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleNameChange = (value: string) => {
        setNameInput(value);
        setData('name', value);
        setShowSuggestions(true);
    };

    const handleSelectSuggestion = (name: string) => {
        setNameInput(name);
        setData('name', name);
        setShowSuggestions(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('evaluations.store'));
    };

    const getEvaluableTypeBadgeColor = (type: string) => {
        switch (type) {
            case 'employee':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
            case 'department':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'branch':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'other':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Evaluations', href: '/evaluations' },
        { title: 'Create Evaluation', href: '/evaluations/create' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Evaluation" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Card>
                    <CardHeader className="flex items-center justify-between">
                        <CardTitle>Create Evaluation</CardTitle>
                        <CardAction>
                            <Link href={'/evaluations'}>
                                <Button variant={'default'}>Go Back</Button>
                            </Link>
                        </CardAction>
                    </CardHeader>
                    <hr />
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Evaluation Name - combobox */}
                            <div className="space-y-2">
                                <Label htmlFor="name">Evaluation Name</Label>
                                <div className="relative" ref={nameRef}>
                                    <Input
                                        id="name"
                                        value={nameInput}
                                        onChange={(e) => handleNameChange(e.target.value)}
                                        onFocus={() => setShowSuggestions(true)}
                                        placeholder="Type or select an evaluation name..."
                                        className={errors.name ? 'border-red-500' : ''}
                                        autoComplete="off"
                                    />
                                    {showSuggestions && (filtered.length > 0 || nameInput.trim()) && (
                                        <ul className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-md border bg-popover shadow-md">
                                            {nameInput.trim() && !filtered.some((c) => c.name.toLowerCase() === nameInput.toLowerCase()) && (
                                                <li
                                                    className="cursor-pointer px-3 py-2 text-sm font-medium text-primary hover:bg-accent"
                                                    onMouseDown={() => handleSelectSuggestion(nameInput.trim())}
                                                >
                                                    Create "<span className="font-semibold">{nameInput.trim()}</span>"
                                                </li>
                                            )}
                                            {filtered.map((cat) => (
                                                <li
                                                    key={cat.id}
                                                    className="cursor-pointer px-3 py-2 text-sm hover:bg-accent"
                                                    onMouseDown={() => handleSelectSuggestion(cat.name)}
                                                >
                                                    {cat.name}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="evaluator_group_id">Evaluator Group (Who Evaluates)</Label>
                                <Select
                                    value={data.evaluator_group_id}
                                    onValueChange={(value) => setData('evaluator_group_id', value)}
                                >
                                    <SelectTrigger className={errors.evaluator_group_id ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Select evaluator group" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {evaluatorGroups.map((group) => (
                                            <SelectItem key={group.id} value={group.id.toString()}>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{group.name}</span>
                                                    {group.question_group && (
                                                        <span className="text-xs text-gray-500">
                                                            Questions: {group.question_group.name}
                                                        </span>
                                                    )}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.evaluator_group_id && (
                                    <p className="text-sm text-red-500">{errors.evaluator_group_id}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="evaluates_group_id">Evaluates Group (What is Being Evaluated)</Label>
                                <Select
                                    value={data.evaluates_group_id}
                                    onValueChange={(value) => setData('evaluates_group_id', value)}
                                >
                                    <SelectTrigger className={errors.evaluates_group_id ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Select evaluates group" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {evaluatesGroups.map((group) => (
                                            <SelectItem key={group.id} value={group.id.toString()}>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{group.name}</span>
                                                        {group.question_group && (
                                                            <span className="text-xs text-gray-500">
                                                                Questions: {group.question_group.name}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span
                                                        className={`ml-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${getEvaluableTypeBadgeColor(group.evaluable_type)}`}
                                                    >
                                                        {group.evaluable_type}
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.evaluates_group_id && (
                                    <p className="text-sm text-red-500">{errors.evaluates_group_id}</p>
                                )}
                            </div>



                            <div className="flex justify-end gap-4">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Creating...' : 'Create Evaluation'}
                                </Button>
                                <Button type="button" variant="outline" asChild>
                                    <Link href={'/evaluations'}>Cancel</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

