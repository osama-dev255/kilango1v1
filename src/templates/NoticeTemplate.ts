import { Template } from './TemplateTypes';

export const NoticeTemplate: Template = {
  id: "6",
  name: "Notice Template",
  type: "notice",
  description: "Formal business notice template",
  content: `NOTICE
Notice #[NOTICE_NUMBER]
Date: [DATE]

To: [RECIPIENT]
From: [SENDER]

Subject: [SUBJECT]

[CONTENT]

Effective Date: [EFFECTIVE_DATE]

Contact:
[CONTACT_INFORMATION]`,
  lastModified: "2023-08-15",
  isActive: false
};