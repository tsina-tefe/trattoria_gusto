export interface Employee {
    id: number;
    employee_code: string;
    first_name: string;
    last_name: string;
    branch: string | null;
    department: string | null;
    position: string | null;
    status: 'active' | 'inactive' | 'terminated';
    image_path: string | null;
    created_at: string;
}