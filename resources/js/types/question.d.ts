import type { EvaluationType } from './evaluation-types';

export type Question = {
    id: number;
    question_text: string;
    evaluation_type_id: number;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
    evaluation_type?: EvaluationType;
};

export type QuestionPagination = {
    data: Question[];
    current_page: number;
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
};

