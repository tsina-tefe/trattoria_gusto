import type { QuestionGroup } from './question-groups';

export type Employee = {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    branch_id?: number;
    department_id?: number;
    branch?: {
        id: number;
        name: string;
    };
    department?: {
        id: number;
        name: string;
    };
};

export type Branch = {
    id: number;
    name: string;
};

export type Department = {
    id: number;
    name: string;
};

export type EvaluatorGroup = {
    id: number;
    name: string;
    question_group_id: number;
    created_at: string;
    updated_at: string;
    question_group?: QuestionGroup;
    employees?: Employee[];
    employees_count?: number;
};

export type EvaluatorGroupPagination = {
    data: EvaluatorGroup[];
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

