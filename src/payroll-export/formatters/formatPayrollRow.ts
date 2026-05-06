import { PayrollCsvRow } from "../types";

function parseNumericValue(value: string): string {
  const normalized = Number(value);
  return Number.isFinite(normalized) ? normalized.toFixed(2) : value;
}

function getValue(row: PayrollCsvRow, ...keys: string[]): string {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }

  return "";
}

export function formatPayrollRow(row: PayrollCsvRow): string {
  const employeeName = [
    getValue(row, "last_name", "Last Name"),
    getValue(row, "first_name", "First Name"),
    getValue(row, "mid_init", "Mid Init"),
  ]
    .filter(Boolean)
    .join(" ");

  return [
    `FY=${getValue(row, "fiscal_year", "Fiscal Year")}`,
    `agency=${getValue(row, "agency_name", "Agency Name")}`,
    `employee=${employeeName}`,
    `title=${getValue(row, "title_description", "Title Description")}`,
    `status=${getValue(row, "leave_status_as_of_june_30", "Leave Status as of June 30")}`,
    `baseSalary=${parseNumericValue(getValue(row, "base_salary", "Base Salary"))}`,
    `regularGross=${parseNumericValue(getValue(row, "regular_gross_paid", "Regular Gross Paid"))}`,
    `otPaid=${parseNumericValue(getValue(row, "total_ot_paid", "Total OT Paid"))}`,
    `otherPay=${parseNumericValue(getValue(row, "total_other_pay", "Total Other Pay"))}`,
    `borough=${getValue(row, "work_location_borough", "Work Location Borough")}`,
  ].join(" | ");
}
