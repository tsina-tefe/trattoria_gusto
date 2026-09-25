export type InventoryPeriodStatus = 'active' | 'inactive';

export interface InventoryPeriod {
	id: number;
	inventory_period_name: string;
	fiscal_year_id: number;
	fiscal_month_id: number;
	status: InventoryPeriodStatus;
	created_at?: string | null;
	updated_at?: string | null;
	fiscal_year?: {
		id: number;
		name: string;
	};
	fiscal_month?: {
		id: number;
		name: string;
		fiscal_year_id: number;
	};
}


