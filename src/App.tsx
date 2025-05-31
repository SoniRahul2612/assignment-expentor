import { useState, useEffect } from 'react';
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
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import DeleteIcon from '@mui/icons-material/Delete';
import { format, subDays, isAfter, isBefore } from 'date-fns';
import type { Currency } from './types/currency';
import { DEFAULT_CURRENCIES } from './types/currency';
import { fetchAvailableCurrencies, fetchExchangeRates } from './services/currencyService';

function App() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [baseCurrency, setBaseCurrency] = useState('GBP');
  const [selectedCurrencies, setSelectedCurrencies] = useState(DEFAULT_CURRENCIES);
  const [availableCurrencies, setAvailableCurrencies] = useState<Currency[]>([]);
  const [exchangeRates, setExchangeRates] = useState<{ [key: string]: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAddCurrency, setSelectedAddCurrency] = useState('');

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

  useEffect(() => {
    const loadExchangeRates = async () => {
      setLoading(true);
      setError(null);
      try {
        const targetCurrencies = selectedCurrencies.map(c => c.code);
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

  const handleDateChange = (date: Date | null) => {
    if (date) {
      const today = new Date();
      const ninetyDaysAgo = subDays(today, 90);
      
      if (isAfter(date, today)) {
        setSelectedDate(today);
      } else if (isBefore(date, ninetyDaysAgo)) {
        setSelectedDate(ninetyDaysAgo);
      } else {
        setSelectedDate(date);
      }
    }
  };

  const handleCurrencyChange = (event: any) => {
    setBaseCurrency(event.target.value);
  };

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

  const handleRemoveCurrency = (code: string) => {
    if (selectedCurrencies.length > 3) {
      setSelectedCurrencies(selectedCurrencies.filter((c) => c.code !== code));
      if (selectedAddCurrency === code) {
        setSelectedAddCurrency('');
      }
    }
  };

  const filteredCurrencies = availableCurrencies
    .filter(currency => !selectedCurrencies.find(c => c.code === currency.code));

  const filteredAddCurrencies = availableCurrencies
    .filter(currency => 
      !selectedCurrencies.find(c => c.code === currency.code) && 
      currency.code !== baseCurrency
    );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" className="currency-header">
          Currency Exchange Rates
        </Typography>
        
        {error && (
          <Typography color="error" className="error-text" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        
        <Box className="controls-container">
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

          <DatePicker
            label="Select Date"
            value={selectedDate}
            onChange={handleDateChange}
            maxDate={new Date()}
            minDate={subDays(new Date(), 90)}
          />
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Currency</TableCell>
                {Array.from({ length: 7 }, (_, i) => (
                  <TableCell key={i}>
                    {format(subDays(selectedDate, i), 'MMM dd, yyyy')}
                  </TableCell>
                ))}
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedCurrencies.map((currency) => (
                <TableRow key={currency.code}>
                  <TableCell>
                    <span className="currency-code">{currency.code}</span>
                    <span className="currency-name">- {currency.name}</span>
                  </TableCell>
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
