CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY,
  employee_code TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  country TEXT NOT NULL,
  department TEXT NOT NULL,
  role_title TEXT NOT NULL,
  level TEXT NOT NULL,
  currency TEXT NOT NULL,
  salary_amount NUMERIC NOT NULL,
  hire_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_employees_country ON employees (country);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees (department);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees (status);

CREATE TABLE IF NOT EXISTS salary_history (
  id UUID PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES employees (id),
  salary_amount NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  effective_date DATE NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_salary_history_employee_id ON salary_history (employee_id);
