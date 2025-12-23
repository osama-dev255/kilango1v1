import { Template } from './TemplateTypes';

export const ExpenseVoucherTemplate: Template = {
  id: "11",
  name: "Expense Voucher",
  type: "expense-voucher",
  description: "Professional expense voucher template",
  content: `EXPENSE VOUCHER
Voucher #[VOUCHER_NUMBER]
Date: [DATE]
Submitted by: [EMPLOYEE_NAME]

Expense Details:
Category: [CATEGORY]
Description: [DESCRIPTION]
Amount: [AMOUNT]

Supporting Documents:
[DOCUMENTS]

Approved by: _________________
Signature: _________________
Date: [DATE]`,
  lastModified: "2023-08-15",
  isActive: false
};