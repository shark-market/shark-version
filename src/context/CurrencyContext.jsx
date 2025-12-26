import { createContext, useCallback, useContext, useMemo, useState } from "react";

const CURRENCY_STORAGE_KEY = "sm-currency";
const DEFAULT_CURRENCY = "SAR";
const RATE_TO_SAR = {
  SAR: 1,
  USD: 3.75,
  EUR: 4.1,
};
const CURRENCY_META = {
  SAR: { label: "SAR", symbol: "ر.س", flag: "🇸🇦" },
  USD: { label: "USD", symbol: "$", flag: "🇺🇸" },
  EUR: { label: "EUR", symbol: "€", flag: "🇪🇺" },
};

const CurrencyContext = createContext(null);

const getStoredCurrency = () => {
  if (typeof window === "undefined") return DEFAULT_CURRENCY;
  const stored = window.localStorage.getItem(CURRENCY_STORAGE_KEY);
  return stored && CURRENCY_META[stored] ? stored : DEFAULT_CURRENCY;
};

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(getStoredCurrency);

  const setCurrency = useCallback((next) => {
    if (!CURRENCY_META[next]) return;
    setCurrencyState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(CURRENCY_STORAGE_KEY, next);
    }
  }, []);

  const toSAR = useCallback((amount, code = currency) => {
    const value = Number(amount) || 0;
    const rate = RATE_TO_SAR[code] || 1;
    return value * rate;
  }, [currency]);

  const fromSAR = useCallback((amount, code = currency) => {
    const value = Number(amount) || 0;
    const rate = RATE_TO_SAR[code] || 1;
    return value / rate;
  }, [currency]);

  const formatCurrency = useCallback(
    (amountSAR, options = {}) => {
      const {
        locale = "en-US",
        currencyCode = currency,
        maximumFractionDigits,
        minimumFractionDigits,
      } = options;
      const value = fromSAR(amountSAR, currencyCode);
      const fractionDigits =
        maximumFractionDigits ??
        (currencyCode === "SAR" ? 0 : 2);
      const minDigits =
        minimumFractionDigits ??
        (currencyCode === "SAR" ? 0 : 2);

      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currencyCode,
        maximumFractionDigits: fractionDigits,
        minimumFractionDigits: minDigits,
      }).format(value);
    },
    [currency, fromSAR]
  );

  const formatNumber = useCallback((value, options = {}) => {
    const { locale = "en-US", maximumFractionDigits } = options;
    return new Intl.NumberFormat(locale, {
      maximumFractionDigits,
    }).format(Number(value) || 0);
  }, []);

  const contextValue = useMemo(
    () => ({
      currency,
      setCurrency,
      currencies: CURRENCY_META,
      ratesToSAR: RATE_TO_SAR,
      formatCurrency,
      formatNumber,
      toSAR,
      fromSAR,
    }),
    [currency, formatCurrency, formatNumber, fromSAR, setCurrency, toSAR]
  );

  return (
    <CurrencyContext.Provider value={contextValue}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }
  return context;
}
