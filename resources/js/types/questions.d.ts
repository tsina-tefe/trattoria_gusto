export type Question = {
    id: number;
    question_text: string;
    evaluation_type_id: number;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
    evaluation_type?: {
        id: number;
        name: string;
    };
};