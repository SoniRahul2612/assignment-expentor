import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchAvailableCurrencies, fetchExchangeRates } from '../currencyService';

vi.mock('axios');
const mockedAxios = {
  get: vi.fn()
} as unknown as { get: ReturnType<typeof vi.fn> };

describe('Currency Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchAvailableCurrencies', () => {
    it('should fetch and transform available currencies', async () => {
      const mockResponse = {
        data: {
          usd: 'US Dollar',
          eur: 'Euro',
          gbp: 'British Pound',
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await fetchAvailableCurrencies();

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies.json'
      );
      expect(result).toEqual([
        { code: 'USD', name: 'US Dollar' },
        { code: 'EUR', name: 'Euro' },
        { code: 'GBP', name: 'British Pound' },
      ]);
    });

    it('should handle API errors', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));

      await expect(fetchAvailableCurrencies()).rejects.toThrow('API Error');
    });
  });

  describe('fetchExchangeRates', () => {
    it('should fetch exchange rates for a given date and currency', async () => {
      const mockResponse = {
        data: {
          date: '2024-03-20',
          gbp: {
            usd: 1.25,
            eur: 1.15,
          },
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await fetchExchangeRates('2024-03-20', 'GBP', ['USD', 'EUR']);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/2024-03-20/currencies/gbp.json'
      );
      expect(result).toEqual({
        date: '2024-03-20',
        rates: {
          usd: 1.25,
          eur: 1.15,
        },
      });
    });

    it('should handle API errors', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));

      await expect(fetchExchangeRates('2024-03-20', 'GBP', ['USD', 'EUR'])).rejects.toThrow('API Error');
    });
  });
}); 