import React, { createContext, useContext, useState, ReactNode } from "react";

export const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
] as const;

export type MonthName = typeof MONTHS[number];

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
export const YEARS = Array.from({ length: 2 }, (_, i) => currentYear + i) as number[];

interface MonthContextType {
  selectedMonth: MonthName;
  selectedYear: number;
  period: string;
  setSelectedMonth: (month: MonthName) => void;
  setSelectedYear: (year: number) => void;
}

const MonthContext = createContext<MonthContextType | undefined>(undefined);

export function MonthProvider({ children }: { children: ReactNode }) {
  const [selectedMonth, setSelectedMonth] = useState<MonthName>(MONTHS[currentDate.getMonth()]);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

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
