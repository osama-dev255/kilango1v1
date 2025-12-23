import { Template } from './TemplateTypes';

export const ReportTemplate: Template = {
  id: "8",
  name: "Report Template",
  type: "report",
  description: "Business report template for documentation",
  content: `BUSINESS REPORT
Report #[REPORT_NUMBER]
Date: [DATE]
Prepared by: [PREPARER]

Executive Summary:
[SUMMARY]

Details:
[DETAILS]

Conclusion:
[CONCLUSION]

Recommendations:
[RECOMMENDATIONS]`,
  lastModified: "2023-08-15",
  isActive: false
};