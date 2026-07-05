export const COUNTRIES = ["India", "USA", "UK", "Germany", "Canada"] as const;
export type Country = (typeof COUNTRIES)[number];

export const DEPARTMENTS = [
  "Engineering",
  "Sales",
  "HR",
  "Finance",
  "Operations",
  "Marketing",
] as const;
export type Department = (typeof DEPARTMENTS)[number];

export const LEVELS = ["Junior", "Mid", "Senior", "Lead"] as const;
export type Level = (typeof LEVELS)[number];

// Relative weights for weighted random selection (not percentages that need
// to sum to 100 - see pickWeighted in generateEmployees.ts).
export const COUNTRY_WEIGHTS: Record<Country, number> = {
  India: 35,
  USA: 30,
  UK: 15,
  Germany: 10,
  Canada: 10,
};

export const DEPARTMENT_WEIGHTS: Record<Department, number> = {
  Engineering: 35,
  Sales: 20,
  Operations: 15,
  Finance: 10,
  HR: 10,
  Marketing: 10,
};

// A typical org pyramid: fewer people at the top.
export const LEVEL_WEIGHTS: Record<Level, number> = {
  Junior: 30,
  Mid: 35,
  Senior: 25,
  Lead: 10,
};

export const CURRENCY_BY_COUNTRY: Record<Country, string> = {
  India: "INR",
  USA: "USD",
  UK: "GBP",
  Germany: "EUR",
  Canada: "CAD",
};

export const ROLE_TITLE_BY_DEPARTMENT: Record<Department, string> = {
  Engineering: "Engineer",
  Sales: "Sales Executive",
  HR: "HR Specialist",
  Finance: "Financial Analyst",
  Operations: "Operations Analyst",
  Marketing: "Marketing Specialist",
};

// Annual salary bands [min, max] in local currency, by country and level.
// Approximate, realistic-looking figures - not real compensation benchmarks.
export const SALARY_BANDS: Record<Country, Record<Level, [number, number]>> = {
  India: {
    Junior: [450_000, 700_000],
    Mid: [700_000, 1_300_000],
    Senior: [1_300_000, 2_400_000],
    Lead: [2_400_000, 4_200_000],
  },
  USA: {
    Junior: [60_000, 85_000],
    Mid: [85_000, 120_000],
    Senior: [120_000, 165_000],
    Lead: [165_000, 230_000],
  },
  UK: {
    Junior: [28_000, 40_000],
    Mid: [40_000, 58_000],
    Senior: [58_000, 85_000],
    Lead: [85_000, 120_000],
  },
  Germany: {
    Junior: [42_000, 55_000],
    Mid: [55_000, 75_000],
    Senior: [75_000, 100_000],
    Lead: [100_000, 135_000],
  },
  Canada: {
    Junior: [50_000, 70_000],
    Mid: [70_000, 95_000],
    Senior: [95_000, 130_000],
    Lead: [130_000, 175_000],
  },
};

// Years-of-tenure range by level, used to derive a realistic hire_date
// (a "Lead" is very unlikely to have joined last month).
export const TENURE_YEARS_BY_LEVEL: Record<Level, [number, number]> = {
  Junior: [0, 3],
  Mid: [2, 6],
  Senior: [5, 10],
  Lead: [8, 15],
};

// Small fraction of seeded employees are inactive, so the status filter
// on GET /employees has something real to filter against.
export const INACTIVE_STATUS_RATE = 0.05;
