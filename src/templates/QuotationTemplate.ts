import { Template } from './TemplateTypes';

export const QuotationTemplate: Template = {
  id: "7",
  name: "Quotation Template",
  type: "quotation",
  description: "Business quotation/proposal template",
  content: `QUOTATION
Quote #[QUOTE_NUMBER]
Date: [DATE]
Valid Until: [VALID_UNTIL]

From:
[BUSINESS_NAME]
[BUSINESS_ADDRESS]
[BUSINESS_PHONE]

To:
[CUSTOMER_NAME]
[CUSTOMER_ADDRESS]
[CUSTOMER_PHONE]

Items:
[ITEM_LIST]

Subtotal: [SUBTOTAL]
Tax: [TAX]
Discount: [DISCOUNT]
Total: [TOTAL]

This quote is valid for 30 days.`,
  lastModified: "2023-08-15",
  isActive: false
};