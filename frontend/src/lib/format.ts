export function formatSalary(amount: number, currency: string): string {
  return `${currency} ${amount.toLocaleString("en-US")}`
}
