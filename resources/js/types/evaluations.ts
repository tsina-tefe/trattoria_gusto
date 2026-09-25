export interface Evaluation {
    id: number;
    evaluation_type_id: number;
    question_group_id: number;
    evaluatee_id?: number;
    evaluatee_type?: string;
    evaluator_id: number;
    fiscal_year_id?: number;
    fiscal_month_id?: number;
    status: 'draft' | 'active' | 'completed' | 'archived';
    start_date?: string;
    end_date?: string;
    created_at: string;
    updated_at: string;
    evaluation_type?: {
        id: number;
        name: string;
    };
    question_group?: {
        id: number;
        name: string;
    };
    evaluator?: {
        id: number;
        name: string;
    };
    fiscal_year?: {
        id: number;
        name: string;
    };
    fiscal_month?: {
        id: number;
        name: string;
    };
}