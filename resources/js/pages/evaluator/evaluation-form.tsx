import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import InputError from '@/components/input-error';
import { ArrowLeft, Loader2, Star, Filter } from 'lucide-react';
import type { Evaluation } from '@/types/evaluation';
import type { Question } from '@/types/question';
import type { Employee } from '@/types/employees';
import type { EvaluationResponse } from '@/types/evaluation-response';
import type { PageProps } from '@/types';

type Branch = {
    id: number;
    name: string;
};

type Props = PageProps & {
    evaluation: Evaluation;
    questions: Question[];
    evaluatees: Employee[];
    existingResponse?: EvaluationResponse;
    branches?: Branch[];
    selectedBranchId?: string;
};

interface QuestionResponse {
    question_id: string;
    score: string;
}

export default function EvaluationForm({ evaluation, questions, evaluatees, existingResponse, branches = [], selectedBranchId }: Props) {
    const isEditing = !!existingResponse;
    const [branchFilter, setBranchFilter] = useState(selectedBranchId || '');
    const isBranchManagerEvaluation = evaluation.name.toLowerCase().includes('branch manager');
    const hasBranches = branches && branches.length > 0;
    
    const { data, setData, post, put, processing, errors } = useForm({
        evaluate_id: existingResponse?.evaluate_id?.toString() || '',
        comment: existingResponse?.comment || '',
        question_responses: existingResponse?.question_responses?.map(qr => ({
            question_id: qr.question_id.toString(),
            score: qr.score.toString()
        })) || questions.map(q => ({ question_id: q.id.toString(), score: '' })),
    });

    const handleBranchFilterChange = (value: string) => {
        setBranchFilter(value);
        const params = value ? { branch_id: value } : {};
        router.get(route('evaluator.evaluation.show', evaluation.id), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isEditing) {
            put(route('evaluator.evaluation.update', [evaluation.id, existingResponse.id]));
        } else {
            post(route('evaluator.evaluation.store', evaluation.id));
        }
    };

    const updateQuestionResponse = (questionId: string, score: string) => {
        const newResponses = data.question_responses.map(response => 
            response.question_id === questionId 
                ? { ...response, score }
                : response
        );
        setData('question_responses', newResponses);
    };

    const getScoreLabel = (score: number) => {
        switch (score) {
            case 1: return 'Poor';
            case 2: return 'Fair';
            case 3: return 'Good';
            case 4: return 'Very Good';
            case 5: return 'Excellent';
            default: return '';
        }
    };

    const getScoreColor = (score: number) => {
        switch (score) {
            case 1: return 'text-red-500';
            case 2: return 'text-orange-500';
            case 3: return 'text-yellow-500';
            case 4: return 'text-blue-500';
            case 5: return 'text-green-500';
            default: return 'text-gray-400';
        }
    };

    return (
        <AppLayout>
            <Head title={`${isEditing ? 'Edit' : 'Complete'} Evaluation - ${evaluation.name}`} />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={route('evaluator.my-evaluations')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to My Evaluations
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">
                            {isEditing ? 'Edit' : 'Complete'} Evaluation
                        </h1>
                        <p className="text-gray-600">{evaluation.name}</p>
                    </div>
                </div>

                <Card className="max-w-4xl">
                    <CardHeader>
                        <CardTitle>Evaluation Form</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {isBranchManagerEvaluation && hasBranches && (
                                <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                                    <CardContent className="pt-6">
                                        <div className="flex items-center gap-3 mb-3">
                                            <Filter className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                            <Label className="text-base font-semibold">Select Branch (Required)</Label>
                                        </div>
                                        <Select 
                                            value={branchFilter || ''} 
                                            onValueChange={handleBranchFilterChange}
                                        >
                                            <SelectTrigger className="bg-white dark:bg-slate-900">
                                                <SelectValue placeholder="Select a branch to view managers" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {branches.map((branch) => (
                                                    <SelectItem key={branch.id} value={branch.id.toString()}>
                                                        {branch.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                                            {branchFilter 
                                                ? `Showing managers from the selected branch. You can change branches to evaluate managers from other branches.` 
                                                : 'Please select a branch to view and evaluate its managers.'}
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

                            {isBranchManagerEvaluation && hasBranches && !branchFilter ? (
                                <Card className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
                                    <CardContent className="pt-6">
                                        <p className="text-yellow-800 dark:text-yellow-200 text-center">
                                            Please select a branch above to view managers and start the evaluation.
                                        </p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="evaluate_id">Select Person to Evaluate</Label>
                                            <Select 
                                                value={data.evaluate_id} 
                                                onValueChange={(value) => setData('evaluate_id', value)}
                                                disabled={isEditing || evaluatees.length === 0}
                                            >
                                                <SelectTrigger className={errors.evaluate_id ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder={evaluatees.length === 0 ? "No managers available" : "Select person to evaluate"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {evaluatees.map((employee) => (
                                                        <SelectItem key={employee.id} value={employee.id.toString()}>
                                                            {employee.first_name} {employee.last_name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.evaluate_id} />
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <Label className="text-lg font-semibold">Rate the following questions:</Label>
                                        
                                        {questions.map((question, index) => {
                                            const currentResponse = data.question_responses.find(
                                                r => r.question_id === question.id.toString()
                                            );
                                            const currentScore = currentResponse ? parseInt(currentResponse.score) : 0;
                                            
                                            return (
                                                <Card key={question.id} className="p-4">
                                                    <div className="space-y-3">
                                                        <div className="flex items-start gap-3">
                                                            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                                                                {index + 1}
                                                            </span>
                                                            <div className="flex-1">
                                                                <p className="font-medium text-gray-900">
                                                                    {question.question_text}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm text-gray-600">Rating:</span>
                                                            <div className="flex gap-1">
                                                                {[1, 2, 3, 4, 5].map((score) => (
                                                                    <button
                                                                        key={score}
                                                                        type="button"
                                                                        onClick={() => updateQuestionResponse(question.id.toString(), score.toString())}
                                                                        className={`p-2 rounded-lg border transition-colors ${
                                                                            currentScore === score
                                                                                ? 'border-blue-500 bg-blue-50'
                                                                                : 'border-gray-200 hover:border-gray-300'
                                                                        }`}
                                                                    >
                                                                        <Star 
                                                                            className={`h-5 w-5 ${
                                                                                currentScore === score 
                                                                                    ? getScoreColor(score)
                                                                                    : 'text-gray-300'
                                                                            }`}
                                                                            fill={currentScore === score ? 'currentColor' : 'none'}
                                                                        />
                                                                    </button>
                                                                ))}
                                                            </div>
                                                            {currentScore > 0 && (
                                                                <span className={`text-sm font-medium ${getScoreColor(currentScore)}`}>
                                                                    {getScoreLabel(currentScore)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Card>
                                            );
                                        })}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="comment">Additional Comments (Optional)</Label>
                                        <Textarea
                                            id="comment"
                                            value={data.comment}
                                            onChange={(e) => setData('comment', e.target.value)}
                                            placeholder="Add any additional comments about the evaluation..."
                                            className={errors.comment ? 'border-red-500' : ''}
                                            rows={4}
                                        />
                                        <InputError message={errors.comment} />
                                    </div>

                                    <div className="flex gap-4">
                                        <Button type="submit" disabled={processing}>
                                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            {isEditing ? 'Update' : 'Submit'} Evaluation
                                        </Button>
                                        <Button type="button" variant="outline" asChild>
                                            <Link href={route('evaluator.my-evaluations')}>Cancel</Link>
                                        </Button>
                                    </div>
                                </>
                            )}
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
