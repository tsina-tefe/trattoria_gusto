import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function MyEvaluationEdit({ response, questions, questionResponses }: any) {
  const { data, setData, put, processing, errors } = useForm({
    comment: response.comment || '',
    question_responses: (questionResponses || []).map((qr: any) => ({ question_id: qr.question_id, score: qr.score })),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/my-evaluation/response/${response.id}`);
  };

  return (
    <AppLayout>
      <Head title="Edit Evaluation" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <Card className="max-w-4xl">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Update Scores</CardTitle>
            <CardAction>
              <Link href={'/my-evaluation/history'}>
                <Button variant={'default'}>Go Back</Button>
              </Link>
            </CardAction>
          </CardHeader>
          <hr />
          <CardContent>
            <form onSubmit={submit} className="space-y-6">
              <div className="space-y-4">
                <Label>Questions</Label>
                {(questions || []).map((q: any, idx: number) => (
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
                <Button type="submit" disabled={processing}>Save</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}


