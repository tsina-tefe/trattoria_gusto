import type { FiscalYear } from './fiscal-year';

export type FiscalMonth = {
    id: number;
    fiscal_year_id: number;
    name: string;
    efy_month_number: number;
    gregorian_start_date: string;
    gregorian_end_date: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    fiscal_year?: FiscalYear;
};

export type FiscalMonthPagination = {
    data: FiscalMonth[];
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

export type EthiopianMonth = {
    en: string;
    am: string;
};

