"use client";

import { createContext, useContext, useState, useCallback } from "react";

export type Currency = "USD" | "INR";

const RATE = 95; // 1 USD = 95 INR

interface CurrencyContextType {
  currency: Currency;
  toggle: () => void;
  format: (usdAmount: number) => string;
  convert: (usdAmount: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "USD",
  toggle: () => {},
  format: (n) => `$${n.toFixed(2)}`,
  convert: (n) => n,
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>("USD");

  const toggle = useCallback(() => {
    setCurrency((prev) => (prev === "USD" ? "INR" : "USD"));
  }, []);

  const convert = useCallback(
    (usdAmount: number) => (currency === "INR" ? usdAmount * RATE : usdAmount),
    [currency]
  );

  const format = useCallback(
    (usdAmount: number) => {
      if (currency === "INR") {
        const inr = usdAmount * RATE;
        return `₹${inr.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
      }
      return `$${usdAmount.toFixed(2)}`;
    },
    [currency]
  );

  return (
    <CurrencyContext.Provider value={{ currency, toggle, format, convert }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}

export { RATE };
