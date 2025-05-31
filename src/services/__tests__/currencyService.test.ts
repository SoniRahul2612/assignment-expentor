// Import testing utilities from Vitest
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchAvailableCurrencies, fetchExchangeRates } from '../currencyService';

// Mock axios to avoid actual HTTP requests during testing
vi.mock('axios');
const mockedAxios = {
  get: vi.fn()
} as unknown as { get: ReturnType<typeof vi.fn> };

// Main test suite for currency service
describe('Currency Service', () => {
  // Reset mocks before each test to ensure clean state
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test suite for fetchAvailableCurrencies function
  describe('fetchAvailableCurrencies', () => {
    // Test successful currency fetching and data transformation
    it('should fetch and transform available currencies', async () => {
      // Mock API response
      const mockResponse = {
        data: {
          usd: 'US Dollar',
          eur: 'Euro',
          gbp: 'British Pound',
        },
      };

      // Setup mock response
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      // Call the function
      const result = await fetchAvailableCurrencies();

      // Verify API endpoint was called correctly
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies.json'
      );

      // Verify response transformation
      expect(result).toEqual([
        { code: 'USD', name: 'US Dollar' },
        { code: 'EUR', name: 'Euro' },
        { code: 'GBP', name: 'British Pound' },
      ]);
    });

    // Test error handling when API call fails
    it('should handle API errors', async () => {
      // Mock API error
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));

      // Verify that error is propagated
      await expect(fetchAvailableCurrencies()).rejects.toThrow('API Error');
    });
  });

  // Test suite for fetchExchangeRates function
  describe('fetchExchangeRates', () => {
    // Test successful exchange rate fetching
    it('should fetch exchange rates for a given date and currency', async () => {
      // Mock API response
      const mockResponse = {
        data: {
          date: '2024-03-20',
          gbp: {
            usd: 1.25,
            eur: 1.15,
          },
        },
      };

      // Setup mock response
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      // Call the function
      const result = await fetchExchangeRates('2024-03-20', 'GBP', ['USD', 'EUR']);

      // Verify API endpoint was called correctly
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/2024-03-20/currencies/gbp.json'
      );

      // Verify response transformation
      expect(result).toEqual({
        date: '2024-03-20',
        rates: {
          usd: 1.25,
          eur: 1.15,
        },
      });
    });

    // Test error handling when API call fails
    it('should handle API errors', async () => {
      // Mock API error
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));

      // Verify that error is propagated
      await expect(fetchExchangeRates('2024-03-20', 'GBP', ['USD', 'EUR'])).rejects.toThrow('API Error');
    });
  });
});