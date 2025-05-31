import type { Currency, ExchangeRate } from '../types/currency';

const BASE_URL = 'https://api.frankfurter.app';

export const fetchAvailableCurrencies = async (): Promise<Currency[]> => {
  const response = await fetch(`${BASE_URL}/currencies`);
  const currencies = await response.json();
  return Object.entries(currencies).map(([code, name]) => ({
    code: code.toUpperCase(),
    name: name as string,
  }));
};

export const fetchExchangeRates = async (
  date: string,
  baseCurrency: string,
  targetCurrencies: string[]
): Promise<ExchangeRate> => {
  const currencies = targetCurrencies.join(',');
  const response = await fetch(
    `${BASE_URL}/${date}?from=${baseCurrency}&to=${currencies}`
  );
  const data = await response.json();
  return {
    date: data.date,
    rates: data.rates,
  };
}; 