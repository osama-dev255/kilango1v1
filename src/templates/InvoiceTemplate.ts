import { Template } from './TemplateTypes';

export const InvoiceTemplate: Template = {
  id: "4",
  name: "Invoice Template",
  type: "invoice",
  description: "Professional invoice template for billing",
  content: `INVOICE
Invoice #[INVOICE_NUMBER]
Date: [DATE]
Due Date: [DUE_DATE]

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

Terms:
Payment due within 30 days

Thank you for your business!`,
  lastModified: "2023-08-15",
  isActive: false
};