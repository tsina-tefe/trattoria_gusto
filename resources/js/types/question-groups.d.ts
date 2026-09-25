export type QuestionGroup = {
    id: number;
    name: string;
    questions_count?: number;
    questions?: { id: number; question_text: string }[];
    created_at?: string;
    updated_at?: string;
};


