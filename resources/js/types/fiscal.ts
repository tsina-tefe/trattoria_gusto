export interface FiscalYear {
  id: number;
  name: string; // e.g., 'EFY 2018'
  gregorian_start_date: string; // e.g., '2025-07-08'
  gregorian_end_date: string; // e.g., '2026-07-07'
  is_active: boolean;
}

export interface FiscalMonth {
  id: number;
  fiscal_year_id: number;
  name: string; // e.g., 'Yekatit' or 'የካቲት'
  efy_month_number: number; // 1-12
  gregorian_start_date: string;
  gregorian_end_date: string;
  is_active: boolean;
  fiscal_year: FiscalYear;
}

export interface EthiopianMonth {
  en: string;
  am: string;
}