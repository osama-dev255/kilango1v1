import { Template } from './TemplateTypes';

export const OrderFormTemplate: Template = {
  id: "2",
  name: "Order Form",
  type: "order-form",
  description: "Business order form for customer purchases",
  content: `ORDER FORM
Order #[ORDER_NUMBER]
Date: [DATE]

Customer:
[CUSTOMER_NAME]
[CUSTOMER_ADDRESS]
[CUSTOMER_PHONE]

Items:
[ITEM_LIST]

Subtotal: [SUBTOTAL]
Tax: [TAX]
Discount: [DISCOUNT]
Total: [TOTAL]

Special Instructions:
[SPECIAL_INSTRUCTIONS]

Signature: _________________
Date: [SIGNATURE_DATE]`,
  lastModified: "2023-08-15",
  isActive: false
};