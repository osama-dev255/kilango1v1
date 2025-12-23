import { Template } from './TemplateTypes';

export const DeliveryNoteTemplate: Template = {
  id: "1",
  name: "Delivery Note",
  type: "delivery-note",
  description: "Professional delivery note template for product shipments",
  content: `DELIVERY NOTE
Delivery #[DELIVERY_NUMBER]
Date: [DATE]
Vehicle: [VEHICLE_REGISTRATION]
Driver: [DRIVER_NAME]

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

Special Instructions:
[SPECIAL_INSTRUCTIONS]

Signature: _________________
Date: [SIGNATURE_DATE]

Thank you for your business!`,
  lastModified: "2023-08-15",
  isActive: true
};