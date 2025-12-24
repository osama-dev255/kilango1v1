import { Template } from './TemplateTypes';

export const InvoiceTemplate: Template = {
  id: "4",
  name: "Invoice Template",
  type: "invoice",
  description: "Professional invoice template for billing",
  content: `<!DOCTYPE html>
<html>
<head>
  <title>Invoice</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .header { text-align: center; margin-bottom: 20px; }
    .invoice-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
    .customer-info { margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    .totals { text-align: right; margin-top: 20px; }
    .signature { margin-top: 40px; display: flex; justify-content: space-between; }
  </style>
</head>
<body>
  <div class="header">
    <h1>INVOICE</h1>
    <p>Invoice #: [INVOICE_NUMBER]</p>
    <p>Date: [DATE]</p>
    <p>Due Date: [DUE_DATE]</p>
  </div>
  
  <div class="invoice-info">
    <div>
      <h3>From:</h3>
      <p>[BUSINESS_NAME]</p>
      <p>[BUSINESS_ADDRESS]</p>
      <p>Phone: [BUSINESS_PHONE]</p>
      <p>Email: [BUSINESS_EMAIL]</p>
    </div>
    <div>
      <h3>To:</h3>
      <p>[CUSTOMER_NAME]</p>
      <p>[CUSTOMER_ADDRESS]</p>
      <p>[CUSTOMER_CITY_STATE_ZIP]</p>
      <p>Phone: [CUSTOMER_PHONE]</p>
      <p>Email: [CUSTOMER_EMAIL]</p>
    </div>
  </div>
  
  <div class="customer-info">
    <p><strong>Payment Terms:</strong> Due on Receipt</p>
    <p><strong>Due Date:</strong> [DUE_DATE]</p>
  </div>
  
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Description</th>
        <th>Quantity</th>
        <th>Unit</th>
        <th>Price</th>
        <th>Amount</th>
        <th>Discount</th>
      </tr>
    </thead>
    <tbody>
      [ITEM_LIST]
    </tbody>
  </table>
  
  <div class="totals">
    <p><strong>Subtotal:</strong> [SUBTOTAL]</p>
    <p><strong>Tax:</strong> [TAX]</p>
    <p><strong>Discount:</strong> [DISCOUNT]</p>
    <p><strong>Total:</strong> [TOTAL]</p>
  </div>
  
  <div>
    <p><strong>NOTES:</strong></p>
    <p>[NOTES]</p>
  </div>
  
  <div>
    <p><strong>PAYMENT OPTIONS:</strong></p>
    <p>[PAYMENT_OPTIONS]</p>
  </div>
  
  <div class="signature">
    <div>
      <p>_________________________________</p>
      <p>Authorized Signature</p>
    </div>
    <div>
      <p>_________________________________</p>
      <p>Customer Signature</p>
    </div>
  </div>
  
  <div style="margin-top: 30px; text-align: center; font-size: 0.8em; color: #666;">
    <p>[THANK_YOU_MESSAGE]</p>
    <p>[PAYMENT_TERMS_MESSAGE]</p>
    <p>Please make checks payable to [BUSINESS_NAME]</p>
  </div>
</body>
</html>`,
  lastModified: "2025-12-24",
  isActive: true
};