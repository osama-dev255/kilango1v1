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
import { formatCurrency } from "@/lib/currency";
import { Template, DeliveryNoteItem, DeliveryNoteData,
  DeliveryNoteTemplate,
  OrderFormTemplate,
  ContractTemplate,
  InvoiceTemplate,
  ReceiptTemplate,
  NoticeTemplate,
  QuotationTemplate,
  ReportTemplate,
  SalarySlipTemplate,
  ComplimentaryGoodsTemplate,
  ExpenseVoucherTemplate,
  EditableInvoiceTemplate
} from "@/templates";
import { saveDeliveryNote, getProducts, Product } from "@/services/databaseService";

// Interfaces are now imported from @/templates

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

export const Templates = ({ onBack }: TemplatesProps) => {
  const [activeTab, setActiveTab] = useState<"manage" | "customize" | "preview">("manage");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [viewingTemplate, setViewingTemplate] = useState<string | null>(null);

  const [templates, setTemplates] = useState<Template[]>([
    DeliveryNoteTemplate,
    OrderFormTemplate,
    ContractTemplate,
    InvoiceTemplate,
    ReceiptTemplate,
    NoticeTemplate,
    QuotationTemplate,
    ReportTemplate,
    SalarySlipTemplate,
    ComplimentaryGoodsTemplate,
    ExpenseVoucherTemplate
  ]);
  
  const [deliveryNoteData, setDeliveryNoteData] = useState<DeliveryNoteData>({
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
    date: "11/30/2025",
    deliveryDate: "",
    vehicle: "",
    driver: "",
    items: [
      { id: "1", description: "Sample Product 1", quantity: 10, unit: "pcs", delivered: 10, remarks: "Good condition" },
      { id: "2", description: "Sample Product 2", quantity: 5, unit: "boxes", delivered: 5, remarks: "Fragile" },
      { id: "3", description: "Sample Product 3", quantity: 2, unit: "units", delivered: 2, remarks: "" }
    ],
    deliveryNotes: "Please handle with care. Fragile items included.\nSignature required upon delivery.",
    totalItems: 3,
    totalQuantity: 17,
    totalPackages: 3,
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
    approvalDate: "",
    // Timestamp
    timestamp: new Date().toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
  });
  
  const [savedDeliveryNotes, setSavedDeliveryNotes] = useState<SavedDeliveryNote[]>(() => {
    const saved = localStorage.getItem('savedDeliveryNotes');
    return saved ? JSON.parse(saved) : [];
  });
  
  // State for inventory products
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);

  // Effect to update savedDeliveryNotes when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('savedDeliveryNotes');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setSavedDeliveryNotes(parsed);
        } catch (e) {
          console.error('Error parsing saved delivery notes:', e);
        }
      }
    };

    // Add event listener for storage changes
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Load products from inventory
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productsData = await getProducts();
        setProducts(productsData || []);
        setFilteredProducts(productsData || []);
      } catch (error) {
        console.error('Failed to load products:', error);
      }
    };
    
    loadProducts();
  }, []);

  const [deliveryNoteName, setDeliveryNoteName] = useState<string>("");
  
  // Get the next delivery note number from localStorage
  const getNextDeliveryNoteNumber = () => {
    const lastNumber = localStorage.getItem('lastDeliveryNoteNumber');
    const today = new Date();
    const dateStr = `${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}`;
    
    let nextNumber = 1;
    if (lastNumber) {
      const [lastDate, lastSeq] = lastNumber.split('-');
      if (lastDate === dateStr) {
        nextNumber = parseInt(lastSeq) + 1;
      }
    }
    
    const newNumber = `${dateStr}-${nextNumber.toString().padStart(3, '0')}`;
    localStorage.setItem('lastDeliveryNoteNumber', newNumber);
    return `DN-${newNumber}`;
  };
  
  // Generate delivery note number automatically
  useEffect(() => {
    if (activeTab === "preview" && !deliveryNoteName) {
      const deliveryNoteNumber = getNextDeliveryNoteNumber();
      setDeliveryNoteName(deliveryNoteNumber);
      
      // Also update the delivery note number in the data
      setDeliveryNoteData(prev => ({
        ...prev,
        deliveryNoteNumber: deliveryNoteNumber
      }));
    }
  }, [activeTab, deliveryNoteName]);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
    } else if (template && template.type === "invoice") {
      // For invoice templates, go to the invoice preview view
      setSelectedTemplate(templateId);
      setActiveTab("invoice-preview");
    } else if (template && template.type === "order-form") {
      // For order form templates, go to the order form preview view
      setSelectedTemplate(templateId);
      setActiveTab("order-form-preview");
    } else if (template && template.type === "contract") {
      // For contract templates, go to the contract preview view
      setSelectedTemplate(templateId);
      setActiveTab("contract-preview");
    } else if (template && template.type === "quotation") {
      // For quotation templates, go to the quotation preview view
      setSelectedTemplate(templateId);
      setActiveTab("quotation-preview");
    } else if (template && template.type === "receipt") {
      // For receipt templates, go to the receipt preview view
      setSelectedTemplate(templateId);
      setActiveTab("receipt-preview");
    } else if (template && template.type === "notice") {
      // For notice templates, go to the notice preview view
      setSelectedTemplate(templateId);
      setActiveTab("notice-preview");
    } else if (template && template.type === "report") {
      // For report templates, go to the report preview view
      setSelectedTemplate(templateId);
      setActiveTab("report-preview");
    } else if (template && template.type === "salary-slip") {
      // For salary slip templates, go to the salary slip preview view
      setSelectedTemplate(templateId);
      setActiveTab("salary-slip-preview");
    } else if (template && template.type === "complimentary-goods") {
      // For complimentary goods templates, go to the complimentary goods preview view
      setSelectedTemplate(templateId);
      setActiveTab("complimentary-goods-preview");
    } else if (template && template.type === "expense-voucher") {
      // For expense voucher templates, go to the expense voucher preview view
      setSelectedTemplate(templateId);
      setActiveTab("expense-voucher-preview");
    } else {
      // For other templates, go to customization view
      setSelectedTemplate(templateId);
      setActiveTab("customize");
    }
  };

  const handleSaveTemplate = () => {
    // Save template logic would go here
    console.log("Saving template:", selectedTemplate);
    // Reset after save
    setSelectedTemplate(null);
    setViewingTemplate(null);
    setActiveTab("manage");
  };
  
  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId));
  };
  
  const handleDuplicateTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      const newTemplate = {
        ...template,
        id: Date.now().toString(),
        name: `${template.name} (Copy)`,
        lastModified: new Date().toISOString().split('T')[0]
      };
      setTemplates(prev => [...prev, newTemplate]);
    }
  };
  
  const handleSetActiveTemplate = (templateId: string) => {
    setTemplates(prev => prev.map(t => ({
      ...t,
      isActive: t.id === templateId
    })));
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
          const newTemplate = {
            ...templateData,
            id: Date.now().toString(),
            lastModified: new Date().toISOString().split('T')[0]
          };
          setTemplates(prev => [...prev, newTemplate]);
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
        receiptNumber: template.type === "invoice" ? "INV-2023-001" : "RCT-2023-001",
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
      
      // Print using the appropriate PrintUtils based on template type
      if (template.type === "invoice") {
        PrintUtils.printInvoice(mockTransaction);
      } else if (template.type === "receipt") {
        PrintUtils.printReceipt(mockTransaction);
      } else {
        // For other template types, we could add specific handling
        // For now, default to receipt printing
        PrintUtils.printReceipt(mockTransaction);
      }
    }
  };

  // Handle delivery note data changes
  const handleDeliveryNoteChange = (field: keyof DeliveryNoteData, value: string | number) => {
    setDeliveryNoteData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle item changes
  const handleItemChange = (itemId: string, field: keyof DeliveryNoteItem, value: string | number) => {
    setDeliveryNoteData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId ? { ...item, [field]: value } : item
      )
    }));
  };

  // Add new item
  // Handle product search (only by name, like sales terminal)
  const handleProductSearch = (search: string, index: number) => {
    setSearchTerm(search);
    setActiveItemIndex(index);
    
    if (search.trim() === '') {
      setFilteredProducts(products);
      setShowProductDropdown(true);
      return;
    }
    
    const filtered = products.filter(product => 
      (product.name && product.name.toLowerCase().includes(search.toLowerCase()))
    );
    
    setFilteredProducts(filtered);
    setShowProductDropdown(true);
  };

  // Handle product selection
  const handleProductSelect = (product: Product, index: number) => {
    setDeliveryNoteData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index 
          ? { 
              ...item, 
              description: product.name,
              unit: product.unit_of_measure || "",
              quantity: item.quantity || 1,
              delivered: item.delivered || 1
            } 
          : item
      )
    }));
    
    setSearchTerm('');
    setShowProductDropdown(false);
    setActiveItemIndex(null);
  };

  // Add new item
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

  // Remove item
  const handleRemoveItem = (itemId: string) => {
    setDeliveryNoteData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  // Calculate totals
  const calculateTotals = () => {
    const totalItems = deliveryNoteData.items.length;
    const totalQuantity = deliveryNoteData.items.reduce((sum, item) => sum + Number(item.delivered || 0), 0);
    const totalPackages = deliveryNoteData.items.reduce((count, item) => 
      item.unit && item.delivered ? count + 1 : count, 0
    );
    
    return { totalItems, totalQuantity, totalPackages };
  };

  // Save delivery note to localStorage
  const [showActionButtons, setShowActionButtons] = useState(false);
  const [savedNoteName, setSavedNoteName] = useState("");

  const handleSaveDeliveryNote = async () => {
    if (!deliveryNoteName.trim()) {
      const deliveryNoteNumber = getNextDeliveryNoteNumber();
      setDeliveryNoteName(deliveryNoteNumber);
      
      // Also update the delivery note number in the data
      setDeliveryNoteData(prev => ({
        ...prev,
        deliveryNoteNumber: deliveryNoteNumber
      }));
    }
    
    // Update timestamp before saving
    const currentTime = new Date().toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    setDeliveryNoteData(prev => ({
      ...prev,
      timestamp: currentTime
    }));
    
    const newSavedNote: SavedDeliveryNote = {
      id: Date.now().toString(),
      name: deliveryNoteName || getNextDeliveryNoteNumber(),
      data: {
        ...deliveryNoteData,
        timestamp: currentTime
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const updatedNotes = [...savedDeliveryNotes, newSavedNote];
    setSavedDeliveryNotes(updatedNotes);
    localStorage.setItem('savedDeliveryNotes', JSON.stringify(updatedNotes));
    
    // Save to Supabase
    try {
      console.log('Attempting to save delivery note to Supabase...', {
        name: newSavedNote.name,
        data: newSavedNote.data
      });
      
      const result = await saveDeliveryNote(newSavedNote.name, newSavedNote.data);
      console.log('Supabase save result:', result);
      
      if (result.success) {
        console.log('Delivery note saved to Supabase successfully');
      } else {
        console.error('Failed to save delivery note to Supabase:', result.error);
        alert(`Delivery note saved locally but failed to save to cloud: ${result.error}`);
      }
    } catch (error) {
      console.error('Error saving delivery note to Supabase:', error);
      alert(`Delivery note saved locally but failed to save to cloud: ${error}`);
    }
    
    // Show success message
    alert(`Delivery note "${newSavedNote.name}" saved successfully!`);
    
    // Set state to show action buttons
    setSavedNoteName(newSavedNote.name);
    setShowActionButtons(true);
    
    // Generate next number for the next delivery note
    setTimeout(() => {
      const nextDeliveryNoteNumber = getNextDeliveryNoteNumber();
      setDeliveryNoteName(nextDeliveryNoteNumber);
      
      // Also update the delivery note number and timestamp in the data
      setDeliveryNoteData(prev => ({
        ...prev,
        deliveryNoteNumber: nextDeliveryNoteNumber,
        timestamp: new Date().toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
      }));
    }, 100);
  };

  const handleActionComplete = () => {
    setShowActionButtons(false);
    setSavedNoteName("");
  };

  const handleShareDeliveryNote = async () => {
    // First, try to generate and share a PDF
    try {
      // Create HTML content for the PDF (similar to download)
      const totals = calculateTotals();
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Delivery Note ${deliveryNoteData.deliveryNoteNumber}</title>
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
              <p class="font-bold">Time:</p>
              <p>${deliveryNoteData.timestamp || '_________'}</p>
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
        </body>
        </html>
      `;
      
      // Convert HTML to PDF using browser print functionality
      // For now, we'll share the HTML content as a file
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const file = new File([blob], `Delivery_Note_${deliveryNoteData.deliveryNoteNumber}.html`, { type: 'text/html' });
      
      // Try Web Share API with file
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        const shareData = {
          title: `Delivery Note ${deliveryNoteData.deliveryNoteNumber}`,
          text: `Delivery Note for ${deliveryNoteData.customerName}`,
          files: [file]
        };
        
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard and show email link
        const emailBody = encodeURIComponent(
          `Delivery Note: ${deliveryNoteData.deliveryNoteNumber}\n\n` +
          `Business: ${deliveryNoteData.businessName}\n` +
          `Customer: ${deliveryNoteData.customerName}\n` +
          `Date: ${deliveryNoteData.date}\n\n` +
          `Items:\n` +
          deliveryNoteData.items.map(item => 
            `- ${item.description}: ${item.delivered} ${item.unit}`
          ).join('\n') +
          `\n\nTotal Items: ${deliveryNoteData.items.length}\n` +
          `Total Quantity: ${deliveryNoteData.items.reduce((sum, item) => sum + Number(item.delivered || 0), 0)} units\n\n` +
          `Please find the attached delivery note.`
        );
        
        const mailtoLink = `mailto:?subject=Delivery Note ${deliveryNoteData.deliveryNoteNumber}&body=${emailBody}`;
        
        // Copy to clipboard
        navigator.clipboard.writeText(
          `Delivery Note: ${deliveryNoteData.deliveryNoteNumber}\n` +
          `Business: ${deliveryNoteData.businessName}\n` +
          `Customer: ${deliveryNoteData.customerName}\n` +
          `Date: ${deliveryNoteData.date}`
        ).then(() => {
          // Open email client
          window.open(mailtoLink, '_blank');
        }).catch(() => {
          // Fallback if clipboard fails
          window.open(mailtoLink, '_blank');
        });
      }
    } catch (error) {
      console.error('Error sharing delivery note:', error);
      // Fallback to text sharing
      const shareData = {
        title: `Delivery Note ${deliveryNoteData.deliveryNoteNumber}`,
        text: `Delivery Note for ${deliveryNoteData.customerName}\n\n` +
              `Items: ${deliveryNoteData.items.length}\n` +
              `Total Quantity: ${deliveryNoteData.items.reduce((sum, item) => sum + Number(item.delivered || 0), 0)} units\n` +
              `Date: ${deliveryNoteData.date}\n\n` +
              `View full details in the Advance POS system.`,
        url: window.location.href
      };
      
      // Try Web Share API first
      if (navigator.share) {
        navigator.share(shareData).catch(console.error);
      } else {
        // Final fallback: copy to clipboard and show email link
        const emailBody = encodeURIComponent(
          `Delivery Note: ${deliveryNoteData.deliveryNoteNumber}\n\n` +
          `Business: ${deliveryNoteData.businessName}\n` +
          `Customer: ${deliveryNoteData.customerName}\n` +
          `Date: ${deliveryNoteData.date}\n\n` +
          `Items:\n` +
          deliveryNoteData.items.map(item => 
            `- ${item.description}: ${item.delivered} ${item.unit}`
          ).join('\n') +
          `\n\nTotal Items: ${deliveryNoteData.items.length}\n` +
          `Total Quantity: ${deliveryNoteData.items.reduce((sum, item) => sum + Number(item.delivered || 0), 0)} units`
        );
        
        const mailtoLink = `mailto:?subject=Delivery Note ${deliveryNoteData.deliveryNoteNumber}&body=${emailBody}`;
        
        // Copy to clipboard
        navigator.clipboard.writeText(
          `Delivery Note: ${deliveryNoteData.deliveryNoteNumber}\n` +
          `Business: ${deliveryNoteData.businessName}\n` +
          `Customer: ${deliveryNoteData.customerName}\n` +
          `Date: ${deliveryNoteData.date}`
        ).then(() => {
          // Open email client
          window.open(mailtoLink, '_blank');
        }).catch(() => {
          // Fallback if clipboard fails
          window.open(mailtoLink, '_blank');
        });
      }
    }
  };

  // Load a saved delivery note
  const handleLoadDeliveryNote = (noteId: string) => {
    const note = savedDeliveryNotes.find(n => n.id === noteId);
    if (note) {
      setDeliveryNoteData(note.data);
      setDeliveryNoteName(note.name);
      setActiveTab("preview"); // Switch to preview tab to show the loaded data
      alert(`Delivery note "${note.name}" loaded successfully!`);
    }
  };

  // View a saved delivery note in a new window/tab
  const handleViewDeliveryNote = (noteId: string) => {
    const note = savedDeliveryNotes.find(n => n.id === noteId);
    if (note) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        // Calculate totals for the viewed note
        const viewedData = note.data;
        const totalItems = viewedData.items.length;
        const totalQuantity = viewedData.items.reduce((sum, item) => sum + Number(item.delivered || 0), 0);
        const totalPackages = viewedData.items.reduce((count, item) => 
          item.unit && item.delivered ? count + 1 : count, 0
        );
        
        const printContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Delivery Note - ${note.name}</title>
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
              }
              th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
              }
              th {
                background-color: #f2f2f2;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>DELIVERY NOTE</h1>
            </div>
            
            <div class="grid">
              <div>
                <h3 class="font-bold text-lg">${viewedData.businessName}</h3>
                <p>${viewedData.businessAddress}</p>
                <p>Phone: ${viewedData.businessPhone}</p>
                <p>Email: ${viewedData.businessEmail}</p>
              </div>
              
              <div>
                <h3 class="font-bold">TO:</h3>
                <p>${viewedData.customerName}</p>
                <p>${viewedData.customerAddress1}</p>
                <p>${viewedData.customerAddress2}</p>
                <p>Phone: ${viewedData.customerPhone}</p>
                <p>Email: ${viewedData.customerEmail}</p>
              </div>
            </div>
            
            <div class="grid-4">
              <div>
                <p class="font-bold">Delivery Note #:</p>
                <p>${viewedData.deliveryNoteNumber}</p>
              </div>
              <div>
                <p class="font-bold">Date:</p>
                <p>${viewedData.date}</p>
              </div>
              <div>
                <p class="font-bold">Delivery Date:</p>
                <p>${viewedData.deliveryDate || '_________'}</p>
              </div>
              <div>
                <p class="font-bold">Time:</p>
                <p>${viewedData.timestamp || '_________'}</p>
              </div>
              <div>
                <p class="font-bold">Vehicle #:</p>
                <p>${viewedData.vehicle || '_________'}</p>
              </div>
              <div>
                <p class="font-bold">Driver:</p>
                <p>${viewedData.driver || '_________'}</p>
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
                  ${viewedData.items.map(item => `
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
              <p>${viewedData.deliveryNotes}</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span class="font-bold">Total Items:</span> ${totalItems}
              </div>
              <div>
                <span class="font-bold">Total Quantity:</span> ${totalQuantity} units
              </div>
              <div>
                <span class="font-bold">Total Packages:</span> ${totalPackages}
              </div>
            </div>
            
            <div class="signatures">
              <div>
                <h4 class="font-bold mb-2">Prepared By</h4>
                <p>Name: ${viewedData.preparedByName || '_________'}</p>
                <p>Date: ${viewedData.preparedByDate || '_________'}</p>
                <p class="mt-8">Signature: _________________</p>
              </div>
              
              <div>
                <h4 class="font-bold mb-2">Driver Signature</h4>
                <p>Name: ${viewedData.driverName || '_________'}</p>
                <p>Date: ${viewedData.driverDate || '_________'}</p>
                <p class="mt-8">Signature: _________________</p>
              </div>
              
              <div>
                <h4 class="font-bold mb-2">Received By</h4>
                <p>Name: ${viewedData.receivedByName || '_________'}</p>
                <p>Date: ${viewedData.receivedByDate || '_________'}</p>
                <p class="mt-8">Signature: _________________</p>
                <p class="text-xs mt-2">(Signature Required)</p>
              </div>
            </div>
          </body>
          </html>
        `;
        
        printWindow.document.write(printContent);
        printWindow.document.close();
      }
    }
  };

  // Delete a saved delivery note
  const handleDeleteSavedNote = (noteId: string) => {
    const updatedNotes = savedDeliveryNotes.filter(n => n.id !== noteId);
    setSavedDeliveryNotes(updatedNotes);
    localStorage.setItem('savedDeliveryNotes', JSON.stringify(updatedNotes));
    alert("Saved delivery note deleted successfully!");
  };

  // Print delivery note
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
              <p class="font-bold">Time:</p>
              <p>${deliveryNoteData.timestamp || '_________'}</p>
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

  // Download delivery note as PDF
  const handleDownloadDeliveryNote = () => {
    const totals = calculateTotals();
    
    // Create HTML content for the PDF
    const htmlContent = `
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
      </body>
      </html>
    `;

    // Create a Blob with the HTML content
    const blob = new Blob([htmlContent], { type: 'text/html' });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Delivery_Note_${deliveryNoteData.deliveryNoteNumber}.html`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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

  const totals = calculateTotals();

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
                : activeTab === "preview" && viewingTemplate
                  ? "Delivery Note Preview"
                  : activeTab === "invoice-preview"
                    ? "Invoice Preview"
                  : activeTab === "order-form-preview"
                    ? "Order Form Preview"
                  : activeTab === "contract-preview"
                    ? "Contract Preview"
                  : activeTab === "quotation-preview"
                    ? "Quotation Preview"
                  : activeTab === "receipt-preview"
                    ? "Receipt Preview"
                  : activeTab === "notice-preview"
                    ? "Notice Preview"
                  : activeTab === "report-preview"
                    ? "Report Preview"
                  : activeTab === "salary-slip-preview"
                    ? "Salary Slip Preview"
                  : activeTab === "complimentary-goods-preview"
                    ? "Complimentary Goods Preview"
                  : activeTab === "expense-voucher-preview"
                    ? "Expense Voucher Preview"
                  : viewingTemplate 
                    ? `Viewing Template: ${currentTemplate?.name || 'Template'}`
                    : selectedTemplate 
                      ? `Editing Template: ${currentTemplate?.name || 'Template'}`
                      : "Template Customization"}
            </CardTitle>
          </CardHeader>
          
          {/* Action Buttons Popup */}
          {showActionButtons && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold mb-4">Delivery Note Saved Successfully!</h3>
                <p className="mb-6">What would you like to do with "{savedNoteName}"?</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button 
                    onClick={() => {
                      handlePrintDeliveryNote();
                      handleActionComplete();
                    }}
                    className="flex-1"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                  <Button 
                    onClick={() => {
                      handleDownloadDeliveryNote();
                      handleActionComplete();
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button 
                    onClick={async () => {
                      await handleShareDeliveryNote();
                      handleActionComplete();
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button 
                    onClick={handleActionComplete}
                    variant="ghost"
                    className="flex-1"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
          <CardContent>
            {activeTab === "manage" ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {templates.map((template) => (
                    <Card 
                      key={template.id} 
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handlePreviewTemplate(template.id)}
                    >
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
                            <div className="mt-4 text-sm text-muted-foreground">
                              Click to customize
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : activeTab === "preview" ? (
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
                    <Button onClick={handleSaveDeliveryNote}>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="outline" onClick={() => setActiveTab("manage")}>
                      Back to Templates
                    </Button>
                  </div>
                </div>
                
                // Saved delivery notes section
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
                            onClick={() => handleViewDeliveryNote(note.id)}
                            className="h-6 px-2"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleLoadDeliveryNote(note.id)}
                            className="h-6 px-2"
                          >
                            Load
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDeleteSavedNote(note.id)}
                            className="h-6 px-2"
                          >
                            <Trash2 className="h-3 w-3" />
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
                            onChange={(e) => handleDeliveryNoteChange("businessName", e.target.value)}
                            className="w-full h-8 p-1 text-lg font-bold"
                          />
                        </h3>
                        <div className="mt-2">
                          <Textarea 
                            value={deliveryNoteData.businessAddress}
                            onChange={(e) => handleDeliveryNoteChange("businessAddress", e.target.value)}
                            className="w-full h-16 p-1 text-sm resize-none"
                            placeholder="Business Address"
                          />
                        </div>
                        <div className="flex items-center gap-2 text-sm mt-1">
                          <span>Phone:</span>
                          <Input 
                            value={deliveryNoteData.businessPhone}
                            onChange={(e) => handleDeliveryNoteChange("businessPhone", e.target.value)}
                            className="w-auto h-6 p-1 text-sm"
                          />
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span>Email:</span>
                          <Input 
                            value={deliveryNoteData.businessEmail}
                            onChange={(e) => handleDeliveryNoteChange("businessEmail", e.target.value)}
                            className="w-auto h-6 p-1 text-sm"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-bold">TO:</h4>
                        <Input 
                          value={deliveryNoteData.customerName}
                          onChange={(e) => handleDeliveryNoteChange("customerName", e.target.value)}
                          className="w-full h-6 p-1 text-sm mb-1"
                        />
                        <Input 
                          value={deliveryNoteData.customerAddress1}
                          onChange={(e) => handleDeliveryNoteChange("customerAddress1", e.target.value)}
                          className="w-full h-6 p-1 text-sm mb-1"
                        />
                        <Input 
                          value={deliveryNoteData.customerAddress2}
                          onChange={(e) => handleDeliveryNoteChange("customerAddress2", e.target.value)}
                          className="w-full h-6 p-1 text-sm mb-1"
                        />
                        <div className="flex items-center gap-2 text-sm mt-1">
                          <span>Phone:</span>
                          <Input 
                            value={deliveryNoteData.customerPhone}
                            onChange={(e) => handleDeliveryNoteChange("customerPhone", e.target.value)}
                            className="w-auto h-6 p-1 text-sm"
                          />
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span>Email:</span>
                          <Input 
                            value={deliveryNoteData.customerEmail}
                            onChange={(e) => handleDeliveryNoteChange("customerEmail", e.target.value)}
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
                          onChange={(e) => handleDeliveryNoteChange("deliveryNoteNumber", e.target.value)}
                          className="w-full h-8 p-1 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Date:</label>
                        <Input 
                          value={deliveryNoteData.date}
                          onChange={(e) => handleDeliveryNoteChange("date", e.target.value)}
                          className="w-full h-8 p-1 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Delivery Date:</label>
                        <Input 
                          value={deliveryNoteData.deliveryDate}
                          onChange={(e) => handleDeliveryNoteChange("deliveryDate", e.target.value)}
                          className="w-full h-8 p-1 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Time:</label>
                        <Input 
                          value={deliveryNoteData.timestamp}
                          readOnly
                          className="w-full h-8 p-1 text-sm bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Vehicle #:</label>
                        <Input 
                          value={deliveryNoteData.vehicle}
                          onChange={(e) => handleDeliveryNoteChange("vehicle", e.target.value)}
                          className="w-full h-8 p-1 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Driver:</label>
                        <Input 
                          value={deliveryNoteData.driver}
                          onChange={(e) => handleDeliveryNoteChange("driver", e.target.value)}
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
                                <td className="border border-gray-300 p-2 relative">
                                  <Input 
                                    value={searchTerm && activeItemIndex === deliveryNoteData.items.indexOf(item) ? searchTerm : item.description}
                                    onChange={(e) => {
                                      const index = deliveryNoteData.items.indexOf(item);
                                      handleProductSearch(e.target.value, index);
                                    }}
                                    onFocus={() => {
                                      const index = deliveryNoteData.items.indexOf(item);
                                      handleProductSearch('', index);
                                    }}
                                    className="w-full h-6 p-1 text-sm"
                                    placeholder="Search products..."
                                  />
                                  {showProductDropdown && activeItemIndex === deliveryNoteData.items.indexOf(item) && (
                                    <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                                      {filteredProducts.map((product, idx) => (
                                        <div 
                                          key={`${product.id}-${idx}`}
                                          className="p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100"
                                          onClick={() => handleProductSelect(product, deliveryNoteData.items.indexOf(item))}
                                        >
                                          <div className="font-medium">{product.name}</div>
                                          <div className="text-sm text-gray-500">{product.description || 'No description'}</div>
                                          <div className="text-xs text-gray-400">Stock: {product.stock_quantity} | Price: {formatCurrency(product.selling_price)}</div>
                                        </div>
                                      ))}
                                      {filteredProducts.length === 0 && (
                                        <div className="p-2 text-gray-500">No products found</div>
                                      )}
                                    </div>
                                  )}
                                </td>
                                <td className="border border-gray-300 p-2">
                                  <Input 
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => handleItemChange(item.id, "quantity", parseInt(e.target.value) || 0)}
                                    className="w-full h-6 p-1 text-sm"
                                  />
                                </td>
                                <td className="border border-gray-300 p-2">
                                  <Input 
                                    value={item.unit}
                                    onChange={(e) => handleItemChange(item.id, "unit", e.target.value)}
                                    className="w-full h-6 p-1 text-sm"
                                  />
                                </td>
                                <td className="border border-gray-300 p-2">
                                  <Input 
                                    type="number"
                                    value={item.delivered}
                                    onChange={(e) => handleItemChange(item.id, "delivered", parseInt(e.target.value) || 0)}
                                    className="w-full h-6 p-1 text-sm"
                                  />
                                </td>
                                <td className="border border-gray-300 p-2">
                                  <Input 
                                    value={item.remarks}
                                    onChange={(e) => handleItemChange(item.id, "remarks", e.target.value)}
                                    className="w-full h-6 p-1 text-sm"
                                  />
                                </td>
                                <td className="border border-gray-300 p-2">
                                  <Button 
                                    onClick={() => handleRemoveItem(item.id)}
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
                          onClick={handleAddItem}
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
                        onChange={(e) => handleDeliveryNoteChange("deliveryNotes", e.target.value)}
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
                    
                    {/* Payment Details */}
                    <div className="border-t pt-4 mt-4">
                      <h4 className="font-bold mb-2">Payment Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Paid Amount:</label>
                          <Input 
                            type="number"
                            value={deliveryNoteData.paidAmount}
                            onChange={(e) => handleDeliveryNoteChange("paidAmount", parseFloat(e.target.value) || 0)}
                            className="w-full h-8 p-1 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Approval */}
                    <div className="border-t pt-4 mt-4">
                      <h4 className="font-bold mb-2">Approval</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Name:</label>
                          <Input 
                            value={deliveryNoteData.approvalName}
                            onChange={(e) => handleDeliveryNoteChange("approvalName", e.target.value)}
                            className="w-full h-8 p-1 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Date:</label>
                          <Input 
                            value={deliveryNoteData.approvalDate}
                            onChange={(e) => handleDeliveryNoteChange("approvalDate", e.target.value)}
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
                              onChange={(e) => handleDeliveryNoteChange("preparedByName", e.target.value)}
                              className="w-full h-6 p-1 text-sm mt-1"
                            />
                          </div>
                          <div>
                            <span>Date:</span>
                            <Input 
                              value={deliveryNoteData.preparedByDate}
                              onChange={(e) => handleDeliveryNoteChange("preparedByDate", e.target.value)}
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
                              onChange={(e) => handleDeliveryNoteChange("driverName", e.target.value)}
                              className="w-full h-6 p-1 text-sm mt-1"
                            />
                          </div>
                          <div>
                            <span>Date:</span>
                            <Input 
                              value={deliveryNoteData.driverDate}
                              onChange={(e) => handleDeliveryNoteChange("driverDate", e.target.value)}
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
                              onChange={(e) => handleDeliveryNoteChange("receivedByName", e.target.value)}
                              className="w-full h-6 p-1 text-sm mt-1"
                            />
                          </div>
                          <div>
                            <span>Date:</span>
                            <Input 
                              value={deliveryNoteData.receivedByDate}
                              onChange={(e) => handleDeliveryNoteChange("receivedByDate", e.target.value)}
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
            ) : activeTab === "invoice-preview" ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Invoice Template</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setActiveTab("manage")}>
                      Back to Templates
                    </Button>
                    <Button onClick={() => {
                      // Print functionality would go here
                      alert('Print functionality would be implemented here');
                    }}>
                      <Printer className="h-4 w-4 mr-2" />
                      Print
                    </Button>
                    <Button onClick={() => {
                      // Download functionality would go here
                      alert('Download functionality would be implemented here');
                    }}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
                
                <EditableInvoiceTemplate />
              </div>
            ) : activeTab === "order-form-preview" ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Order Form Preview</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setActiveTab("manage")}>
                      Back to Templates
                    </Button>
                    <Button onClick={() => handlePrintPreview(currentTemplate?.id || '')}>
                      <Printer className="h-4 w-4 mr-2" />
                      Print
                    </Button>
                    <Button onClick={() => {
                      // Download functionality would go here
                      alert('Download functionality would be implemented here');
                    }}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
                
                <div className="border rounded-lg p-6 max-w-4xl mx-auto bg-white">
                  <div className="space-y-6">
                    <div className="text-center border-b pb-4">
                      <h1 className="text-3xl font-bold text-gray-800">ORDER FORM</h1>
                      <div className="mt-2 text-lg font-semibold">Order #OF-2024-001</div>
                    </div>
                    
                    <div className="pt-4">
                      <div className="text-sm text-gray-600">Date: 12/3/2025</div>
                    </div>
                    
                    <div className="pt-4">
                      <h3 className="font-bold text-gray-700">Customer Information:</h3>
                      <div className="mt-2">
                        <div className="font-semibold">John Smith</div>
                        <div>123 Customer Street, City, State 12345</div>
                        <div>Phone: (555) 123-4567</div>
                      </div>
                    </div>
                    
                    <div className="pt-6">
                      <h3 className="font-bold text-gray-700 mb-3">Items:</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border border-gray-300 px-4 py-2 text-left">Item</th>
                              <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                              <th className="border border-gray-300 px-4 py-2 text-center">Quantity</th>
                              <th className="border border-gray-300 px-4 py-2 text-right">Price</th>
                              <th className="border border-gray-300 px-4 py-2 text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2">PROD-001</td>
                              <td className="border border-gray-300 px-4 py-2">Premium Product</td>
                              <td className="border border-gray-300 px-4 py-2 text-center">2</td>
                              <td className="border border-gray-300 px-4 py-2 text-right">$50.00</td>
                              <td className="border border-gray-300 px-4 py-2 text-right">$100.00</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2">PROD-002</td>
                              <td className="border border-gray-300 px-4 py-2">Standard Product</td>
                              <td className="border border-gray-300 px-4 py-2 text-center">1</td>
                              <td className="border border-gray-300 px-4 py-2 text-right">$30.00</td>
                              <td className="border border-gray-300 px-4 py-2 text-right">$30.00</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                    
                    <div className="pt-6">
                      <div className="grid grid-cols-2 gap-4 max-w-xs ml-auto">
                        <div className="text-right font-medium">Subtotal:</div>
                        <div className="text-right">$130.00</div>
                        
                        <div className="text-right font-medium">Tax:</div>
                        <div className="text-right">$10.40</div>
                        
                        <div className="text-right font-medium">Discount:</div>
                        <div className="text-right">$5.00</div>
                        
                        <div className="text-right font-bold text-lg mt-2">Total:</div>
                        <div className="text-right font-bold text-lg mt-2">$135.40</div>
                      </div>
                    </div>
                    
                    <div className="pt-6">
                      <h3 className="font-bold text-gray-700 mb-2">Special Instructions:</h3>
                      <div className="text-gray-700">Please deliver to back entrance. Contact customer before delivery.</div>
                    </div>
                    
                    <div className="pt-8 text-center border-t">
                      <div className="text-sm text-gray-600">Signature: _________________________</div>
                      <div className="mt-1 text-sm text-gray-600">Date: 12/3/2025</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : activeTab === "contract-preview" ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Contract Preview</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setActiveTab("manage")}>
                      Back to Templates
                    </Button>
                    <Button onClick={() => handlePrintPreview(currentTemplate?.id || '')}>
                      <Printer className="h-4 w-4 mr-2" />
                      Print
                    </Button>
                    <Button onClick={() => {
                      // Download functionality would go here
                      alert('Download functionality would be implemented here');
                    }}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
                
                <div className="border rounded-lg p-6 max-w-4xl mx-auto bg-white">
                  <div className="space-y-6">
                    <div className="text-center border-b pb-4">
                      <h1 className="text-3xl font-bold text-gray-800">CONTRACT AGREEMENT</h1>
                      <div className="mt-2 text-lg font-semibold">Contract #CT-2024-001</div>
                    </div>
                    
                    <div className="pt-4">
                      <div className="text-sm text-gray-600">Date: 12/3/2025</div>
                    </div>
                    
                    <div className="pt-4">
                      <p className="text-gray-700">
                        This Agreement is made between <span className="font-semibold">ABC Corporation</span> and <span className="font-semibold">XYZ Services</span>.
                      </p>
                    </div>
                    
                    <div className="pt-6">
                      <h3 className="font-bold text-gray-700 mb-3">1. Services/Products:</h3>
                      <div className="text-gray-700">
                        Provision of consulting services for business optimization, including analysis, recommendations, 
                        and implementation support for a period of 12 months. The services include monthly reporting 
                        and quarterly reviews.
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <h3 className="font-bold text-gray-700 mb-3">2. Terms:</h3>
                      <div className="text-gray-700">
                        The contract period is 12 months starting from the date of signing. Either party may 
                        terminate with 30 days written notice. All work performed will be according to industry standards.
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <h3 className="font-bold text-gray-700 mb-3">3. Payment:</h3>
                      <div className="text-gray-700">
                        Payment terms are Net 30. Total contract value is $50,000, payable in quarterly installments 
                        of $12,500. Any additional services will be billed separately at agreed rates.
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <h3 className="font-bold text-gray-700 mb-3">4. Duration:</h3>
                      <div className="text-gray-700">
                        Contract duration: 12 months from 12/3/2025 to 12/3/2026. Automatic renewal for 
                        additional 6-month periods unless terminated by either party with 30 days notice.
                      </div>
                    </div>
                    
                    <div className="pt-8">
                      <h3 className="font-bold text-gray-700 mb-4">Signatures:</h3>
                      <div className="grid grid-cols-2 gap-8">
                        <div className="text-center">
                          <div className="border-b border-gray-500 pb-8 mb-2">_________________________</div>
                          <div className="font-semibold">ABC Corporation</div>
                          <div className="text-sm text-gray-600 mt-1">Date: 12/3/2025</div>
                        </div>
                        <div className="text-center">
                          <div className="border-b border-gray-500 pb-8 mb-2">_________________________</div>
                          <div className="font-semibold">XYZ Services</div>
                          <div className="text-sm text-gray-600 mt-1">Date: 12/3/2025</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">
                    {viewingTemplate 
                      ? `Viewing Template #${viewingTemplate}`
                      : selectedTemplate 
                        ? `Editing Template #${selectedTemplate}`
                        : "Create New Template"}
                  </h3>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handlePrintPreview(currentTemplate?.id || '')}>
                      <Printer className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    {!viewingTemplate && (
                      <Button onClick={handleSaveTemplate}>
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
                          defaultValue={currentTemplate?.name || ''}
                          disabled={!!viewingTemplate}
                          className="w-full p-2 border rounded-md"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="templateType" className="text-sm font-medium">Template Type</label>
                        <select
                          id="templateType"
                          defaultValue={currentTemplate?.type || 'receipt'}
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
                        defaultValue={currentTemplate?.description || ''}
                        disabled={!!viewingTemplate}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Template Content</label>
                      <textarea 
                        rows={15}
                        placeholder="Template content with placeholders..."
                        defaultValue={currentTemplate?.content || ''}
                        disabled={!!viewingTemplate}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="isActive" 
                        defaultChecked={currentTemplate?.isActive || false}
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
                      setViewingTemplate(null);
                      setSelectedTemplate(null);
                    }}
                  >
                    Back to Templates
                  </Button>
                  {!viewingTemplate && (
                    <Button onClick={handleSaveTemplate}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Template
                    </Button>
                  )}
                </div>
              </div>
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