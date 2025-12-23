import { Template } from './TemplateTypes';

export const SalarySlipTemplate: Template = {
  id: "9",
  name: "Salary Slip",
  type: "salary-slip",
  description: "Employee salary slip template",
  content: `SALARY SLIP
Employee: [EMPLOYEE_NAME]
Employee ID: [EMPLOYEE_ID]
Pay Period: [PAY_PERIOD]

Earnings:
Basic Salary: [BASIC_SALARY]
Allowances: [ALLOWANCES]
Overtime: [OVERTIME]
Bonus: [BONUS]
Gross Pay: [GROSS_PAY]

Deductions:
Tax: [TAX]
Insurance: [INSURANCE]
Other: [OTHER_DEDUCTIONS]
Total Deductions: [TOTAL_DEDUCTIONS]

Net Pay: [NET_PAY]

Paid Date: [PAID_DATE]`,
  lastModified: "2023-08-15",
  isActive: false
};