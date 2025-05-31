import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import App from '../App';
import { fetchAvailableCurrencies, fetchExchangeRates } from '../services/currencyService';

vi.mock('../services/currencyService');

const mockCurrencies = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
];

const mockExchangeRates = {
  date: '2024-03-20',
  rates: {
    usd: 1.25,
    eur: 1.15,
    gbp: 1.0,
  },
};

const renderApp = () => {
  return render(
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <App />
    </LocalizationProvider>
  );
};

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (fetchAvailableCurrencies as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockCurrencies);
    (fetchExchangeRates as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockExchangeRates);
  });

  it('renders the currency exchange rates table', async () => {
    renderApp();
    
    expect(screen.getByText('Currency Exchange Rates')).toBeInTheDocument();
    expect(screen.getByLabelText('Base Currency')).toBeInTheDocument();
    expect(screen.getByLabelText('Add Currency')).toBeInTheDocument();
    expect(screen.getByLabelText('Select Date')).toBeInTheDocument();
  });

  it('loads and displays available currencies', async () => {
    renderApp();
    
    await waitFor(() => {
      expect(fetchAvailableCurrencies).toHaveBeenCalled();
    });

    const baseCurrencySelect = screen.getByLabelText('Base Currency');
    fireEvent.mouseDown(baseCurrencySelect);

    expect(screen.getByText('USD - US Dollar')).toBeInTheDocument();
    expect(screen.getByText('EUR - Euro')).toBeInTheDocument();
    expect(screen.getByText('GBP - British Pound')).toBeInTheDocument();
  });

  it('allows changing the base currency', async () => {
    renderApp();
    
    await waitFor(() => {
      expect(fetchAvailableCurrencies).toHaveBeenCalled();
    });

    const baseCurrencySelect = screen.getByLabelText('Base Currency');
    fireEvent.mouseDown(baseCurrencySelect);
    fireEvent.click(screen.getByText('USD - US Dollar'));

    await waitFor(() => {
      expect(fetchExchangeRates).toHaveBeenCalledWith(expect.any(String), 'USD');
    });
  });

  it('allows adding a new currency', async () => {
    renderApp();
    
    await waitFor(() => {
      expect(fetchAvailableCurrencies).toHaveBeenCalled();
    });

    const addCurrencySelect = screen.getByLabelText('Add Currency');
    fireEvent.mouseDown(addCurrencySelect);
    fireEvent.click(screen.getByText('USD - US Dollar'));

    expect(screen.getByText('USD - US Dollar')).toBeInTheDocument();
  });

  it('allows removing a currency', async () => {
    renderApp();
    
    await waitFor(() => {
      expect(fetchAvailableCurrencies).toHaveBeenCalled();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText('USD - US Dollar')).not.toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    (fetchAvailableCurrencies as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('API Error'));
    
    renderApp();
    
    await waitFor(() => {
      expect(screen.getByText('Error loading currencies')).toBeInTheDocument();
    });
  });
}); 