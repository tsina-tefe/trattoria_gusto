export interface Branch {
    id: number;
    branch_code: string;
    name: string;
    location: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    description: string | null;
    created_at: string;
    departments: string[];
}