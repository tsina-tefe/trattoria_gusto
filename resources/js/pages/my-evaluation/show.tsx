import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InputError from '@/components/input-error';
import { useMemo, useState } from 'react';
import { Filter } from 'lucide-react';

type Period = { id: number; evaluation_period_name: string };
type Evaluatee = { user_id?: number | null; name: string; email?: string | null };
type Question = { id: number; question_text: string };
type Branch = { id: number; name: string };

export default function MyEvaluationShow({
  evaluation,
  evaluationPeriods,
  evaluatees,
  evaluableType,
  alreadyEvaluatedByPeriod,
  questions,
  isBranchManagerEvaluation = false,
  branches = [],
  selectedBranchId
}: {
  evaluation: { id: number; name?: string };
  evaluationPeriods: Period[];
  evaluatees: { id: number; label: string }[];
  evaluableType: 'employee' | 'department' | 'branch' | 'other';
  alreadyEvaluatedByPeriod: Record<string, number[]>;
  questions: Question[];
  isBranchManagerEvaluation?: boolean;
  branches?: Branch[];
  selectedBranchId?: string;
}) {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('');
  const [branchFilter, setBranchFilter] = useState(selectedBranchId || '');

  const pendingEvaluatees = useMemo(() => {
    const periodKey = selectedPeriodId || '';
    // map alreadyEvaluatedByPeriod contents to numbers for robust comparison
    const alreadyForPeriodNumeric = (alreadyEvaluatedByPeriod?.[periodKey] || []).map(id => Number(id));
    const alreadyForPeriod = new Set(alreadyForPeriodNumeric);
    const list = Array.isArray(evaluatees) ? evaluatees : [];
    return list.filter((e) => !alreadyForPeriod.has(Number(e.id)));
  }, [evaluatees, alreadyEvaluatedByPeriod, selectedPeriodId]);

  const { data, setData, post, processing, errors, reset } = useForm({
    evaluation_period_id: '',
    evaluable_type: evaluableType,
    evaluate_id: '',
    comment: '',
    question_responses: [] as { question_id: number; score: number }[],
  });

  const onSelectEvaluatee = (val: string) => {
    setSelectedUserId(val);
    setData('evaluate_id', val);
  };

  const onSelectPeriod = (val: string) => {
    setSelectedPeriodId(val);
    setData('evaluation_period_id', val);
  };

  const initResponsesIfEmpty = () => {
    if (!data.question_responses.length) {
      setData('question_responses', questions.map((q) => ({ question_id: q.id, score: 3 })));
    }
  };

  const handleBranchFilterChange = (value: string) => {
    setBranchFilter(value);
    const params = value ? { branch_id: value } : {};
    router.get(`/my-evaluation/${evaluation.id}`, params, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post(`/my-evaluation/${evaluation.id}`);
  };

  return (
    <AppLayout>
      <Head title={evaluation.name || 'Evaluate'} />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <Card className="max-w-4xl">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Fill Evaluation</CardTitle>
            <CardAction>
              <Link href={'/my-evaluation'}>
                <Button variant={'default'}>Go Back</Button>
              </Link>
            </CardAction>
          </CardHeader>
          <hr />
          <CardContent>
            <form onSubmit={submit} className="space-y-6">
              {isBranchManagerEvaluation && branches.length > 0 && (
                <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Filter className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <Label className="text-base font-semibold">Select Branch (Required)</Label>
                    </div>
                    <Select value={branchFilter || ''} onValueChange={handleBranchFilterChange}>
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
                        ? 'Showing managers from the selected branch. You can change branches to evaluate managers from other branches.'
                        : 'Please select a branch to view and evaluate its managers.'}
                    </p>
                  </CardContent>
                </Card>
              )}

              {isBranchManagerEvaluation && branches.length > 0 && !branchFilter ? (
                <Card className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
                  <CardContent className="pt-6">
                    <p className="text-yellow-800 dark:text-yellow-200 text-center">
                      Please select a branch above to view managers and start the evaluation.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Evaluation Period</Label>
                      <Select value={selectedPeriodId} onValueChange={onSelectPeriod}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select active period" />
                        </SelectTrigger>
                        <SelectContent>
                          {evaluationPeriods.map((p) => (
                            <SelectItem key={p.id} value={p.id.toString()}>
                              {p.evaluation_period_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <InputError message={errors.evaluation_period_id as any} />
                    </div>

                    <div className="space-y-2">
                      <Label>Evaluate ({evaluableType})</Label>
                      <Select value={selectedUserId} onValueChange={(v) => { onSelectEvaluatee(v); initResponsesIfEmpty(); }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select evaluate" />
                        </SelectTrigger>
                        <SelectContent>
                          {pendingEvaluatees.map((ev) => (
                            <SelectItem key={ev.id} value={ev.id.toString()}>
                              {ev.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <InputError message={errors.evaluate_id as any} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Questions</Label>
                    {(questions || []).map((q, idx) => (
                      <div key={q.id} className="flex items-center justify-between rounded border p-3">
                        <div className="pr-4">{q.question_text}</div>
                        <Select
                          value={(data.question_responses[idx]?.score ?? 3).toString()}
                          onValueChange={(v) => {
                            const next = [...data.question_responses];
                            next[idx] = { question_id: q.id, score: parseInt(v) };
                            setData('question_responses', next);
                          }}
                        >
                          <SelectTrigger className="w-36">
                            <SelectValue placeholder="Score" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 - Poor</SelectItem>
                            <SelectItem value="2">2 - Fair</SelectItem>
                            <SelectItem value="3">3 - Good</SelectItem>
                            <SelectItem value="4">4 - Very Good</SelectItem>
                            <SelectItem value="5">5 - Excellent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                    <InputError message={errors.question_responses as any} />
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button type="submit" disabled={processing}>Submit</Button>
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


