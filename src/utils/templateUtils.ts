// Utility functions for managing receipt templates
export interface ReceiptTemplateConfig {
  customTemplate: boolean;
  templateHeader: string;
  templateFooter: string;
  showBusinessInfo: boolean;
  showTransactionDetails: boolean;
  showItemDetails: boolean;
  showTotals: boolean;
  showPaymentInfo: boolean;
  fontSize: string;
  paperWidth: string;
}

// Purchase receipt template configuration
export interface PurchaseReceiptTemplateConfig {
  customTemplate: boolean;
  templateHeader: string;
  templateFooter: string;
  showBusinessInfo: boolean;
  showTransactionDetails: boolean;
  showItemDetails: boolean;
  showTotals: boolean;
  showPaymentInfo: boolean;
  showSupplierInfo: boolean;
  fontSize: string;
  paperWidth: string;
}

// Default template configuration
export const DEFAULT_TEMPLATE_CONFIG: ReceiptTemplateConfig = {
  customTemplate: false,
  templateHeader: "POS BUSINESS\n123 Business St, City, Country\nPhone: (123) 456-7890",
  templateFooter: "Thank you for your business!\nItems sold are not returnable\nVisit us again soon",
  showBusinessInfo: true,
  showTransactionDetails: true,
  showItemDetails: true,
  showTotals: true,
  showPaymentInfo: true,
  fontSize: "12px",
  paperWidth: "320px"
};

// Default purchase receipt template configuration
export const DEFAULT_PURCHASE_TEMPLATE_CONFIG: PurchaseReceiptTemplateConfig = {
  customTemplate: false,
  templateHeader: "POS BUSINESS\n123 Business St, City, Country\nPhone: (123) 456-7890",
  templateFooter: "Thank you for your business!\nItems purchased are not returnable\nVisit us again soon",
  showBusinessInfo: true,
  showTransactionDetails: true,
  showItemDetails: true,
  showTotals: true,
  showPaymentInfo: true,
  showSupplierInfo: true,
  fontSize: "12px",
  paperWidth: "320px"
};

// Get template configuration from localStorage or return default
export const getTemplateConfig = (): ReceiptTemplateConfig => {
  try {
    const config = localStorage.getItem('receiptTemplateConfig');
    return config ? { ...DEFAULT_TEMPLATE_CONFIG, ...JSON.parse(config) } : DEFAULT_TEMPLATE_CONFIG;
  } catch (error) {
    console.error('Error loading template config:', error);
    return DEFAULT_TEMPLATE_CONFIG;
  }
};

// Get purchase receipt template configuration from localStorage or return default
export const getPurchaseTemplateConfig = (): PurchaseReceiptTemplateConfig => {
  try {
    const config = localStorage.getItem('purchaseReceiptTemplateConfig');
    return config ? { ...DEFAULT_PURCHASE_TEMPLATE_CONFIG, ...JSON.parse(config) } : DEFAULT_PURCHASE_TEMPLATE_CONFIG;
  } catch (error) {
    console.error('Error loading purchase template config:', error);
    return DEFAULT_PURCHASE_TEMPLATE_CONFIG;
  }
};

// Save template configuration to localStorage
export const saveTemplateConfig = (config: ReceiptTemplateConfig) => {
  try {
    localStorage.setItem('receiptTemplateConfig', JSON.stringify(config));
  } catch (error) {
    console.error('Error saving template config:', error);
  }
};

// Save purchase receipt template configuration to localStorage
export const savePurchaseTemplateConfig = (config: PurchaseReceiptTemplateConfig) => {
  try {
    localStorage.setItem('purchaseReceiptTemplateConfig', JSON.stringify(config));
  } catch (error) {
    console.error('Error saving purchase template config:', error);
  }
};

// Generate receipt HTML using custom template
export const generateCustomReceipt = (transaction: any, config: ReceiptTemplateConfig) => {
  // Format items for receipt
  const formattedItems = transaction.items.map((item: any) => {
    const total = item.price * item.quantity;
    return {
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      total: total
    };
  });
  
  // Calculate totals
  const subtotal = transaction.subtotal || formattedItems.reduce((sum: number, item: any) => sum + item.total, 0);
  const tax = transaction.tax || 0;
  const discount = transaction.discount || 0;
  const total = transaction.total || (subtotal + tax - discount);
  const amountReceived = transaction.amountReceived || total;
  const change = transaction.change || (amountReceived - total);
  
  // Split header and footer into lines
  const headerLines = config.templateHeader.split('\n');
  const footerLines = config.templateFooter.split('\n');
  
  // Generate business info section
  let businessInfoHtml = '';
  if (config.showBusinessInfo) {
    businessInfoHtml = `
      <div class="header">
        ${headerLines.map(line => `<div>${line}</div>`).join('')}
      </div>
    `;
  }
  
  // Generate transaction details section
  let transactionDetailsHtml = '';
  if (config.showTransactionDetails) {
    transactionDetailsHtml = `
      <div class="receipt-info">
        <div>Receipt #: ${transaction.id || 'TXN-' + Date.now()}</div>
        <div>Date: ${new Date().toLocaleDateString()}</div>
        <div>Time: ${new Date().toLocaleTimeString()}</div>
      </div>
    `;
  }
  
  // Generate customer info section
  let customerInfoHtml = '';
  if (transaction.customer) {
    customerInfoHtml = `
      <div style="padding: 8px; margin-bottom: 10px; background-color: #f9f9f9;">
        <div style="font-weight: bold; margin-bottom: 3px;">${transaction.customer.name}</div>
        ${transaction.customer.phone ? `<div style="font-size: calc(${config.fontSize} - 2px); margin-bottom: 2px;">Phone: ${transaction.customer.phone}</div>` : ''}
        ${transaction.customer.email ? `<div style="font-size: calc(${config.fontSize} - 2px); margin-bottom: 2px;">Email: ${transaction.customer.email}</div>` : ''}
        ${transaction.customer.address ? `<div style="font-size: calc(${config.fontSize} - 2px); margin-bottom: 2px;">Address: ${transaction.customer.address}</div>` : ''}
        ${transaction.customer.tax_id ? `<div style="font-size: calc(${config.fontSize} - 2px); margin-bottom: 2px;">TIN: ${transaction.customer.tax_id}</div>` : ''}
      </div>
    `;
  }
  
  // Generate item details section
  let itemDetailsHtml = '';
  if (config.showItemDetails) {
    itemDetailsHtml = `
      <div class="items">
        ${formattedItems.map((item: any) => `
          <div class="item">
            <div class="item-name">${item.name}</div>
          </div>
          <div class="item">
            <div class="item-details">
              <span class="item-quantity">${item.quantity}</span>
              <span class="item-price">${item.price.toFixed(2)}</span>
              <span class="item-total">${item.total.toFixed(2)}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  // Generate totals section
  let totalsHtml = '';
  if (config.showTotals) {
    totalsHtml = `
      <div class="totals">
        <div class="total-row">
          <div>Subtotal:</div>
          <div>${subtotal.toFixed(2)}</div>
        </div>
        ${tax > 0 ? `
        <div class="total-row">
          <div>Tax:</div>
          <div>${tax.toFixed(2)}</div>
        </div>
        ` : ''}
        ${discount > 0 ? `
        <div class="total-row">
          <div>Discount:</div>
          <div>-${discount.toFixed(2)}</div>
        </div>
        ` : ''}
        <div class="total-row final-total">
          <div>TOTAL:</div>
          <div>${total.toFixed(2)}</div>
        </div>
      </div>
    `;
  }
  
  // Generate payment info section
  let paymentInfoHtml = '';
  if (config.showPaymentInfo) {
    paymentInfoHtml = `
      <div class="payment-info">
        <div class="total-row">
          <div>Payment Method:</div>
          <div>${transaction.paymentMethod || 'Cash'}</div>
        </div>
        <div class="total-row">
          <div>Amount Received:</div>
          <div>${amountReceived.toFixed(2)}</div>
        </div>
        <div class="total-row">
          <div>Change:</div>
          <div>${change.toFixed(2)}</div>
        </div>
      </div>
    `;
  }
  
  // Generate footer section
  let footerHtml = '';
  if (config.templateFooter) {
    footerHtml = `
      <div class="footer">
        ${footerLines.map(line => `<div>${line}</div>`).join('')}
      </div>
    `;
  }
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Receipt</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            font-size: ${config.fontSize};
            max-width: ${config.paperWidth};
            margin: 0 auto;
            padding: 10px;
          }
          .header {
            text-align: center;
            border-bottom: 1px dashed #000;
            padding-bottom: 10px;
            margin-bottom: 10px;
          }
          .business-name {
            font-size: calc(${config.fontSize} + 4px);
            font-weight: bold;
            margin-bottom: 5px;
          }
          .business-info {
            font-size: calc(${config.fontSize} - 2px);
            margin-bottom: 5px;
          }
          .receipt-info {
            display: flex;
            justify-content: space-between;
            font-size: calc(${config.fontSize} - 2px);
            margin-bottom: 10px;
          }
          .items {
            margin-bottom: 10px;
          }
          .item {
            display: flex;
            margin-bottom: 5px;
          }
          .item-name {
            flex: 2;
          }
          .item-details {
            flex: 1;
            text-align: right;
          }
          .item-price::before {
            content: "@ ";
          }
          .item-total {
            font-weight: bold;
          }
          .totals {
            border-top: 1px dashed #000;
            padding-top: 10px;
            margin-top: 10px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
          }
          .final-total {
            font-weight: bold;
            font-size: calc(${config.fontSize} + 2px);
            margin: 10px 0;
          }
          .payment-info {
            border-top: 1px dashed #000;
            padding-top: 10px;
            margin-top: 10px;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: calc(${config.fontSize} - 2px);
          }
          .thank-you {
            font-weight: bold;
            margin-bottom: 10px;
          }
        </style>
      </head>
      <body>
        ${businessInfoHtml}
        ${transactionDetailsHtml}
        ${customerInfoHtml}
        ${itemDetailsHtml}
        ${totalsHtml}
        ${paymentInfoHtml}
        ${footerHtml}
      </body>
    </html>
  `;
};

// Invoice template configuration interface
export interface InvoiceTemplateConfig {
  customTemplate: boolean;
  templateHeader: string;
  templateFooter: string;
  showBusinessInfo: boolean;
  showCustomerInfo: boolean;
  showTransactionDetails: boolean;
  showItemDetails: boolean;
  showTotals: boolean;
  showPaymentInfo: boolean;
  showInvoiceTerms: boolean;
  fontSize: string;
  paperWidth: string;
}

// Default invoice template configuration
export const DEFAULT_INVOICE_CONFIG: InvoiceTemplateConfig = {
  customTemplate: false,
  templateHeader: "YOUR COMPANY NAME\n123 Business St, City, Country\nPhone: (123) 456-7890",
  templateFooter: "Thank you for your business!\nThis invoice is valid without signature",
  showBusinessInfo: true,
  showCustomerInfo: true,
  showTransactionDetails: true,
  showItemDetails: true,
  showTotals: true,
  showPaymentInfo: true,
  showInvoiceTerms: true,
  fontSize: "12px",
  paperWidth: "320px"
};

// Get invoice template configuration from localStorage or return default
export const getInvoiceTemplateConfig = (): InvoiceTemplateConfig => {
  try {
    const config = localStorage.getItem('invoiceTemplateConfig');
    return config ? { ...DEFAULT_INVOICE_CONFIG, ...JSON.parse(config) } : DEFAULT_INVOICE_CONFIG;
  } catch (error) {
    console.error('Error loading invoice template config:', error);
    return DEFAULT_INVOICE_CONFIG;
  }
};

// Save invoice template configuration to localStorage
export const saveInvoiceTemplateConfig = (config: InvoiceTemplateConfig) => {
  try {
    localStorage.setItem('invoiceTemplateConfig', JSON.stringify(config));
  } catch (error) {
    console.error('Error saving invoice template config:', error);
  }
};

// Generate invoice HTML using custom template
export const generateCustomInvoice = (transaction: any, config: InvoiceTemplateConfig = DEFAULT_INVOICE_CONFIG) => {
  // Format items for invoice
  const formattedItems = transaction.items.map((item: any) => {
    const total = item.price * item.quantity;
    return {
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      total: total
    };
  });
  
  // Calculate totals
  const subtotal = transaction.subtotal || formattedItems.reduce((sum: number, item: any) => sum + item.total, 0);
  const tax = transaction.tax || 0;
  const discount = transaction.discount || 0;
  const total = transaction.total || (subtotal + tax - discount);
  const amountReceived = transaction.amountReceived || total;
  const change = transaction.change || (amountReceived - total);
  
  // Split header and footer into lines
  const headerLines = config.templateHeader.split('\n');
  const footerLines = config.templateFooter.split('\n');
  
  // Generate business info section
  let businessInfoHtml = '';
  if (config.showBusinessInfo) {
    businessInfoHtml = `
      <div class="header">
        <div class="business-name">${headerLines[0]}</div>
        <div class="business-info">${headerLines.slice(1).map(line => `<div>${line}</div>`).join('')}</div>
      </div>
    `;
  }
  
  // Generate transaction details section
  let transactionDetailsHtml = '';
  if (config.showTransactionDetails) {
    transactionDetailsHtml = `
      <div class="invoice-info">
        <div class="invoice-number">Invoice #: ${transaction.receiptNumber || 'INV-' + Date.now()}</div>
        <div class="invoice-date">Date: ${new Date(transaction.date || Date.now()).toLocaleDateString()}</div>
        <div class="invoice-due-date">Due Date: ${new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString()}</div>
      </div>
    `;
  }
  
  // Generate customer info section
  let customerInfoHtml = '';
  if (config.showCustomerInfo && transaction.customer) {
    customerInfoHtml = `
      <div class="customer-info" style="padding: 8px; margin-bottom: 10px; background-color: #f9f9f9;">
        <div style="font-weight: bold; margin-bottom: 3px;">${transaction.customer.name}</div>
        ${transaction.customer.phone ? `<div style="font-size: calc(${config.fontSize} - 2px); margin-bottom: 2px;">Phone: ${transaction.customer.phone}</div>` : ''}
        ${transaction.customer.email ? `<div style="font-size: calc(${config.fontSize} - 2px); margin-bottom: 2px;">Email: ${transaction.customer.email}</div>` : ''}
        ${transaction.customer.address ? `<div style="font-size: calc(${config.fontSize} - 2px); margin-bottom: 2px;">Address: ${transaction.customer.address}</div>` : ''}
        ${transaction.customer.tax_id ? `<div style="font-size: calc(${config.fontSize} - 2px); margin-bottom: 2px;">TIN: ${transaction.customer.tax_id}</div>` : ''}
      </div>
    `;
  } else if (config.showCustomerInfo) {
    customerInfoHtml = `
      <div class="customer-info" style="padding: 8px; margin-bottom: 10px; background-color: #f9f9f9;">
        <div style="font-weight: bold; margin-bottom: 3px;">Walk-in Customer</div>
      </div>
    `;
  }
  
  // Generate item details section
  let itemDetailsHtml = '';
  if (config.showItemDetails) {
    itemDetailsHtml = `
      <div class="items">
        <div class="item-header" style="display: flex; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 5px;">
          <div style="flex: 2;">Item</div>
          <div style="flex: 1; text-align: center;">Qty</div>
          <div style="flex: 1; text-align: right;">Price</div>
          <div style="flex: 1; text-align: right;">Total</div>
        </div>
        ${formattedItems.map((item: any) => `
          <div class="item" style="display: flex; margin-bottom: 5px;">
            <div class="item-name" style="flex: 2;">${item.name}</div>
            <div class="item-quantity" style="flex: 1; text-align: center;">${item.quantity}</div>
            <div class="item-price" style="flex: 1; text-align: right;">${item.price.toFixed(2)}</div>
            <div class="item-total" style="flex: 1; text-align: right; font-weight: bold;">${item.total.toFixed(2)}</div>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  // Generate totals section
  let totalsHtml = '';
  if (config.showTotals) {
    totalsHtml = `
      <div class="totals" style="border-top: 1px solid #000; padding-top: 10px; margin-top: 10px;">
        <div class="total-row" style="display: flex; justify-content: space-between; margin-bottom: 5px;">
          <div>Subtotal:</div>
          <div>${subtotal.toFixed(2)}</div>
        </div>
        ${tax > 0 ? `
        <div class="total-row" style="display: flex; justify-content: space-between; margin-bottom: 5px;">
          <div>Tax:</div>
          <div>${tax.toFixed(2)}</div>
        </div>
        ` : ''}
        ${discount > 0 ? `
        <div class="total-row" style="display: flex; justify-content: space-between; margin-bottom: 5px;">
          <div>Discount:</div>
          <div>-${discount.toFixed(2)}</div>
        </div>
        ` : ''}
        <div class="total-row final-total" style="display: flex; justify-content: space-between; margin: 10px 0; font-weight: bold; font-size: calc(${config.fontSize} + 2px); border-top: 1px solid #000; padding-top: 5px;">
          <div>TOTAL:</div>
          <div>${total.toFixed(2)}</div>
        </div>
      </div>
    `;
  }
  
  // Generate payment info section
  let paymentInfoHtml = '';
  if (config.showPaymentInfo) {
    paymentInfoHtml = `
      <div class="payment-info" style="margin-top: 10px;">
        <div class="total-row" style="display: flex; justify-content: space-between; margin-bottom: 5px;">
          <div>Payment Method:</div>
          <div>${transaction.paymentMethod || 'Cash'}</div>
        </div>
        <div class="total-row" style="display: flex; justify-content: space-between; margin-bottom: 5px;">
          <div>Amount Received:</div>
          <div>${amountReceived.toFixed(2)}</div>
        </div>
        <div class="total-row" style="display: flex; justify-content: space-between; margin-bottom: 5px;">
          <div>Change:</div>
          <div>${change.toFixed(2)}</div>
        </div>
      </div>
    `;
  }
  
  // Generate invoice terms section
  let termsHtml = '';
  if (config.showInvoiceTerms) {
    termsHtml = `
      <div class="invoice-terms" style="margin-top: 20px; padding-top: 10px; border-top: 1px dashed #000; font-size: calc(${config.fontSize} - 2px);">
        <div style="font-weight: bold; margin-bottom: 5px;">Terms & Conditions:</div>
        <div>• Payment is due within 30 days</div>
        <div>• Late payments may be subject to interest charges</div>
        <div>• All sales are final unless otherwise agreed in writing</div>
      </div>
    `;
  }
  
  // Generate signature section
  const signatureSection = `
    <div class="signature-section" style="margin-top: 40px; display: flex; justify-content: space-between;">
      <div style="text-align: center;">
        <div style="border-top: 1px solid #000; padding-top: 5px;">Authorized Signature</div>
      </div>
      <div style="text-align: center;">
        <div style="border-top: 1px solid #000; padding-top: 5px;">Customer Signature</div>
      </div>
    </div>
  `;
  
  // Generate footer section
  let footerHtml = '';
  if (config.templateFooter) {
    footerHtml = `
      <div class="footer" style="text-align: center; margin-top: 20px; font-size: calc(${config.fontSize} - 2px); border-top: 1px dashed #000; padding-top: 10px;">
        ${footerLines.map(line => `<div>${line}</div>`).join('')}
      </div>
    `;
  }
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            font-size: ${config.fontSize};
            max-width: ${config.paperWidth};
            margin: 0 auto;
            padding: 15px;
          }
          .header {
            text-align: center;
            margin-bottom: 15px;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
          }
          .business-name {
            font-size: calc(${config.fontSize} + 6px);
            font-weight: bold;
            margin-bottom: 5px;
          }
          .business-info {
            font-size: calc(${config.fontSize} - 1px);
            margin-bottom: 5px;
          }
          .invoice-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
            font-weight: bold;
          }
          .invoice-number {
            font-size: calc(${config.fontSize} + 2px);
          }
          .items {
            margin-bottom: 15px;
          }
          .item-header {
            font-weight: bold;
            border-bottom: 1px solid #000;
            padding-bottom: 5px;
            margin-bottom: 5px;
          }
          .item {
            display: flex;
            margin-bottom: 5px;
          }
          .item-name {
            flex: 2;
          }
          .item-quantity {
            flex: 1;
            text-align: center;
          }
          .item-price, .item-total {
            flex: 1;
            text-align: right;
          }
          .item-total {
            font-weight: bold;
          }
          .totals {
            border-top: 1px solid #000;
            padding-top: 10px;
            margin-top: 10px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
          }
          .final-total {
            font-weight: bold;
            font-size: calc(${config.fontSize} + 2px);
            margin: 10px 0;
            border-top: 1px solid #000;
            padding-top: 5px;
          }
          .payment-info {
            margin-top: 15px;
          }
          .invoice-terms {
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px dashed #000;
            font-size: calc(${config.fontSize} - 2px);
          }
          .signature-section {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: calc(${config.fontSize} - 2px);
            border-top: 1px dashed #000;
            padding-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="invoice-header">
          <h1 style="text-align: center; margin: 0 0 10px 0; font-size: calc(${config.fontSize} + 8px);">INVOICE</h1>
        </div>
        ${businessInfoHtml}
        ${transactionDetailsHtml}
        ${customerInfoHtml}
        ${itemDetailsHtml}
        ${totalsHtml}
        ${paymentInfoHtml}
        ${termsHtml}
        ${signatureSection}
        ${footerHtml}
      </body>
    </html>
  `;
};

// Generate purchase receipt HTML using custom template
export const generateCustomPurchaseReceipt = (transaction: any, config: PurchaseReceiptTemplateConfig) => {
  // Format items for receipt
  const formattedItems = transaction.items || [];
  
  // Calculate totals
  const subtotal = transaction.subtotal || formattedItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
  // Display only tax (18% of subtotal) - for informational purposes only
  const displayTax = subtotal * 0.18;
  const discount = transaction.discount || 0;
  // Actual total calculation (tax not included in computation)
  const total = transaction.total || (subtotal - discount);
  const amountReceived = transaction.amountReceived || total;
  const change = transaction.change || (amountReceived - total);
  
  // Split header and footer into lines
  const headerLines = config.templateHeader.split('\n');
  const footerLines = config.templateFooter.split('\n');
  
  // Generate business info section
  let businessInfoHtml = '';
  if (config.showBusinessInfo) {
    businessInfoHtml = `
      <div class="header">
        ${headerLines.map(line => `<div>${line}</div>`).join('')}
      </div>
    `;
  }
  
  // Generate transaction details section
  let transactionDetailsHtml = '';
  if (config.showTransactionDetails) {
    transactionDetailsHtml = `
      <div class="receipt-info">
        <div>Purchase Order #: ${transaction.orderNumber || 'PO-' + Date.now()}</div>
        <div>Date: ${new Date(transaction.date || Date.now()).toLocaleDateString()}</div>
        <div>Time: ${new Date(transaction.date || Date.now()).toLocaleTimeString()}</div>
      </div>
    `;
  }
  
  // Generate supplier info section
  let supplierInfoHtml = '';
  if (config.showSupplierInfo && transaction.supplier) {
    supplierInfoHtml = `
      <div class="supplier-info" style="margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px dashed #000;">
        <div class="total-row">
          <div><strong>Supplier:</strong></div>
          <div>${transaction.supplier.name}</div>
        </div>
        ${transaction.supplier.contactPerson ? `
        <div class="total-row">
          <div><strong>Contact:</strong></div>
          <div>${transaction.supplier.contactPerson}</div>
        </div>
        ` : ''}
        ${transaction.supplier.phone ? `<div class="total-row"><div>Phone:</div><div>${transaction.supplier.phone}</div></div>` : ''}
        ${transaction.supplier.email ? `<div class="total-row"><div>Email:</div><div>${transaction.supplier.email}</div></div>` : ''}
        ${transaction.supplier.address ? `<div class="total-row"><div>Address:</div><div>${transaction.supplier.address}</div></div>` : ''}
        ${transaction.supplier.tax_id ? `<div class="total-row"><div>TIN:</div><div>${transaction.supplier.tax_id}</div></div>` : ''}
      </div>
    `;
  }
  
  // Generate item details section
  let itemDetailsHtml = '';
  if (config.showItemDetails) {
    itemDetailsHtml = `
      <div class="items">
        ${formattedItems.map((item: any) => `
          <div class="item">
            <div class="item-name">${item.name}</div>
          </div>
          <div class="item">
            <div class="item-details">
              <span class="item-quantity">${item.quantity}</span>
              <span class="item-price">${item.price.toFixed(2)}</span>
              <span class="item-total">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  // Generate totals section
  let totalsHtml = '';
  if (config.showTotals) {
    totalsHtml = `
      <div class="totals">
        <div class="total-row">
          <div>Subtotal:</div>
          <div>${subtotal.toFixed(2)}</div>
        </div>
        <div class="total-row">
          <div>Tax (18%):</div>
          <div>${displayTax.toFixed(2)}</div>
        </div>
        ${discount > 0 ? `
        <div class="total-row">
          <div>Discount:</div>
          <div>-${discount.toFixed(2)}</div>
        </div>
        ` : ''}
        <div class="total-row final-total">
          <div>TOTAL:</div>
          <div>${total.toFixed(2)}</div>
        </div>
        <div class="note">Note: Tax is for display purposes only and not included in calculations</div>
      </div>
    `;
  }
  
  // Generate payment info section
  let paymentInfoHtml = '';
  if (config.showPaymentInfo) {
    paymentInfoHtml = `
      <div class="payment-info">
        <div class="total-row">
          <div>Payment Method:</div>
          <div>${transaction.paymentMethod || 'Cash'}</div>
        </div>
        <div class="total-row">
          <div>Amount Received:</div>
          <div>${amountReceived.toFixed(2)}</div>
        </div>
        <div class="total-row">
          <div>Change:</div>
          <div>${change.toFixed(2)}</div>
        </div>
      </div>
    `;
  }
  
  // Generate footer section
  let footerHtml = '';
  if (config.templateFooter) {
    footerHtml = `
      <div class="footer">
        ${footerLines.map(line => `<div>${line}</div>`).join('')}
      </div>
    `;
  }
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Purchase Receipt</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            font-size: ${config.fontSize};
            max-width: ${config.paperWidth};
            margin: 0 auto;
            padding: 10px;
          }
          .header {
            text-align: center;
            border-bottom: 1px dashed #000;
            padding-bottom: 10px;
            margin-bottom: 10px;
          }
          .business-name {
            font-size: calc(${config.fontSize} + 4px);
            font-weight: bold;
            margin-bottom: 5px;
          }
          .business-info {
            font-size: calc(${config.fontSize} - 2px);
            margin-bottom: 5px;
          }
          .receipt-info {
            display: flex;
            justify-content: space-between;
            font-size: calc(${config.fontSize} - 2px);
            margin-bottom: 10px;
          }
          .items {
            margin-bottom: 10px;
          }
          .item {
            display: flex;
            margin-bottom: 5px;
          }
          .item-name {
            flex: 2;
          }
          .item-details {
            flex: 1;
            text-align: right;
          }
          .item-price::before {
            content: "@ ";
          }
          .item-total {
            font-weight: bold;
          }
          .totals {
            border-top: 1px dashed #000;
            padding-top: 10px;
            margin-top: 10px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
          }
          .final-total {
            font-weight: bold;
            font-size: calc(${config.fontSize} + 2px);
            margin: 10px 0;
          }
          .payment-info {
            border-top: 1px dashed #000;
            padding-top: 10px;
            margin-top: 10px;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: calc(${config.fontSize} - 2px);
          }
          .thank-you {
            font-weight: bold;
            margin-bottom: 10px;
          }
          .note {
            font-size: calc(${config.fontSize} - 3px);
            font-style: italic;
            margin-top: 5px;
          }
        </style>
      </head>
      <body>
        ${businessInfoHtml}
        ${transactionDetailsHtml}
        ${supplierInfoHtml}
        ${itemDetailsHtml}
        ${totalsHtml}
        ${paymentInfoHtml}
        ${footerHtml}
      </body>
    </html>
  `;
};