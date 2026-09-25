export interface EmployeeOption {
  id: number;
  name: string;
  branch_id: number;
  department_id: number;
}

export interface Manager {
  id: number;
  employee_id: number;
  employee: {
    id: number;
    first_name: string;
    last_name: string;
  };
  team_members?: number[];
}

export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface ManagersPaginated {
  data: Manager[];
  total: number;
  from: number;
  to: number;
  links: PaginationLink[];
}

export interface SelectOption {
  id: number;
  name: string;
}