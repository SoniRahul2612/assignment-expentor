export interface Currency {
  code: string;
  name: string;
}

export interface ExchangeRate {
  date: string;
  rates: {
    [key: string]: number;
  };
}

export interface CurrencyOption {
  value: string;
  label: string;
}

export const DEFAULT_CURRENCIES = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'ZAR', name: 'South African Rand' },
]; 