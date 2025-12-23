import { Template } from './TemplateTypes';

export const ContractTemplate: Template = {
  id: "3",
  name: "Contract Template",
  type: "contract",
  description: "Standard business contract template",
  content: `CONTRACT AGREEMENT
Contract #[CONTRACT_NUMBER]
Date: [DATE]

This Agreement is made between [PARTY_A] and [PARTY_B].

1. Services/Products:
[DESCRIPTION]

2. Terms:
[TERMS]

3. Payment:
[PAYMENT_TERMS]

4. Duration:
[DURATION]

Signatures:
_________________    _________________
[PARTY_A]            [PARTY_B]
Date:                Date:`,
  lastModified: "2023-08-15",
  isActive: false
};