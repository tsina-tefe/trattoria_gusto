export type EvaluationType = {
    id: number;
    name: string;
    evaluation_type: 'person' | 'department' | 'branch' | 'other';
    created_at: string;
    updated_at: string;
};