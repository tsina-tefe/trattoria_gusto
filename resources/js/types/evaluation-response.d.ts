import type { User } from './users';
import type { EvaluationPeriod } from './evaluation-period';
import type { EvaluationType } from './evaluation-type';
import type { Question } from './question';

export type QuestionResponse = {
    id: number;
    question_id: number;
    evaluation_response_id: number;
    score: number;
    created_at: string;
    updated_at: string;
    question?: Question;
};

export type EvaluationResponse = {
    id: number;
    evaluator_id: number;
    evaluate_id: number;
    evaluation_period_id: number;
    evaluation_type_id: number;
    comment: string | null;
    created_at: string;
    updated_at: string;
    evaluator?: User;
    evaluate?: User;
    evaluation_period?: EvaluationPeriod;
    evaluation_type?: EvaluationType;
    question_responses?: QuestionResponse[];
};

export type EvaluationResponsePagination = {
    data: EvaluationResponse[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
};
