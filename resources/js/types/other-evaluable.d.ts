export type OtherEvaluable = {
    id: number;
    name: string;
    description?: string | null;
    created_at: string;
    updated_at: string;
};

export type OtherEvaluablePagination = {
    data: OtherEvaluable[];
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

