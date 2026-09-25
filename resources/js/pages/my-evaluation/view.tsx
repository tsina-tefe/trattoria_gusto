import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

type QuestionScore = {
    question_id: number;
    question_text: string | null;
    score: number;
};

type ResponseData = {
    id: number;
    evaluation_name: string | null;
    evaluate_label: string;
    evaluable_type: string;
    period_name: string | null;
    comment: string | null;
    created_at: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'My Evaluation History', href: '/my-evaluation/history' },
    { title: 'View Response', href: '#' },
];

const scoreLabel = (score: number) => {
    const labels: Record<number, { label: string; color: string }> = {
        1: { label: 'Poor', color: 'bg-red-100 text-red-700' },
        2: { label: 'Below Average', color: 'bg-orange-100 text-orange-700' },
        3: { label: 'Average', color: 'bg-yellow-100 text-yellow-700' },
        4: { label: 'Good', color: 'bg-blue-100 text-blue-700' },
        5: { label: 'Excellent', color: 'bg-green-100 text-green-700' },
    };
    return labels[score] ?? { label: String(score), color: 'bg-gray-100 text-gray-700' };
};

export default function ViewResponse({
    response,
    questionsWithScores,
}: {
    response: ResponseData;
    questionsWithScores: QuestionScore[];
}) {
    const avgScore = questionsWithScores.length
        ? (questionsWithScores.reduce((sum, q) => sum + q.score, 0) / questionsWithScores.length).toFixed(2)
        : null;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="View Evaluation Response" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <Card>
                    <CardHeader className="flex items-center justify-between">
                        <CardTitle>Evaluation Response #{response.id}</CardTitle>
                        <Link href="/my-evaluation/history">
                            <Button variant="outline" size="sm">← Back to History</Button>
                        </Link>
                    </CardHeader>
                    <hr />
                    <CardContent className="pt-4">
                        {/* Summary Info */}
                        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <p className="text-sm text-muted-foreground">Evaluation</p>
                                <p className="font-medium">{response.evaluation_name ?? '—'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Evaluated</p>
                                <p className="font-medium capitalize">{response.evaluable_type} · {response.evaluate_label}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Period</p>
                                <p className="font-medium">{response.period_name ?? '—'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Submitted At</p>
                                <p className="font-medium">{response.created_at}</p>
                            </div>
                            {avgScore && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Average Score</p>
                                    <p className="font-medium">{avgScore} / 5</p>
                                </div>
                            )}
                            {response.comment && (
                                <div className="sm:col-span-2 lg:col-span-3">
                                    <p className="text-sm text-muted-foreground">Comment</p>
                                    <p className="mt-1 rounded-md border bg-muted/30 p-3 text-sm">{response.comment}</p>
                                </div>
                            )}
                        </div>

                        {/* Questions & Scores */}
                        <h3 className="mb-2 font-semibold">Question Scores</h3>
                        {questionsWithScores.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No question responses found.</p>
                        ) : (
                            <Table>
                                <TableHeader className="bg-slate-500 dark:bg-slate-700">
                                    <TableRow>
                                        <TableHead className="font-bold text-white">#</TableHead>
                                        <TableHead className="font-bold text-white">Question</TableHead>
                                        <TableHead className="font-bold text-white text-center">Score</TableHead>
                                        <TableHead className="font-bold text-white text-center">Rating</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {questionsWithScores.map((q, i) => {
                                        const { label, color } = scoreLabel(q.score);
                                        return (
                                            <TableRow key={q.question_id} className="odd:bg-slate-100 dark:odd:bg-slate-800">
                                                <TableCell>{i + 1}</TableCell>
                                                <TableCell>{q.question_text ?? `Question #${q.question_id}`}</TableCell>
                                                <TableCell className="text-center font-semibold">{q.score}</TableCell>
                                                <TableCell className="text-center">
                                                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>{label}</span>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
