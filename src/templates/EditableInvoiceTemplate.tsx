import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InvoiceTemplate } from './InvoiceTemplate';
import { replaceInvoicePlaceholders } from '@/utils/templateUtils';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  price: number;
  amount: number;
  discount: string;
}

const EditableInvoiceTemplate = () => {
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: 'INV-001',
    date: new Date().toLocaleDateString(),
    dueDate: '1/2/2026',
    businessName: 'Your Business Name',
    businessAddress: '123 Business Street',
    businessPhone: '(555) 123-4567',
    businessEmail: 'billing@yourbusiness.com',
    clientName: 'Client Company Name',
    clientAddress: '456 Client Avenue',
    clientCityStateZip: 'Client City, State 67890',
    clientPhone: '(555) 987-6543',
    clientEmail: 'accounts@clientcompany.com',
    subtotal: 2250.00,
    tax: 0,
    discount: 0,
    total: 2250.00,
    notes: 'Thank you for your business! Payment due within 30 days.',
    paymentOptions: 'Bank Transfer, Check, or Credit Card',
    thankYouMessage: 'Thank you for your business! Payment due within 30 days.',
    paymentTermsMessage: 'Please make checks payable to Your Business Name'
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: '001',
      description: 'Website Design & Development',
      quantity: 1,
      unit: 'Project',
      price: 1800,
      amount: 1800.00,
      discount: '-'
    },
    {
      id: '002',
      description: 'Monthly Support (3 months)',
      quantity: 3,
      unit: 'Months',
      price: 150,
      amount: 450.00,
      discount: '-'
    }
  ]);

  const handleInputChange = (field: string, value: string | number) => {
    setInvoiceData({
      ...invoiceData,
      [field]: value
    });
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    setItems(updatedItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        id: (items.length + 1).toString().padStart(3, '0'),
        description: '',
        quantity: 1,
        unit: '',
        price: 0,
        amount: 0,
        discount: '-'
      }
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const updatedItems = [...items];
      updatedItems.splice(index, 1);
      setItems(updatedItems);
    }
  };

  const generateInvoiceHTML = () => {
    // Create a copy of invoiceData with items
    const invoiceDataWithItems = {
      ...invoiceData,
      items: items
    };
    
    // Replace placeholders in the template with actual data
    return replaceInvoicePlaceholders(InvoiceTemplate.content, invoiceDataWithItems);
  };

  const handlePrint = () => {
    // Create a transaction object that matches what the print utility expects
    const transaction = {
      ...invoiceData,
      items: items,
      receiptNumber: invoiceData.invoiceNumber,
      subtotal: invoiceData.subtotal,
      tax: invoiceData.tax,
      discount: invoiceData.discount,
      total: invoiceData.total,
      amountReceived: invoiceData.total, // Assuming full payment
      change: 0
    };
    
    // Use the print utility function for consistent printing
    import('@/utils/printUtils').then(({ PrintUtils }) => {
      PrintUtils.printInvoice(transaction);
    });
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Editable Invoice Template</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Business Information</h3>
              <div className="space-y-2">
                <Input
                  value={invoiceData.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  placeholder="Business Name"
                />
                <Input
                  value={invoiceData.businessAddress}
                  onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                  placeholder="Business Address"
                />
                <Input
                  value={invoiceData.businessPhone}
                  onChange={(e) => handleInputChange('businessPhone', e.target.value)}
                  placeholder="Business Phone"
                />
                <Input
                  value={invoiceData.businessEmail}
                  onChange={(e) => handleInputChange('businessEmail', e.target.value)}
                  placeholder="Business Email"
                />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Client Information</h3>
              <div className="space-y-2">
                <Input
                  value={invoiceData.clientName}
                  onChange={(e) => handleInputChange('clientName', e.target.value)}
                  placeholder="Client Name"
                />
                <Input
                  value={invoiceData.clientAddress}
                  onChange={(e) => handleInputChange('clientAddress', e.target.value)}
                  placeholder="Client Address"
                />
                <Input
                  value={invoiceData.clientCityStateZip}
                  onChange={(e) => handleInputChange('clientCityStateZip', e.target.value)}
                  placeholder="City, State, ZIP"
                />
                <Input
                  value={invoiceData.clientPhone}
                  onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                  placeholder="Client Phone"
                />
                <Input
                  value={invoiceData.clientEmail}
                  onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                  placeholder="Client Email"
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">Invoice Number</label>
              <Input
                value={invoiceData.invoiceNumber}
                onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <Input
                value={invoiceData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Due Date</label>
              <Input
                value={invoiceData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
              />
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Invoice Items</h3>
            <table className="w-full border-collapse border border-gray-300 mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-2 py-1">ID</th>
                  <th className="border border-gray-300 px-2 py-1">Description</th>
                  <th className="border border-gray-300 px-2 py-1">Quantity</th>
                  <th className="border border-gray-300 px-2 py-1">Unit</th>
                  <th className="border border-gray-300 px-2 py-1">Price</th>
                  <th className="border border-gray-300 px-2 py-1">Amount</th>
                  <th className="border border-gray-300 px-2 py-1">Discount</th>
                  <th className="border border-gray-300 px-2 py-1">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 px-2 py-1">
                      <Input
                        value={item.id}
                        onChange={(e) => handleItemChange(index, 'id', e.target.value)}
                        className="w-full"
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      <Input
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        className="w-full"
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-full"
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      <Input
                        value={item.unit}
                        onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                        className="w-full"
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      <Input
                        type="number"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)}
                        className="w-full"
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      <Input
                        type="number"
                        step="0.01"
                        value={item.amount}
                        onChange={(e) => handleItemChange(index, 'amount', parseFloat(e.target.value) || 0)}
                        className="w-full"
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      <Input
                        value={item.discount}
                        onChange={(e) => handleItemChange(index, 'discount', e.target.value)}
                        className="w-full"
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => removeItem(index)}
                        disabled={items.length <= 1}
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Button onClick={addItem}>Add Item</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Totals</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={invoiceData.subtotal}
                    onChange={(e) => handleInputChange('subtotal', parseFloat(e.target.value) || 0)}
                    className="w-32 text-right"
                  />
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={invoiceData.tax}
                    onChange={(e) => handleInputChange('tax', parseFloat(e.target.value) || 0)}
                    className="w-32 text-right"
                  />
                </div>
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={invoiceData.discount}
                    onChange={(e) => handleInputChange('discount', parseFloat(e.target.value) || 0)}
                    className="w-32 text-right"
                  />
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={invoiceData.total}
                    onChange={(e) => handleInputChange('total', parseFloat(e.target.value) || 0)}
                    className="w-32 text-right"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Notes & Payment</h3>
              <div className="space-y-2">
                <Textarea
                  value={invoiceData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Notes"
                  rows={3}
                />
                <Textarea
                  value={invoiceData.paymentOptions}
                  onChange={(e) => handleInputChange('paymentOptions', e.target.value)}
                  placeholder="Payment Options"
                  rows={2}
                />
                <Input
                  value={invoiceData.thankYouMessage}
                  onChange={(e) => handleInputChange('thankYouMessage', e.target.value)}
                  placeholder="Thank You Message"
                />
                <Input
                  value={invoiceData.paymentTermsMessage}
                  onChange={(e) => handleInputChange('paymentTermsMessage', e.target.value)}
                  placeholder="Payment Terms Message"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-4">
            <Button variant="outline">Save Template</Button>
            <Button onClick={handlePrint}>Print Invoice</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { EditableInvoiceTemplate };