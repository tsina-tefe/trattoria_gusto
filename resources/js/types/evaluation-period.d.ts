import type { FiscalYear } from './fiscal-year';
import type { FiscalMonth } from './fiscal-month';

export type EvaluationPeriod = {
    id: number;
    evaluation_period_name: string;
    fiscal_year_id: number;
    fiscal_month_id: number;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
    fiscal_year?: FiscalYear;
    fiscal_month?: FiscalMonth;
};

export type EvaluationPeriodPagination = {
    data: EvaluationPeriod[];
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
