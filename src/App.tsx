// Import React hooks for state management and side effects
import { useState, useEffect } from 'react';

// Import Material-UI components for building the user interface
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  IconButton,
  CircularProgress,
} from '@mui/material';

// Import date picker components for date selection
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import DeleteIcon from '@mui/icons-material/Delete';

// Import date manipulation utilities from date-fns
import { format, subDays, isAfter, isBefore } from 'date-fns';

// Import custom types and constants
import type { Currency } from './types/currency';
import { DEFAULT_CURRENCIES } from './types/currency';

// Import API service functions for currency data
import { fetchAvailableCurrencies, fetchExchangeRates } from './services/currencyService';

function App() {
  // State management for the application
  const [selectedDate, setSelectedDate] = useState<Date>(new Date()); // Current selected date
  const [baseCurrency, setBaseCurrency] = useState('GBP'); // Base currency for exchange rates
  const [selectedCurrencies, setSelectedCurrencies] = useState(DEFAULT_CURRENCIES); // List of currencies to display
  const [availableCurrencies, setAvailableCurrencies] = useState<Currency[]>([]); // All available currencies from API
  const [exchangeRates, setExchangeRates] = useState<{ [key: string]: number }[]>([]); // Exchange rates data
  const [loading, setLoading] = useState(false); // Loading state for API calls
  const [error, setError] = useState<string | null>(null); // Error state for error handling
  const [selectedAddCurrency, setSelectedAddCurrency] = useState(''); // Currently selected currency to add

  // Effect to load available currencies when component mounts
  useEffect(() => {
    const loadAvailableCurrencies = async () => {
      try {
        setError(null);
        const currencies = await fetchAvailableCurrencies();
        setAvailableCurrencies(currencies);
      } catch (error) {
        setError('Error loading currencies');
        console.error('Error loading currencies:', error);
      }
    };
    loadAvailableCurrencies();
  }, []);

  // Effect to load exchange rates when date, base currency, or selected currencies change
  useEffect(() => {
    const loadExchangeRates = async () => {
      setLoading(true);
      setError(null);
      try {
        const targetCurrencies = selectedCurrencies.map(c => c.code);
        // Fetch exchange rates for the last 7 days
        const rates = await Promise.all(
          Array.from({ length: 7 }, (_, i) => {
            const date = format(subDays(selectedDate, i), 'yyyy-MM-dd');
            return fetchExchangeRates(date, baseCurrency, targetCurrencies);
          })
        );
        setExchangeRates(rates.map(rate => rate.rates));
      } catch (error) {
        setError('Error loading exchange rates');
        console.error('Error loading exchange rates:', error);
      } finally {
        setLoading(false);
      }
    };
    loadExchangeRates();
  }, [selectedDate, baseCurrency, selectedCurrencies]);

  // Handler for date changes with validation for 90-day range
  const handleDateChange = (date: Date | null) => {
    if (date) {
      const today = new Date();
      const ninetyDaysAgo = subDays(today, 90);
      
      // Validate date is within allowed range
      if (isAfter(date, today)) {
        setSelectedDate(today);
      } else if (isBefore(date, ninetyDaysAgo)) {
        setSelectedDate(ninetyDaysAgo);
      } else {
        setSelectedDate(date);
      }
    }
  };

  // Handler for base currency changes
  const handleCurrencyChange = (event: any) => {
    setBaseCurrency(event.target.value);
  };

  // Handler for adding new currencies (max 7 currencies allowed)
  const handleAddCurrency = (event: any) => {
    const value = event.target.value;
    setSelectedAddCurrency(value);
    
    if (selectedCurrencies.length < 7) {
      const newCurrency = availableCurrencies.find(
        (c) => c.code === value
      );
      if (newCurrency && !selectedCurrencies.find((c) => c.code === newCurrency.code)) {
        setSelectedCurrencies([...selectedCurrencies, newCurrency]);
      }
    }
  };

  // Handler for removing currencies (minimum 3 currencies required)
  const handleRemoveCurrency = (code: string) => {
    if (selectedCurrencies.length > 3) {
      setSelectedCurrencies(selectedCurrencies.filter((c) => c.code !== code));
      if (selectedAddCurrency === code) {
        setSelectedAddCurrency('');
      }
    }
  };

  // Filter available currencies that are not already selected
  const filteredCurrencies = availableCurrencies
    .filter(currency => !selectedCurrencies.find(c => c.code === currency.code));

  // Filter currencies that can be added (not selected and not base currency)
  const filteredAddCurrencies = availableCurrencies
    .filter(currency => 
      !selectedCurrencies.find(c => c.code === currency.code) && 
      currency.code !== baseCurrency
    );

  // Main render function
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header section */}
        <Typography variant="h4" className="currency-header">
          Currency Exchange Rates
        </Typography>
        
        {/* Error message display */}
        {error && (
          <Typography color="error" className="error-text" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        
        {/* Controls section */}
        <Box className="controls-container">
          {/* Base currency selector */}
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Base Currency</InputLabel>
            <Select
              value={baseCurrency}
              label="Base Currency"
              onChange={handleCurrencyChange}
              MenuProps={{
                PaperProps: {
                  sx: { maxHeight: 300 }
                }
              }}
            >
              {filteredCurrencies.map((currency) => (
                <MenuItem key={currency.code} value={currency.code}>
                  <span className="currency-code">{currency.code}</span>
                  <span className="currency-name">- {currency.name}</span>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Add currency selector */}
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel 
              sx={{ 
                color: selectedCurrencies.length >= 7 ? 'rgba(0, 0, 0, 0.6)' : 'primary.main',
                '&.Mui-focused': {
                  color: selectedCurrencies.length >= 7 ? 'rgba(0, 0, 0, 0.6)' : 'primary.main'
                }
              }}
            >
              Add Currency
            </InputLabel>
            <Select
              value={selectedAddCurrency}
              label="Add Currency"
              onChange={handleAddCurrency}
              disabled={selectedCurrencies.length >= 7}
              renderValue={(value) => {
                const currency = availableCurrencies.find(c => c.code === value);
                return currency ? `${currency.code} - ${currency.name}` : '';
              }}
              MenuProps={{
                PaperProps: {
                  sx: { maxHeight: 300 }
                }
              }}
            >
              {filteredAddCurrencies.map((currency) => (
                <MenuItem key={currency.code} value={currency.code}>
                  <span className="currency-code">{currency.code}</span>
                  <span className="currency-name">- {currency.name}</span>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Date picker for selecting historical rates */}
          <DatePicker
            label="Select Date"
            value={selectedDate}
            onChange={handleDateChange}
            maxDate={new Date()}
            minDate={subDays(new Date(), 90)}
          />
        </Box>

        {/* Exchange rates table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Currency</TableCell>
                {/* Generate date headers for the last 7 days */}
                {Array.from({ length: 7 }, (_, i) => (
                  <TableCell key={i}>
                    {format(subDays(selectedDate, i), 'MMM dd, yyyy')}
                  </TableCell>
                ))}
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Generate rows for each selected currency */}
              {selectedCurrencies.map((currency) => (
                <TableRow key={currency.code}>
                  <TableCell>
                    <span className="currency-code">{currency.code}</span>
                    <span className="currency-name">- {currency.name}</span>
                  </TableCell>
                  {/* Display exchange rates for each day */}
                  {exchangeRates.map((rates, index) => (
                    <TableCell key={index}>
                      {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                          <CircularProgress size={20} />
                        </Box>
                      ) : (
                        <span className="exchange-rate">
                          {rates[currency.code]?.toFixed(4)}
                        </span>
                      )}
                    </TableCell>
                  ))}
                  {/* Remove currency button */}
                  <TableCell>
                    <IconButton
                      onClick={() => handleRemoveCurrency(currency.code)}
                      disabled={selectedCurrencies.length <= 3}
                      title={selectedCurrencies.length <= 3 ? "Minimum 3 currencies required" : "Remove currency"}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </LocalizationProvider>
  );
}

export default App;