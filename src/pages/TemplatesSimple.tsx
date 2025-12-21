import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileText, 
  Receipt, 
  Mail, 
  Download, 
  Upload, 
  Eye,
  Edit,
  Save,
  Printer,
  Copy,
  Trash2,
  Truck,
  FileSpreadsheet,
  FileWarning,
  FileBarChart,
  FileUser,
  Gift,
  Wallet,
  StickyNote,
  ScrollText,
  FileCheck,
  FileX,
  Plus,
  Minus
} from "lucide-react";
import { getTemplateConfig, saveTemplateConfig, ReceiptTemplateConfig } from "@/utils/templateUtils";
import { PrintUtils } from "@/utils/printUtils";

// Define TypeScript interfaces
interface Template {
  id: string;
  name: string;
  type: "delivery-note" | "order-form" | "contract" | "invoice" | "receipt" | "notice" | "quotation" | "report" | "salary-slip" | "complimentary-goods" | "expense-voucher";
  description: string;
  content: string;
  lastModified: string;
  isActive: boolean;
}

interface DeliveryNoteItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  delivered: number;
  remarks: string;
}

interface DeliveryNoteData {
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;
  customerName: string;
  customerAddress1: string;
  customerAddress2: string;
  customerPhone: string;
  customerEmail: string;
  deliveryNoteNumber: string;
  date: string;
  deliveryDate: string;
  vehicle: string;
  driver: string;
  items: DeliveryNoteItem[];
  deliveryNotes: string;
  totalItems: number;
  totalQuantity: number;
  totalPackages: number;
  preparedByName: string;
  preparedByDate: string;
  driverName: string;
  driverDate: string;
  receivedByName: string;
  receivedByDate: string;
  // Payment details
  paidAmount: number;
  // Approval details
  approvalName: string;
  approvalDate: string;
}

interface SavedDeliveryNote {
  id: string;
  name: string;
  data: DeliveryNoteData;
  createdAt: string;
  updatedAt: string;
}

interface TemplatesProps {
  onBack?: () => void;
}

// Main component
export const TemplatesSimple = ({ onBack }: TemplatesProps) => {
  // State management
  const [activeTab, setActiveTab] = useState<"manage" | "customize" | "preview">("manage");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [viewingTemplate, setViewingTemplate] = useState<string | null>(null);
  const [deliveryNoteData, setDeliveryNoteData] = useState<DeliveryNoteData>(getDefaultDeliveryNoteData());
  const [savedDeliveryNotes, setSavedDeliveryNotes] = useState<SavedDeliveryNote[]>([]);
  const [deliveryNoteName, setDeliveryNoteName] = useState<string>("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize saved delivery notes from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedDeliveryNotes');
    if (saved) {
      try {
        setSavedDeliveryNotes(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing saved delivery notes:', e);
      }
    }
  }, []);

  // Default delivery note data
  function getDefaultDeliveryNoteData(): DeliveryNoteData {
    return {
      businessName: "YOUR BUSINESS NAME",
      businessAddress: "123 Business Street, City, Country",
      businessPhone: "+1234567890",
      businessEmail: "info@yourbusiness.com",
      customerName: "Customer Name",
      customerAddress1: "Customer Address Line 1",
      customerAddress2: "Customer Address Line 2",
      customerPhone: "+1234567890",
      customerEmail: "customer@example.com",
      deliveryNoteNumber: "DN-001",
      date: new Date().toLocaleDateString(),
      deliveryDate: "",
      vehicle: "",
      driver: "",
      items: [
        { id: "1", description: "Sample Product 1", quantity: 10, unit: "pcs", delivered: 10, remarks: "Good condition" },
        { id: "2", description: "Sample Product 2", quantity: 5, unit: "boxes", delivered: 5, remarks: "Fragile" }
      ],
      deliveryNotes: "Please handle with care. Fragile items included.\nSignature required upon delivery.",
      totalItems: 2,
      totalQuantity: 15,
      totalPackages: 2,
      preparedByName: "",
      preparedByDate: "",
      driverName: "",
      driverDate: "",
      receivedByName: "",
      receivedByDate: "",
      // Payment details
      paidAmount: 0,
      // Approval details
      approvalName: "",
      approvalDate: ""
    };
  }

  // Template data
  const [templates] = useState<Template[]>([
    {
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
    },
    {
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
    },
    {
      id: "3",
      name: "Invoice Template",
      type: "invoice",
      description: "Professional invoice template for billing",
      content: `INVOICE
Invoice #[INVOICE_NUMBER]
Date: [DATE]
Due Date: [DUE_DATE]

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

Subtotal: [SUBTOTAL]
Tax: [TAX]
Discount: [DISCOUNT]
Total: [TOTAL]

Terms:
Payment due within 30 days

Thank you for your business!`,
      lastModified: "2023-08-15",
      isActive: false
    },
    {
      id: "4",
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
    }
  ]);

  // Template action handlers
  const handleEditTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    setActiveTab("customize");
  };

  const handleViewTemplate = (templateId: string) => {
    setViewingTemplate(templateId);
    setActiveTab("customize");
  };

  const handlePreviewTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template && template.type === "delivery-note") {
      setActiveTab("preview");
    } else {
      handlePrintPreview(templateId);
    }
  };

  const handleDeleteTemplate = (templateId: string) => {
    // In a real app, you would delete from a database
    console.log(`Deleting template ${templateId}`);
  };

  const handleDuplicateTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      // In a real app, you would save the duplicated template
      console.log(`Duplicating template ${templateId}`);
    }
  };

  const handleExportTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      const dataStr = JSON.stringify(template, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `${template.name.replace(/\s+/g, '_')}_template.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
  };

  const handleImportTemplate = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const templateData = JSON.parse(e.target?.result as string);
          console.log('Imported template:', templateData);
          // In a real app, you would add this to your templates state
          alert('Template imported successfully!');
        } catch (error) {
          console.error('Error importing template:', error);
          alert('Error importing template. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleApplyToReceiptSystem = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template && template.type === "receipt") {
      // Get current template config
      const config = getTemplateConfig();
      
      // Update with template content
      const updatedConfig: ReceiptTemplateConfig = {
        ...config,
        customTemplate: true,
        templateHeader: template.content.split('\n\n')[0] || "",
        templateFooter: template.content.split('\n\n').pop() || "",
      };
      
      // Save to localStorage
      saveTemplateConfig(updatedConfig);
      
      alert(`Template "${template.name}" applied to receipt system successfully!`);
    } else {
      alert("Only receipt templates can be applied to the receipt system.");
    }
  };

  const handlePrintPreview = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      // Create a mock transaction for preview
      const mockTransaction = {
        id: "TXN-001",
        receiptNumber: "INV-2023-001",
        items: [
          { name: "Product 1", price: 10.00, quantity: 2, total: 20.00 },
          { name: "Product 2", price: 15.00, quantity: 1, total: 15.00 }
        ],
        subtotal: 35.00,
        tax: 6.30,
        discount: 5.00,
        total: 36.30,
        paymentMethod: "Cash",
        amountReceived: 40.00,
        change: 3.70,
        customer: {
          name: "John Doe",
          phone: "(555) 123-4567",
          email: "john@example.com"
        }
      };
      
      // Print using the existing PrintUtils
      PrintUtils.printReceipt(mockTransaction);
    }
  };

  // Delivery note handlers
  const handleDeliveryNoteChange = (field: keyof DeliveryNoteData, value: string | number) => {
    setDeliveryNoteData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleItemChange = (itemId: string, field: keyof DeliveryNoteItem, value: string | number) => {
    setDeliveryNoteData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleAddItem = () => {
    setDeliveryNoteData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: Date.now().toString(),
          description: "",
          quantity: 0,
          unit: "",
          delivered: 0,
          remarks: ""
        }
      ]
    }));
  };

  const handleRemoveItem = (itemId: string) => {
    setDeliveryNoteData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  const calculateTotals = () => {
    const totalItems = deliveryNoteData.items.length;
    const totalQuantity = deliveryNoteData.items.reduce((sum, item) => sum + Number(item.delivered || 0), 0);
    const totalPackages = deliveryNoteData.items.reduce((count, item) => 
      item.unit && item.delivered ? count + 1 : count, 0
    );
    
    return { totalItems, totalQuantity, totalPackages };
  };

  const handleSaveDeliveryNote = () => {
    const newSavedNote: SavedDeliveryNote = {
      id: Date.now().toString(),
      name: deliveryNoteName || `Delivery Note ${new Date().toLocaleDateString()}`,
      data: deliveryNoteData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const updatedNotes = [...savedDeliveryNotes, newSavedNote];
    setSavedDeliveryNotes(updatedNotes);
    localStorage.setItem('savedDeliveryNotes', JSON.stringify(updatedNotes));
    
    alert(`Delivery note "${newSavedNote.name}" saved successfully!`);
  };

  const handleLoadDeliveryNote = (noteId: string) => {
    const note = savedDeliveryNotes.find(n => n.id === noteId);
    if (note) {
      setDeliveryNoteData(note.data);
      setDeliveryNoteName(note.name);
      setActiveTab("preview");
      alert(`Delivery note "${note.name}" loaded successfully!`);
    }
  };

  const handlePrintDeliveryNote = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const totals = calculateTotals();
      
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Delivery Note</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px;
              font-size: 14px;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .header h1 {
              font-size: 24px;
              margin: 0;
            }
            .section {
              margin-bottom: 20px;
            }
            .grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
            }
            .grid-4 {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr 1fr;
              gap: 10px;
            }
            .signatures {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 20px;
              margin-top: 40px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 10px 0;
            }
            th, td {
              border: 1px solid #000;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f0f0f0;
            }
            .text-right {
              text-align: right;
            }
            .font-bold {
              font-weight: bold;
            }
            .mt-4 {
              margin-top: 20px;
            }
            .mb-2 {
              margin-bottom: 10px;
            }
            .signature-line {
              margin-top: 40px;
              padding-top: 5px;
              border-top: 1px solid #000;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>DELIVERY NOTE</h1>
          </div>
          
          <div class="grid">
            <div>
              <h2 class="font-bold">${deliveryNoteData.businessName}</h2>
              <p>${deliveryNoteData.businessAddress}</p>
              <p>Phone: ${deliveryNoteData.businessPhone}</p>
              <p>Email: ${deliveryNoteData.businessEmail}</p>
            </div>
            
            <div>
              <h3 class="font-bold">TO:</h3>
              <p>${deliveryNoteData.customerName}</p>
              <p>${deliveryNoteData.customerAddress1}</p>
              <p>${deliveryNoteData.customerAddress2}</p>
              <p>Phone: ${deliveryNoteData.customerPhone}</p>
              <p>Email: ${deliveryNoteData.customerEmail}</p>
            </div>
          </div>
          
          <div class="grid-4">
            <div>
              <p class="font-bold">Delivery Note #:</p>
              <p>${deliveryNoteData.deliveryNoteNumber}</p>
            </div>
            <div>
              <p class="font-bold">Date:</p>
              <p>${deliveryNoteData.date}</p>
            </div>
            <div>
              <p class="font-bold">Delivery Date:</p>
              <p>${deliveryNoteData.deliveryDate || '_________'}</p>
            </div>
            <div>
              <p class="font-bold">Vehicle #:</p>
              <p>${deliveryNoteData.vehicle || '_________'}</p>
            </div>
            <div>
              <p class="font-bold">Driver:</p>
              <p>${deliveryNoteData.driver || '_________'}</p>
            </div>
          </div>
          
          <div class="section">
            <h3 class="font-bold mb-2">ITEMS DELIVERED:</h3>
            <table>
              <thead>
                <tr>
                  <th>Item Description</th>
                  <th>Quantity</th>
                  <th>Unit</th>
                  <th>Delivered</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                ${deliveryNoteData.items.map(item => `
                  <tr>
                    <td>${item.description}</td>
                    <td>${item.quantity}</td>
                    <td>${item.unit}</td>
                    <td>${item.delivered}</td>
                    <td>${item.remarks}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="section">
            <h3 class="font-bold mb-2">DELIVERY NOTES:</h3>
            <p>${deliveryNoteData.deliveryNotes.replace(/\n/g, '<br>')}</p>
          </div>
          
          <div class="grid-4">
            <div>
              <p class="font-bold">Total Items:</p>
              <p>${totals.totalItems}</p>
            </div>
            <div>
              <p class="font-bold">Total Quantity:</p>
              <p>${totals.totalQuantity} units</p>
            </div>
            <div>
              <p class="font-bold">Total Packages:</p>
              <p>${totals.totalPackages}</p>
            </div>
          </div>
          
          <!-- Payment Details -->
          <div class="section border-t pt-4">
            <h3 class="font-bold mb-2">Payment Details</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span class="font-bold">Paid Amount:</span> $${deliveryNoteData.paidAmount.toFixed(2)}
              </div>
            </div>
          </div>
          
          <!-- Approval -->
          <div class="section border-t pt-4">
            <h3 class="font-bold mb-2">Approval</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span class="font-bold">Name:</span> ${deliveryNoteData.approvalName || '_________'}
              </div>
              <div>
                <span class="font-bold">Date:</span> ${deliveryNoteData.approvalDate || '_________'}
              </div>
            </div>
          </div>
          
          <div class="signatures">
            <div>
              <h4 class="font-bold">Prepared By</h4>
              <p>Name: ${deliveryNoteData.preparedByName || '_________________'}</p>
              <p>Date: ${deliveryNoteData.preparedByDate || '_________'}</p>
            </div>
            
            <div>
              <h4 class="font-bold">Driver Signature</h4>
              <p>Name: ${deliveryNoteData.driverName || '_________________'}</p>
              <p>Date: ${deliveryNoteData.driverDate || '_________'}</p>
            </div>
            
            <div>
              <h4 class="font-bold">Received By</h4>
              <p>Name: ${deliveryNoteData.receivedByName || '_________________'}</p>
              <p>Date: ${deliveryNoteData.receivedByDate || '_________'}</p>
              <p class="signature-line">(Signature Required)</p>
            </div>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
        </html>
      `;
      
      printWindow.document.write(printContent);
      printWindow.document.close();
    }
  };

  // Find the template being viewed/edited
  const currentTemplate = templates.find(t => t.id === (selectedTemplate || viewingTemplate)) || templates[0];

  // Get icon for template type
  const getTemplateIcon = (type: string) => {
    switch (type) {
      case "delivery-note": return <Truck className="h-5 w-5" />;
      case "order-form": return <FileSpreadsheet className="h-5 w-5" />;
      case "contract": return <ScrollText className="h-5 w-5" />;
      case "invoice": return <FileText className="h-5 w-5" />;
      case "receipt": return <Receipt className="h-5 w-5" />;
      case "notice": return <FileWarning className="h-5 w-5" />;
      case "quotation": return <FileCheck className="h-5 w-5" />;
      case "report": return <FileBarChart className="h-5 w-5" />;
      case "salary-slip": return <FileUser className="h-5 w-5" />;
      case "complimentary-goods": return <Gift className="h-5 w-5" />;
      case "expense-voucher": return <Wallet className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Business Templates</h1>
              <p className="text-muted-foreground">Professional templates for your business documents</p>
            </div>
            {onBack && (
              <Button variant="outline" onClick={onBack}>
                ← Back to Dashboard
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {activeTab === "manage" 
                ? "Template Management" 
                : activeTab === "preview"
                  ? "Delivery Note Preview"
                  : viewingTemplate 
                    ? `Viewing Template: ${currentTemplate?.name || 'Template'}`
                    : selectedTemplate 
                      ? `Editing Template: ${currentTemplate?.name || 'Template'}`
                      : "Template Customization"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeTab === "manage" ? (
              <TemplateManagementView 
                templates={templates}
                onView={handlePreviewTemplate}
                onPrint={handlePrintPreview}
                onDownload={handleExportTemplate}
                getTemplateIcon={getTemplateIcon}
              />
            ) : activeTab === "preview" ? (
              <DeliveryNotePreview 
                deliveryNoteData={deliveryNoteData}
                deliveryNoteName={deliveryNoteName}
                setDeliveryNoteName={setDeliveryNoteName}
                savedDeliveryNotes={savedDeliveryNotes}
                onHandleDeliveryNoteChange={handleDeliveryNoteChange}
                onHandleItemChange={handleItemChange}
                onHandleAddItem={handleAddItem}
                onHandleRemoveItem={handleRemoveItem}
                onHandleSaveDeliveryNote={handleSaveDeliveryNote}
                onHandleLoadDeliveryNote={handleLoadDeliveryNote}
                onHandlePrintDeliveryNote={handlePrintDeliveryNote}
                calculateTotals={calculateTotals}
                setActiveTab={setActiveTab}
              />
            ) : (
              <TemplateCustomizeView 
                currentTemplate={currentTemplate}
                viewingTemplate={viewingTemplate}
                onSaveTemplate={() => {
                  console.log("Saving template");
                  setActiveTab("manage");
                }}
                onPrintPreview={handlePrintPreview}
                setActiveTab={setActiveTab}
              />
            )}
          </CardContent>
        </Card>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileImport}
          accept=".json"
          className="hidden" 
        />
      </main>
    </div>
  );
};

// Sub-components for better organization
const TemplateManagementView = ({ 
  templates, 
  onView, 
  onPrint, 
  onDownload,
  getTemplateIcon
}: { 
  templates: Template[]; 
  onView: (id: string) => void;
  onPrint: (id: string) => void;
  onDownload: (id: string) => void;
  getTemplateIcon: (type: string) => JSX.Element;
}) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template) => (
        <Card key={template.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="mt-1">
                {getTemplateIcon(template.type)}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{template.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {template.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => onView(template.id)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => onPrint(template.id)}
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => onDownload(template.id)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

const DeliveryNotePreview = ({ 
  deliveryNoteData,
  deliveryNoteName,
  setDeliveryNoteName,
  savedDeliveryNotes,
  onHandleDeliveryNoteChange,
  onHandleItemChange,
  onHandleAddItem,
  onHandleRemoveItem,
  onHandleSaveDeliveryNote,
  onHandleLoadDeliveryNote,
  onHandlePrintDeliveryNote,
  calculateTotals,
  setActiveTab
}: { 
  deliveryNoteData: DeliveryNoteData;
  deliveryNoteName: string;
  setDeliveryNoteName: (name: string) => void;
  savedDeliveryNotes: SavedDeliveryNote[];
  onHandleDeliveryNoteChange: (field: keyof DeliveryNoteData, value: string | number) => void;
  onHandleItemChange: (itemId: string, field: keyof DeliveryNoteItem, value: string | number) => void;
  onHandleAddItem: () => void;
  onHandleRemoveItem: (itemId: string) => void;
  onHandleSaveDeliveryNote: () => void;
  onHandleLoadDeliveryNote: (id: string) => void;
  onHandlePrintDeliveryNote: () => void;
  calculateTotals: () => { totalItems: number; totalQuantity: number; totalPackages: number };
  setActiveTab: (tab: "manage" | "customize" | "preview") => void;
}) => {
  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Delivery Note Preview</h3>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Delivery Note Name"
            value={deliveryNoteName}
            onChange={(e) => setDeliveryNoteName(e.target.value)}
            className="w-48 h-10"
          />
          <Button onClick={onHandleSaveDeliveryNote}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button variant="outline" onClick={() => setActiveTab("manage")}>
            Back to Templates
          </Button>
          <Button onClick={onHandlePrintDeliveryNote}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>
      
      {/* Saved delivery notes section */}
      {savedDeliveryNotes.length > 0 && (
        <div className="border rounded-lg p-4">
          <h4 className="font-bold mb-2">Saved Delivery Notes:</h4>
          <div className="flex flex-wrap gap-2">
            {savedDeliveryNotes.map((note) => (
              <div key={note.id} className="flex items-center gap-2 bg-gray-100 rounded p-2">
                <span className="text-sm">{note.name}</span>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => onHandleLoadDeliveryNote(note.id)}
                  className="h-6 px-2"
                >
                  Load
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="border rounded-lg p-6 max-w-4xl mx-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-2xl font-bold">DELIVERY NOTE</h2>
          </div>
          
          {/* Business Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-lg">
                <Input 
                  value={deliveryNoteData.businessName}
                  onChange={(e) => onHandleDeliveryNoteChange("businessName", e.target.value)}
                  className="w-full h-8 p-1 text-lg font-bold"
                />
              </h3>
              <div className="mt-2">
                <Textarea 
                  value={deliveryNoteData.businessAddress}
                  onChange={(e) => onHandleDeliveryNoteChange("businessAddress", e.target.value)}
                  className="w-full h-16 p-1 text-sm resize-none"
                  placeholder="Business Address"
                />
              </div>
              <div className="flex items-center gap-2 text-sm mt-1">
                <span>Phone:</span>
                <Input 
                  value={deliveryNoteData.businessPhone}
                  onChange={(e) => onHandleDeliveryNoteChange("businessPhone", e.target.value)}
                  className="w-auto h-6 p-1 text-sm"
                />
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span>Email:</span>
                <Input 
                  value={deliveryNoteData.businessEmail}
                  onChange={(e) => onHandleDeliveryNoteChange("businessEmail", e.target.value)}
                  className="w-auto h-6 p-1 text-sm"
                />
              </div>
            </div>
            
            <div>
              <h4 className="font-bold">TO:</h4>
              <Input 
                value={deliveryNoteData.customerName}
                onChange={(e) => onHandleDeliveryNoteChange("customerName", e.target.value)}
                className="w-full h-6 p-1 text-sm mb-1"
              />
              <Input 
                value={deliveryNoteData.customerAddress1}
                onChange={(e) => onHandleDeliveryNoteChange("customerAddress1", e.target.value)}
                className="w-full h-6 p-1 text-sm mb-1"
              />
              <Input 
                value={deliveryNoteData.customerAddress2}
                onChange={(e) => onHandleDeliveryNoteChange("customerAddress2", e.target.value)}
                className="w-full h-6 p-1 text-sm mb-1"
              />
              <div className="flex items-center gap-2 text-sm mt-1">
                <span>Phone:</span>
                <Input 
                  value={deliveryNoteData.customerPhone}
                  onChange={(e) => onHandleDeliveryNoteChange("customerPhone", e.target.value)}
                  className="w-auto h-6 p-1 text-sm"
                />
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span>Email:</span>
                <Input 
                  value={deliveryNoteData.customerEmail}
                  onChange={(e) => onHandleDeliveryNoteChange("customerEmail", e.target.value)}
                  className="w-auto h-6 p-1 text-sm"
                />
              </div>
            </div>
          </div>
          
          {/* Delivery Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Delivery Note #:</label>
              <Input 
                value={deliveryNoteData.deliveryNoteNumber}
                onChange={(e) => onHandleDeliveryNoteChange("deliveryNoteNumber", e.target.value)}
                className="w-full h-8 p-1 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Date:</label>
              <Input 
                value={deliveryNoteData.date}
                onChange={(e) => onHandleDeliveryNoteChange("date", e.target.value)}
                className="w-full h-8 p-1 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Delivery Date:</label>
              <Input 
                value={deliveryNoteData.deliveryDate}
                onChange={(e) => onHandleDeliveryNoteChange("deliveryDate", e.target.value)}
                className="w-full h-8 p-1 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Vehicle #:</label>
              <Input 
                value={deliveryNoteData.vehicle}
                onChange={(e) => onHandleDeliveryNoteChange("vehicle", e.target.value)}
                className="w-full h-8 p-1 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Driver:</label>
              <Input 
                value={deliveryNoteData.driver}
                onChange={(e) => onHandleDeliveryNoteChange("driver", e.target.value)}
                className="w-full h-8 p-1 text-sm"
              />
            </div>
          </div>
          
          {/* Items Table */}
          <div>
            <h4 className="font-bold mb-2">ITEMS DELIVERED:</h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-2 text-left">Item Description</th>
                    <th className="border border-gray-300 p-2 text-left">Quantity</th>
                    <th className="border border-gray-300 p-2 text-left">Unit</th>
                    <th className="border border-gray-300 p-2 text-left">Delivered</th>
                    <th className="border border-gray-300 p-2 text-left">Remarks</th>
                    <th className="border border-gray-300 p-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveryNoteData.items.map((item) => (
                    <tr key={item.id}>
                      <td className="border border-gray-300 p-2">
                        <Input 
                          value={item.description}
                          onChange={(e) => onHandleItemChange(item.id, "description", e.target.value)}
                          className="w-full h-6 p-1 text-sm"
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <Input 
                          type="number"
                          value={item.quantity}
                          onChange={(e) => onHandleItemChange(item.id, "quantity", parseInt(e.target.value) || 0)}
                          className="w-full h-6 p-1 text-sm"
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <Input 
                          value={item.unit}
                          onChange={(e) => onHandleItemChange(item.id, "unit", e.target.value)}
                          className="w-full h-6 p-1 text-sm"
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <Input 
                          type="number"
                          value={item.delivered}
                          onChange={(e) => onHandleItemChange(item.id, "delivered", parseInt(e.target.value) || 0)}
                          className="w-full h-6 p-1 text-sm"
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <Input 
                          value={item.remarks}
                          onChange={(e) => onHandleItemChange(item.id, "remarks", e.target.value)}
                          className="w-full h-6 p-1 text-sm"
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <Button 
                          onClick={() => onHandleRemoveItem(item.id)}
                          variant="outline"
                          size="sm"
                          className="h-6 w-6 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex gap-2 mt-2">
              <Button 
                onClick={onHandleAddItem}
                variant="outline"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>
          </div>
          
          {/* Delivery Notes */}
          <div>
            <h4 className="font-bold mb-2">DELIVERY NOTES:</h4>
            <Textarea 
              value={deliveryNoteData.deliveryNotes}
              onChange={(e) => onHandleDeliveryNoteChange("deliveryNotes", e.target.value)}
              className="w-full min-h-[80px] text-sm"
            />
          </div>
          
          {/* Totals */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-sm">
              <span className="font-bold">Total Items:</span> {totals.totalItems}
            </div>
            <div className="text-sm">
              <span className="font-bold">Total Quantity:</span> {totals.totalQuantity} units
            </div>
            <div className="text-sm">
              <span className="font-bold">Total Packages:</span> {totals.totalPackages}
            </div>
          </div>
          
          {/* Signatures */}
          {/* Payment Details */}
          <div className="border-t pt-4">
            <h4 className="font-bold mb-2">Payment Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Paid Amount:</label>
                <Input 
                  type="number"
                  value={deliveryNoteData.paidAmount}
                  onChange={(e) => onHandleDeliveryNoteChange("paidAmount", parseFloat(e.target.value) || 0)}
                  className="w-full h-8 p-1 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Approval */}
          <div className="border-t pt-4">
            <h4 className="font-bold mb-2">Approval</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Name:</label>
                <Input 
                  value={deliveryNoteData.approvalName}
                  onChange={(e) => onHandleDeliveryNoteChange("approvalName", e.target.value)}
                  className="w-full h-8 p-1 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Date:</label>
                <Input 
                  value={deliveryNoteData.approvalDate}
                  onChange={(e) => onHandleDeliveryNoteChange("approvalDate", e.target.value)}
                  className="w-full h-8 p-1 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div>
              <h4 className="font-bold mb-2">Prepared By</h4>
              <div className="text-sm space-y-2">
                <div>
                  <span>Name:</span>
                  <Input 
                    value={deliveryNoteData.preparedByName}
                    onChange={(e) => onHandleDeliveryNoteChange("preparedByName", e.target.value)}
                    className="w-full h-6 p-1 text-sm mt-1"
                  />
                </div>
                <div>
                  <span>Date:</span>
                  <Input 
                    value={deliveryNoteData.preparedByDate}
                    onChange={(e) => onHandleDeliveryNoteChange("preparedByDate", e.target.value)}
                    className="w-full h-6 p-1 text-sm mt-1"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-2">Driver Signature</h4>
              <div className="text-sm space-y-2">
                <div>
                  <span>Name:</span>
                  <Input 
                    value={deliveryNoteData.driverName}
                    onChange={(e) => onHandleDeliveryNoteChange("driverName", e.target.value)}
                    className="w-full h-6 p-1 text-sm mt-1"
                  />
                </div>
                <div>
                  <span>Date:</span>
                  <Input 
                    value={deliveryNoteData.driverDate}
                    onChange={(e) => onHandleDeliveryNoteChange("driverDate", e.target.value)}
                    className="w-full h-6 p-1 text-sm mt-1"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-2">Received By</h4>
              <div className="text-sm space-y-2">
                <div>
                  <span>Name:</span>
                  <Input 
                    value={deliveryNoteData.receivedByName}
                    onChange={(e) => onHandleDeliveryNoteChange("receivedByName", e.target.value)}
                    className="w-full h-6 p-1 text-sm mt-1"
                  />
                </div>
                <div>
                  <span>Date:</span>
                  <Input 
                    value={deliveryNoteData.receivedByDate}
                    onChange={(e) => onHandleDeliveryNoteChange("receivedByDate", e.target.value)}
                    className="w-full h-6 p-1 text-sm mt-1"
                  />
                </div>
                <div className="text-xs mt-2">(Signature Required)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TemplateCustomizeView = ({ 
  currentTemplate,
  viewingTemplate,
  onSaveTemplate,
  onPrintPreview,
  setActiveTab
}: { 
  currentTemplate: Template;
  viewingTemplate: string | null;
  onSaveTemplate: () => void;
  onPrintPreview: (id: string) => void;
  setActiveTab: (tab: "manage" | "customize" | "preview") => void;
}) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-medium">
        {viewingTemplate 
          ? `Viewing Template #${viewingTemplate}`
          : `Editing Template #${currentTemplate.id}`}
      </h3>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => onPrintPreview(currentTemplate.id)}>
          <Printer className="h-4 w-4 mr-2" />
          Preview
        </Button>
        {!viewingTemplate && (
          <Button onClick={onSaveTemplate}>
            <Save className="h-4 w-4 mr-2" />
            Save Template
          </Button>
        )}
      </div>
    </div>
    
    <div className="border rounded-lg p-6">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="templateName" className="text-sm font-medium">Template Name</label>
            <input 
              id="templateName" 
              defaultValue={currentTemplate.name}
              disabled={!!viewingTemplate}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="templateType" className="text-sm font-medium">Template Type</label>
            <select
              id="templateType"
              defaultValue={currentTemplate.type}
              disabled={!!viewingTemplate}
              className="w-full p-2 border rounded-md"
            >
              <option value="delivery-note">Delivery Note</option>
              <option value="order-form">Order Form</option>
              <option value="contract">Contract</option>
              <option value="invoice">Invoice</option>
              <option value="receipt">Receipt</option>
              <option value="notice">Notice</option>
              <option value="quotation">Quotation</option>
              <option value="report">Report</option>
              <option value="salary-slip">Salary Slip</option>
              <option value="complimentary-goods">Complimentary Goods</option>
              <option value="expense-voucher">Expense Voucher</option>
            </select>
          </div>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="templateDescription" className="text-sm font-medium">Description</label>
          <textarea 
            id="templateDescription" 
            defaultValue={currentTemplate.description}
            disabled={!!viewingTemplate}
            className="w-full p-2 border rounded-md"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Template Content</label>
          <textarea 
            rows={15}
            placeholder="Template content with placeholders..."
            defaultValue={currentTemplate.content}
            disabled={!!viewingTemplate}
            className="w-full p-2 border rounded-md"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <input 
            type="checkbox" 
            id="isActive" 
            defaultChecked={currentTemplate.isActive}
            disabled={!!viewingTemplate}
          />
          <label htmlFor="isActive" className="text-sm">Set as Active Template</label>
        </div>
      </div>
    </div>
    
    <div className="flex justify-end gap-2">
      <Button 
        variant="outline" 
        onClick={() => {
          setActiveTab("manage");
        }}
      >
        Back to Templates
      </Button>
      {!viewingTemplate && (
        <Button onClick={onSaveTemplate}>
          <Save className="h-4 w-4 mr-2" />
          Save Template
        </Button>
      )}
    </div>
  </div>
);