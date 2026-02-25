import React, { createContext, useContext, useState, ReactNode } from "react";

export const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
] as const;

export type MonthName = typeof MONTHS[number];

export const YEARS = [2024, 2025, 2026, 2027] as const;

interface MonthContextType {
  selectedMonth: MonthName;
  selectedYear: number;
  period: string; // "January 2026"
  setSelectedMonth: (month: MonthName) => void;
  setSelectedYear: (year: number) => void;
}

const MonthContext = createContext<MonthContextType | undefined>(undefined);

export function MonthProvider({ children }: { children: ReactNode }) {
  const [selectedMonth, setSelectedMonth] = useState<MonthName>("February");
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  const period = `${selectedMonth} ${selectedYear}`;

  return (
    <MonthContext.Provider value={{ selectedMonth, selectedYear, period, setSelectedMonth, setSelectedYear }}>
      {children}
    </MonthContext.Provider>
  );
}

export function useMonth() {
  const ctx = useContext(MonthContext);
  if (!ctx) throw new Error("useMonth must be used within MonthProvider");
  return ctx;
}
