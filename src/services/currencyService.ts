import type { Currency, ExchangeRate } from '../types/currency';

const BASE_URL = 'https://api.frankfurter.app';

/**
 * Fetches the list of available currencies from the API
 * @returns Promise<Currency[]> - Array of currency objects with code and name
 * @throws Error if the API request fails
 */
export const fetchAvailableCurrencies = async (): Promise<Currency[]> => {
  // Fetch currencies from the API
  const response = await fetch(`${BASE_URL}/currencies`);
  const currencies = await response.json();

  // Transform the API response into the required format
  // Convert currency codes to uppercase and map to Currency interface
  return Object.entries(currencies).map(([code, name]) => ({
    code: code.toUpperCase(),
    name: name as string,
  }));
};

/**
 * Fetches exchange rates for specified currencies on a given date
 * @param date - The date for which to fetch exchange rates (YYYY-MM-DD format)
 * @param baseCurrency - The base currency code (e.g., 'USD', 'EUR')
 * @param targetCurrencies - Array of target currency codes to get rates for
 * @returns Promise<ExchangeRate> - Object containing date and rates
 * @throws Error if the API request fails
 */
export const fetchExchangeRates = async (
  date: string,
  baseCurrency: string,
  targetCurrencies: string[]
): Promise<ExchangeRate> => {
  // Join target currencies with commas for the API request
  const currencies = targetCurrencies.join(',');

  // Fetch exchange rates from the API
  const response = await fetch(
    `${BASE_URL}/${date}?from=${baseCurrency}&to=${currencies}`
  );
  const data = await response.json();

  // Transform the API response into the required format
  return {
    date: data.date,
    rates: data.rates,
  };
}; 