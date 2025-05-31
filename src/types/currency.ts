// Interface representing a currency with its code and name
export interface Currency {
  code: string;  // The three-letter currency code (e.g., USD, EUR)
  name: string;  // The full name of the currency (e.g., US Dollar, Euro)
}

// Interface representing exchange rates for a specific date
export interface ExchangeRate {
  date: string;  // The date for which the rates are valid
  rates: {
    [key: string]: number;  // Map of currency codes to their exchange rates
  };
}

// Interface for currency options in dropdown menus
export interface CurrencyOption {
  value: string;  // The currency code to be used as the value
  label: string;  // The display label for the currency
}

// Default list of currencies to display when the application starts
export const DEFAULT_CURRENCIES = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'ZAR', name: 'South African Rand' },
]; 