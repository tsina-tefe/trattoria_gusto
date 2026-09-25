export interface Position {
    id: number;
    title: string;
    level: 'Team' | 'Manager' | 'Director' | 'General Manager' | 'CEO';
    description: string | null;
    created_at: string;
}