export type FiscalYear = {
    id: number;
    name: string;
    gregorian_start_date: string;
    gregorian_end_date: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    fiscal_months_count?: number;
};

export type FiscalYearPagination = {
    data: FiscalYear[];
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

