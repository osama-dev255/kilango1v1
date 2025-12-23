import { Template } from './TemplateTypes';

export const ReceiptTemplate: Template = {
  id: "5",
  name: "Receipt Template",
  type: "receipt",
  description: "Business receipt template for payments",
  content: `POS BUSINESS
123 Business St, City, Country
Phone: (123) 456-7890

Receipt #[RECEIPT_NUMBER]
Date: [DATE]
Time: [TIME]
Customer: [CUSTOMER_NAME]

Items:
[ITEM_LIST]

Subtotal: [SUBTOTAL]
Tax: [TAX]
Discount: [DISCOUNT]
Total: [TOTAL]
Payment Method: [PAYMENT_METHOD]
Amount Received: [AMOUNT_RECEIVED]
Change: [CHANGE]

Thank you for your business!`,
  lastModified: "2023-08-15",
  isActive: false
};