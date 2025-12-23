import { Template } from './TemplateTypes';

export const ComplimentaryGoodsTemplate: Template = {
  id: "10",
  name: "Complimentary Goods",
  type: "complimentary-goods",
  description: "Professional complimentary goods template",
  content: `COMPLIMENTARY GOODS VOUCHER
Voucher #[VOUCHER_NUMBER]
Date: [DATE]

This is to certify that the following goods have been provided free of charge to [CUSTOMER_NAME]:

Items:
[ITEM_LIST]

Reason for Complimentary Goods:
[REASON]

Authorized by: _________________
Signature: _________________
Date: [DATE]`,
  lastModified: "2023-08-15",
  isActive: false
};