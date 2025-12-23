import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { SalesOrderCard } from "@/components/SalesOrderCard";
import { SalesOrderDetails } from "@/components/SalesOrderDetails";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Calendar, Receipt, Plus, Edit, Trash2, Eye, X, Printer, Share, Download } from "lucide-react";
import { getSales, getCustomers, getSaleItemsWithProducts, createSale, updateSale, deleteSale, Customer, Sale, Product, getProducts, createSaleItem, createCustomer } from "@/services/databaseService";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/currency";

interface SalesOrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface SalesOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  orderDate: string;
  status: "pending" | "completed" | "cancelled";
  items: SalesOrderItem[];
  subtotal: number;
  tax: number;
  total: number;
}

export const SalesOrders = ({ username, onBack, onLogout }: { username: string; onBack: () => void; onLogout: () => void }) => {
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSO, setEditingSO] = useState<SalesOrder | null>(null);
  const [viewingSO, setViewingSO] = useState<SalesOrder | null>(null);
  const [newSO, setNewSO] = useState<Omit<SalesOrder, "id" | "orderNumber" | "items" | "subtotal" | "tax" | "total">>({
    customerId: "",
    customerName: "",
    orderDate: new Date().toISOString().split('T')[0],
    status: "pending"
  });
  // State for managing items in the dialog
  const [soItems, setSoItems] = useState<SalesOrderItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<{id: string, name: string, price: number} | null>(null);
  const [itemQuantity, setItemQuantity] = useState(1);
  const { toast } = useToast();

  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
  const [products, setProducts] = useState<{ id: string; name: string; price: number }[]>([]);
  
  // State for new customer form
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  
  // Function to create a new customer
  const createNewCustomer = async () => {
    if (!newCustomer.firstName || !newCustomer.lastName) {
      toast({
        title: "Error",
        description: "First name and last name are required",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const newCustomerData = {
        first_name: newCustomer.firstName,
        last_name: newCustomer.lastName,
        email: newCustomer.email || null,
        phone: newCustomer.phone || null,
      };
      
      const createdCustomer = await createCustomer(newCustomerData);
      
      if (!createdCustomer) {
        throw new Error('Failed to create customer');
      }
      
      // Add the new customer to the customers list
      const newCustomerFormatted = {
        id: createdCustomer.id,
        name: `${createdCustomer.first_name} ${createdCustomer.last_name}`
      };
      
      setCustomers(prev => [...prev, newCustomerFormatted]);
      
      // Select the new customer
      if (viewingSO) return; // Do nothing in view mode
      else if (editingSO) 
        setEditingSO({...editingSO, customerId: createdCustomer.id, customerName: newCustomerFormatted.name});
      else 
        setNewSO({...newSO, customerId: createdCustomer.id, customerName: newCustomerFormatted.name});
      
      // Reset form and hide
      setNewCustomer({ firstName: '', lastName: '', email: '', phone: '' });
      setShowNewCustomerForm(false);
      
      toast({
        title: "Success",
        description: "Customer created successfully"
      });
    } catch (error) {
      console.error('Error creating customer:', error);
      toast({
        title: "Error",
        description: "Failed to create customer: " + (error as Error).message,
        variant: "destructive"
      });
    }
  };
  
  // Function to download sales order as text file
  const downloadSalesOrder = (order: SalesOrder | null) => {
    if (!order) {
      console.error('No order provided to downloadSalesOrder');
      return;
    }
      
    try {
      import('jspdf').then((jsPDFModule) => {
        import('jspdf-autotable').then((autoTableModule) => {
          const jsPDF = jsPDFModule.default || jsPDFModule;
          const autoTable = autoTableModule.default || autoTableModule;
          const doc = new jsPDF();
                    
          // Add title
          doc.setFontSize(18);
          doc.text('SALES ORDER', 105, 20, null, null, 'center');
                    
          // Add order details
          doc.setFontSize(12);
          doc.text(`Order Number: ${order.orderNumber}`, 20, 40);
          doc.text(`Customer: ${order.customerName}`, 20, 50);
          doc.text(`Order Date: ${order.orderDate}`, 20, 60);
          doc.text(`Status: ${order.status}`, 20, 70);
                    
          // Calculate totals - handle case where items might be undefined
          const itemsToUse = order.items || [];
          const subtotal = itemsToUse.reduce((sum, item) => sum + (item.total || 0), 0);
          const tax = subtotal * 0.18; // 18% tax
          const total = subtotal + tax;
                    
          // Add items table
          autoTable(doc, {
            startY: 80,
            head: [['Product', 'Quantity', 'Unit Price', 'Total']],
            body: itemsToUse.map(item => [
              item.productName || 'N/A',
              (item.quantity || 0).toString(),
              formatCurrency(item.unitPrice || 0),
              formatCurrency(item.total || 0)
            ]),
            styles: {
              fontSize: 10,
            },
            headStyles: {
              fillColor: [59, 130, 246], // blue-500
            },
          });
                    
          // Add totals
          const finalY = (doc as any).lastAutoTable.finalY + 10;
          doc.text(`Subtotal: ${formatCurrency(subtotal)}`, 140, finalY);
          doc.text(`Tax (18%): ${formatCurrency(tax)}`, 140, finalY + 10);
          doc.text(`Total: ${formatCurrency(total)}`, 140, finalY + 20);
                    
          // Save the PDF
          doc.save(`SalesOrder_${order.orderNumber}.pdf`);
        }).catch(error => {
          console.error('Error loading jspdf-autotable for download:', error);
          toast({
            title: "Error",
            description: "Failed to generate sales order for download"
          });
        });
      }).catch(error => {
        console.error('Error loading jspdf for download:', error);
        toast({
          title: "Error",
          description: "Failed to load PDF library for download"
        });
      });
    } catch (error) {
      console.error('Unexpected error in downloadSalesOrder:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during download"
      });
    }
  };

  // Function to print a professional sales order
  const printSalesOrder = (order: SalesOrder | null) => {
    if (!order) {
      console.error('No order provided to printSalesOrder');
      return;
    }
    
    try {
      // Create a new window with professional print layout
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        console.error('Failed to open print window');
        toast({
          title: "Error",
          description: "Failed to open print window"
        });
        return;
      }
      
      // Calculate totals - handle case where items might be undefined
      const itemsToUse = order.items || [];
      const subtotal = itemsToUse.reduce((sum, item) => sum + (item.total || 0), 0);
      const tax = subtotal * 0.18; // 18% tax
      const total = subtotal + tax;
      
      // Create the HTML for the print view
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Sales Order ${order.orderNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; }
            .order-info { margin: 20px 0; }
            .order-info div { margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #000; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .totals { margin-top: 20px; text-align: right; }
            .signature-section { margin-top: 50px; display: flex; justify-content: space-between; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>SALES ORDER</h1>
          </div>
          
          <div class="order-info">
            <div><strong>Order Number:</strong> ${order.orderNumber}</div>
            <div><strong>Customer:</strong> ${order.customerName}</div>
            <div><strong>Order Date:</strong> ${order.orderDate}</div>
            <div><strong>Status:</strong> ${order.status}</div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsToUse.map(item => `
              <tr>
                <td>${item.productName || 'N/A'}</td>
                <td>${item.quantity || 0}</td>
                <td>${formatCurrency(item.unitPrice || 0)}</td>
                <td>${formatCurrency(item.total || 0)}</td>
              </tr>`).join('')}
            </tbody>
          </table>
          
          <div class="totals">
            <div><strong>Subtotal:</strong> ${formatCurrency(subtotal)}</div>
            <div><strong>Tax (18%):</strong> ${formatCurrency(tax)}</div>
            <div><strong>Total:</strong> ${formatCurrency(total)}</div>
          </div>
          
          <div class="signature-section">
            <div>Customer Signature</div>
            <div>Sales Representative</div>
          </div>
          
          <div class="footer">
            Thank you for your business!
          </div>
        </body>
        </html>
      `;
      
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      
      // Wait for content to load before printing
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };
    } catch (error) {
      console.error('Unexpected error in printSalesOrder:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during printing"
      });
    }
  };

  // Function to share a sales order as a file
  const shareSalesOrder = (order: SalesOrder | null) => {
    if (!order) {
      console.error('No order provided to shareSalesOrder');
      return;
    }
    
    try {
      import('jspdf').then((jsPDFModule) => {
        import('jspdf-autotable').then((autoTableModule) => {
          const jsPDF = jsPDFModule.default || jsPDFModule;
          const autoTable = autoTableModule.default || autoTableModule;
          const doc = new jsPDF();
          
          // Add title
          doc.setFontSize(18);
          doc.text('SALES ORDER', 105, 20, null, null, 'center');
          
          // Add order details
          doc.setFontSize(12);
          doc.text(`Order Number: ${order.orderNumber}`, 20, 40);
          doc.text(`Customer: ${order.customerName}`, 20, 50);
          doc.text(`Order Date: ${order.orderDate}`, 20, 60);
          doc.text(`Status: ${order.status}`, 20, 70);
          
          // Calculate totals - handle case where items might be undefined
          const itemsToUse = order.items || [];
          const subtotal = itemsToUse.reduce((sum, item) => sum + (item.total || 0), 0);
          const tax = subtotal * 0.18; // 18% tax
          const total = subtotal + tax;
          
          // Add items table
          autoTable(doc, {
            startY: 80,
            head: [['Product', 'Quantity', 'Unit Price', 'Total']],
            body: itemsToUse.map(item => [
              item.productName || 'N/A',
              (item.quantity || 0).toString(),
              formatCurrency(item.unitPrice || 0),
              formatCurrency(item.total || 0)
            ]),
            styles: {
              fontSize: 10,
            },
            headStyles: {
              fillColor: [59, 130, 246], // blue-500
            },
          });
          
          // Add totals
          const finalY = (doc as any).lastAutoTable.finalY + 10;
          doc.text(`Subtotal: ${formatCurrency(subtotal)}`, 140, finalY);
          doc.text(`Tax (18%): ${formatCurrency(tax)}`, 140, finalY + 10);
          doc.text(`Total: ${formatCurrency(total)}`, 140, finalY + 20);
          
          // Get the PDF as a blob
          const pdfBlob = doc.output('blob');
          
          // Create a File object from the blob
          const pdfFile = new File([pdfBlob], `SalesOrder_${order.orderNumber}.pdf`, { type: 'application/pdf' });
          
          // Share the file if the Web Share API supports files
          if (navigator.share && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
            navigator.share({
              title: `Sales Order ${order.orderNumber}`,
              text: `Sales order ${order.orderNumber} for ${order.customerName} with total ${formatCurrency(total)}`,
              files: [pdfFile]
            }).catch(error => {
              console.error('Error sharing file:', error);
              // Fallback to saving the file
              doc.save(`SalesOrder_${order.orderNumber}.pdf`);
              toast({
                title: "File Saved",
                description: "Sharing failed. File saved instead."
              });
            });
          } else {
            // Fallback: save the file
            doc.save(`SalesOrder_${order.orderNumber}.pdf`);
            toast({
              title: "File Saved",
              description: "Sales order saved. You can share it manually."
            });
          }
        }).catch(error => {
          console.error('Error loading jspdf-autotable:', error);
          toast({
            title: "Error",
            description: "Failed to generate sales order for sharing"
          });
        });
      }).catch(error => {
        console.error('Error loading jspdf:', error);
        toast({
          title: "Error",
          description: "Failed to load PDF library"
        });
      });
    } catch (error) {
      console.error('Unexpected error in shareSalesOrder:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred"
      });
    }
  };

  // Load sales orders, customers, and products from database
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load customers
        const customerData = await getCustomers();
        const formattedCustomers = customerData.map(customer => ({
          id: customer.id || '',
          name: `${customer.first_name} ${customer.last_name}`
        }));
        setCustomers(formattedCustomers);
        
        // Load products
        const productData = await getProducts();
        const formattedProducts = productData.map(product => ({
          id: product.id || '',
          name: product.name || 'Unknown Product',
          price: product.selling_price || 0
        }));
        setProducts(formattedProducts);
        
        // Load sales orders
        const orders = await getSales();
        // Convert database orders to component format
        const formattedOrders = orders.map(order => ({
          id: order.id || '',
          orderNumber: order.invoice_number || `SO-${order.id?.substring(0, 8) || '001'}`,
          customerId: order.customer_id || '',
          customerName: customerData.find(c => c.id === order.customer_id) ? 
            `${customerData.find(c => c.id === order.customer_id)?.first_name} ${customerData.find(c => c.id === order.customer_id)?.last_name}` : 
            'Walk-in Customer',
          orderDate: order.sale_date || new Date().toISOString(),
          status: (order.sale_status as "pending" | "completed" | "cancelled") || "pending",
          items: [], // Will be loaded when needed
          subtotal: 0, // Will be calculated
          tax: 0, // Will be calculated
          total: order.total_amount || 0
        }));
        setSalesOrders(formattedOrders);
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error",
          description: "Failed to load data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAddSO = async () => {
    if (!newSO.customerId || !newSO.customerName) {
      toast({
        title: "Error",
        description: "Please select a customer",
        variant: "destructive"
      });
      return;
    }

    try {
      // Calculate totals
      const subtotal = soItems.reduce((sum, item) => sum + item.total, 0);
      const tax = subtotal * 0.18; // 18% tax
      const total = subtotal + tax;

      // Create the sales order
      const soData = {
        customer_id: newSO.customerId,
        sale_date: newSO.orderDate,
        subtotal: subtotal,
        tax_amount: tax,
        total_amount: total,
        discount_amount: 0,
        amount_paid: 0, // No payment for pending orders
        change_amount: 0,
        payment_method: "cash",
        payment_status: "unpaid", // Pending orders are unpaid
        sale_status: newSO.status,
        notes: ""
      };

      const createdSO = await createSale(soData);
      
      if (!createdSO) {
        throw new Error("Failed to create sales order");
      }

      // Add items to the sales order
      for (const item of soItems) {
        const itemData = {
          sale_id: createdSO.id!,
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          discount_amount: 0,
          tax_amount: item.unitPrice * 0.18 * item.quantity, // 18% tax
          total_price: item.total
        };
        
        await createSaleItem(itemData);
      }

      // Refresh all data
      const customerData = await getCustomers();
      const formattedCustomers = customerData.map(customer => ({
        id: customer.id || '',
        name: `${customer.first_name} ${customer.last_name}`
      }));
      setCustomers(formattedCustomers);
      
      const productData = await getProducts();
      const formattedProducts = productData.map(product => ({
        id: product.id || '',
        name: product.name || 'Unknown Product',
        price: product.selling_price || 0
      }));
      setProducts(formattedProducts);
      
      const orders = await getSales();
      // Convert database orders to component format
      const formattedOrders = orders.map(order => ({
        id: order.id || '',
        orderNumber: order.invoice_number || `SO-${order.id?.substring(0, 8) || '001'}`,
        customerId: order.customer_id || '',
        customerName: customerData.find(c => c.id === order.customer_id) ? 
          `${customerData.find(c => c.id === order.customer_id)?.first_name} ${customerData.find(c => c.id === order.customer_id)?.last_name}` : 
          'Walk-in Customer',
        orderDate: order.sale_date || new Date().toISOString(),
        status: (order.sale_status as "pending" | "completed" | "cancelled") || "pending",
        items: [], // Will be loaded when needed
        subtotal: 0, // Will be calculated
        tax: 0, // Will be calculated
        total: order.total_amount || 0
      }));
      setSalesOrders(formattedOrders);
      
      resetForm();
      setIsDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Sales order created successfully"
      });
    } catch (error) {
      console.error("Error creating sales order:", error);
      toast({
        title: "Error",
        description: "Failed to create sales order: " + (error as Error).message,
        variant: "destructive"
      });
    }
  };

  const handleUpdateSO = async () => {
    if (!editingSO || !editingSO.customerId || !editingSO.customerName) {
      toast({
        title: "Error",
        description: "Please select a customer",
        variant: "destructive"
      });
      return;
    }

    try {
      // Calculate totals
      const subtotal = soItems.reduce((sum, item) => sum + item.total, 0);
      const tax = subtotal * 0.18; // 18% tax
      const total = subtotal + tax;

      // Update the sales order
      const soData = {
        customer_id: editingSO.customerId,
        sale_date: editingSO.orderDate,
        subtotal: subtotal,
        tax_amount: tax,
        total_amount: total,
        discount_amount: 0,
        amount_paid: editingSO.status === "completed" ? total : 0, // Payment only when completed
        change_amount: 0,
        payment_method: "cash",
        payment_status: editingSO.status === "completed" ? "paid" : "unpaid",
        sale_status: editingSO.status,
        notes: "",
        updated_at: new Date().toISOString()
      };

      const updatedSO = await updateSale(editingSO.id, soData);
      
      if (!updatedSO) {
        throw new Error("Failed to update sales order");
      }

      // Refresh all data
      const customerData = await getCustomers();
      const formattedCustomers = customerData.map(customer => ({
        id: customer.id || '',
        name: `${customer.first_name} ${customer.last_name}`
      }));
      setCustomers(formattedCustomers);
      
      const productData = await getProducts();
      const formattedProducts = productData.map(product => ({
        id: product.id || '',
        name: product.name || 'Unknown Product',
        price: product.selling_price || 0
      }));
      setProducts(formattedProducts);
      
      const orders = await getSales();
      // Convert database orders to component format
      const formattedOrders = orders.map(order => ({
        id: order.id || '',
        orderNumber: order.invoice_number || `SO-${order.id?.substring(0, 8) || '001'}`,
        customerId: order.customer_id || '',
        customerName: customerData.find(c => c.id === order.customer_id) ? 
          `${customerData.find(c => c.id === order.customer_id)?.first_name} ${customerData.find(c => c.id === order.customer_id)?.last_name}` : 
          'Walk-in Customer',
        orderDate: order.sale_date || new Date().toISOString(),
        status: (order.sale_status as "pending" | "completed" | "cancelled") || "pending",
        items: [], // Will be loaded when needed
        subtotal: 0, // Will be calculated
        tax: 0, // Will be calculated
        total: order.total_amount || 0
      }));
      setSalesOrders(formattedOrders);
      
      resetForm();
      setIsDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Sales order updated successfully"
      });
    } catch (error) {
      console.error("Error updating sales order:", error);
      toast({
        title: "Error",
        description: "Failed to update sales order: " + (error as Error).message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteSO = async (id: string) => {
    try {
      const success = await deleteSale(id);
      
      if (!success) {
        throw new Error("Failed to delete sales order");
      }

      // Refresh all data
      const customerData = await getCustomers();
      const formattedCustomers = customerData.map(customer => ({
        id: customer.id || '',
        name: `${customer.first_name} ${customer.last_name}`
      }));
      setCustomers(formattedCustomers);
      
      const productData = await getProducts();
      const formattedProducts = productData.map(product => ({
        id: product.id || '',
        name: product.name || 'Unknown Product',
        price: product.selling_price || 0
      }));
      setProducts(formattedProducts);
      
      const orders = await getSales();
      // Convert database orders to component format
      const formattedOrders = orders.map(order => ({
        id: order.id || '',
        orderNumber: order.invoice_number || `SO-${order.id?.substring(0, 8) || '001'}`,
        customerId: order.customer_id || '',
        customerName: customerData.find(c => c.id === order.customer_id) ? 
          `${customerData.find(c => c.id === order.customer_id)?.first_name} ${customerData.find(c => c.id === order.customer_id)?.last_name}` : 
          'Walk-in Customer',
        orderDate: order.sale_date || new Date().toISOString(),
        status: (order.sale_status as "pending" | "completed" | "cancelled") || "pending",
        items: [], // Will be loaded when needed
        subtotal: 0, // Will be calculated
        tax: 0, // Will be calculated
        total: order.total_amount || 0
      }));
      setSalesOrders(formattedOrders);
      
      toast({
        title: "Success",
        description: "Sales order deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting sales order:", error);
      toast({
        title: "Error",
        description: "Failed to delete sales order: " + (error as Error).message,
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setNewSO({
      customerId: "",
      customerName: "",
      orderDate: new Date().toISOString().split('T')[0],
      status: "pending"
    });
    setEditingSO(null);
    setViewingSO(null);
    setSoItems([]);
    setSelectedProduct(null);
    setItemQuantity(1);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = async (so: SalesOrder) => {
    try {
      // Load the sales order items
      const items = await getSaleItemsWithProducts(so.id);
      const productData = await getProducts();
      const formattedItems = items.map(item => ({
        id: item.id || '',
        productId: item.product_id || '',
        productName: item.product?.name || 'Unknown Product',
        quantity: item.quantity || 0,
        unitPrice: item.unit_price || 0,
        total: item.total_price || 0
      }));
      
      const formattedSO = {
        ...so,
        orderDate: so.orderDate || new Date().toISOString().split('T')[0],
        items: formattedItems
      };
      
      setEditingSO(formattedSO);
      setSoItems(formattedItems);
      setIsDialogOpen(true);
    } catch (error) {
      console.error("Error loading sales order items:", error);
      toast({
        title: "Error",
        description: "Failed to load sales order items",
        variant: "destructive"
      });
    }
  };

  const openViewDialog = async (so: SalesOrder) => {
    try {
      // Load the sales order items
      const items = await getSaleItemsWithProducts(so.id);
      const productData = await getProducts();
      const formattedItems = items.map(item => ({
        id: item.id || '',
        productId: item.product_id || '',
        productName: item.product?.name || 'Unknown Product',
        quantity: item.quantity || 0,
        unitPrice: item.unit_price || 0,
        total: item.total_price || 0
      }));
      
      const formattedSO = {
        ...so,
        orderDate: so.orderDate || new Date().toISOString().split('T')[0],
        items: formattedItems
      };
      
      setViewingSO(formattedSO);
      setIsDialogOpen(true);
    } catch (error) {
      console.error("Error loading sales order items:", error);
      toast({
        title: "Error",
        description: "Failed to load sales order items",
        variant: "destructive"
      });
    }
  };

  const handleCustomerChange = (customerId: string) => {
    if (customerId === 'new') {
      // Show new customer form when 'Add New Customer' is selected
      if (viewingSO) return; // Do nothing in view mode
      setShowNewCustomerForm(true);
      return;
    }
    
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      if (viewingSO) return; // Do nothing in view mode
      else if (editingSO) 
        setEditingSO({...editingSO, customerId, customerName: customer.name});
      else 
        setNewSO({...newSO, customerId, customerName: customer.name});
    }
  };

  const handleAddItem = () => {
    if (!selectedProduct || viewingSO) return; // Do nothing in view mode
    
    const newItem: SalesOrderItem = {
      id: Date.now().toString(), // Temporary ID
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      quantity: itemQuantity,
      unitPrice: selectedProduct.price,
      total: selectedProduct.price * itemQuantity
    };
    
    setSoItems([...soItems, newItem]);
    setSelectedProduct(null);
    setItemQuantity(1);
  };

  const handleRemoveItem = (itemId: string) => {
    if (viewingSO) return; // Do nothing in view mode
    setSoItems(soItems.filter(item => item.id !== itemId));
  };

  const filteredSalesOrders = salesOrders.filter(so => {
    const matchesSearch = 
      so.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      so.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || so.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation 
          title="Sales Orders" 
          onBack={onBack}
          onLogout={onLogout} 
          username={username}
        />
        <main className="container mx-auto p-6">
          <div className="flex justify-center items-center h-64">
            <p>Loading sales orders...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        title="Sales Orders" 
        onBack={onBack}
        onLogout={onLogout} 
        username={username}
      />
      
      <main className="container mx-auto p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold">Sales Orders</h2>
              <p className="text-muted-foreground">Manage and view all sales orders</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openAddDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Sales Order
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {viewingSO ? "View Sales Order" : editingSO ? "Edit Sales Order" : "Create Sales Order"}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="customer">Customer *</Label>
                    <div className="flex gap-2">
                      <Select
                        value={showNewCustomerForm ? 'new' : (viewingSO ? viewingSO.customerId : (editingSO ? editingSO.customerId : newSO.customerId))}
                        onValueChange={handleCustomerChange}
                        disabled={!!viewingSO || showNewCustomerForm} // Disable in view mode or when new customer form is shown
                      >
                        <SelectTrigger id="customer">
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="walk-in">Walk-in Customer</SelectItem>
                          {customers.map(customer => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.name}
                            </SelectItem>
                          ))}
                          <SelectItem value="new" className="font-bold">
                            + Add New Customer
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          if (viewingSO) return; // Do nothing in view mode
                          setShowNewCustomerForm(true);
                        }}
                        disabled={!!viewingSO}
                      >
                        Add New
                      </Button>
                    </div>
                    
                    {/* New Customer Form */}
                    {showNewCustomerForm && (
                      <div className="border rounded-lg p-4 mt-4">
                        <h3 className="font-medium mb-3">Add New Customer</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="firstName">First Name *</Label>
                            <Input
                              id="firstName"
                              value={newCustomer.firstName}
                              onChange={(e) => setNewCustomer({...newCustomer, firstName: e.target.value})}
                              placeholder="Enter first name"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="lastName">Last Name *</Label>
                            <Input
                              id="lastName"
                              value={newCustomer.lastName}
                              onChange={(e) => setNewCustomer({...newCustomer, lastName: e.target.value})}
                              placeholder="Enter last name"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={newCustomer.email}
                              onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                              placeholder="Enter email"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                              id="phone"
                              value={newCustomer.phone}
                              onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                              placeholder="Enter phone"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button type="button" onClick={createNewCustomer}>
                            Create Customer
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => {
                              setShowNewCustomerForm(false);
                              setNewCustomer({ firstName: '', lastName: '', email: '', phone: '' });
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="orderDate">Order Date</Label>
                      <Input
                        id="orderDate"
                        type="date"
                        value={viewingSO ? viewingSO.orderDate : (editingSO ? editingSO.orderDate : newSO.orderDate)}
                        onChange={(e) => 
                          viewingSO
                            ? null // Do nothing in view mode
                            : editingSO 
                              ? setEditingSO({...editingSO, orderDate: e.target.value}) 
                              : setNewSO({...newSO, orderDate: e.target.value})
                        }
                        disabled={!!viewingSO} // Disable in view mode
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={viewingSO ? viewingSO.status : (editingSO ? editingSO.status : newSO.status)}
                        onValueChange={(value: "pending" | "completed" | "cancelled") => 
                          viewingSO
                            ? null // Do nothing in view mode
                            : editingSO 
                              ? setEditingSO({...editingSO, status: value}) 
                              : setNewSO({...newSO, status: value})
                        }
                        disabled={!!viewingSO} // Disable in view mode
                      >
                        <SelectTrigger id="status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending Approval</SelectItem>
                          <SelectItem value="completed">Approved</SelectItem>
                          <SelectItem value="cancelled">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Add Item Section */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-3">Add Items</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                      <div className="md:col-span-2">
                        <Label htmlFor="product">Product</Label>
                        <Select
                          value={selectedProduct?.id || ""}
                          onValueChange={(value) => {
                            const product = products.find(p => p.id === value);
                            if (product) {
                              setSelectedProduct(product);
                            }
                          }}
                          disabled={!!viewingSO} // Disable in view mode
                        >
                          <SelectTrigger id="product">
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map(product => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name} - {formatCurrency(product.price)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input
                          id="quantity"
                          type="number"
                          min="1"
                          value={itemQuantity}
                          onChange={(e) => setItemQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          disabled={!!viewingSO} // Disable in view mode
                        />
                      </div>
                      
                      <div className="flex items-end">
                        <Button 
                          onClick={handleAddItem}
                          className="w-full"
                          disabled={!!viewingSO} // Disable in view mode
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Item
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Items List */}
                  {viewingSO ? (
                    // View mode - show items in a read-only format
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-3">Items</h3>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {viewingSO.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                            <div>
                              <div className="font-medium">{item.productName}</div>
                              <div className="text-sm text-muted-foreground">
                                {item.quantity} × {formatCurrency(item.unitPrice)} = {formatCurrency(item.total)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>{formatCurrency(viewingSO.items.reduce((sum, item) => sum + item.total, 0))}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax (18%):</span>
                          <span>{formatCurrency(viewingSO.items.reduce((sum, item) => sum + item.total, 0) * 0.18)}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span>Total:</span>
                          <span>{formatCurrency(viewingSO.items.reduce((sum, item) => sum + item.total, 0) * 1.18)}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Edit/Create mode - show editable items
                    soItems.length > 0 && (
                      <div className="border rounded-lg p-4">
                        <h3 className="font-medium mb-3">Items</h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {soItems.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                              <div>
                                <div className="font-medium">{item.productName}</div>
                                <div className="text-sm text-muted-foreground">
                                  {item.quantity} × {formatCurrency(item.unitPrice)} = {formatCurrency(item.total)}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveItem(item.id)}
                                disabled={!!viewingSO} // Disable in view mode
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>{formatCurrency(soItems.reduce((sum, item) => sum + item.total, 0))}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tax (18%):</span>
                            <span>{formatCurrency(soItems.reduce((sum, item) => sum + item.total, 0) * 0.18)}</span>
                          </div>
                          <div className="flex justify-between font-bold">
                            <span>Total:</span>
                            <span>{formatCurrency(soItems.reduce((sum, item) => sum + item.total, 0) * 1.18)}</span>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
                
                <div className="flex justify-end gap-2">
                  {viewingSO ? (
                    // View mode - show download, print, share, and close buttons
                    <>
                      <Button variant="outline" onClick={() => downloadSalesOrder(viewingSO)}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button variant="outline" onClick={() => printSalesOrder(viewingSO)}>
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                      </Button>
                      <Button variant="outline" onClick={() => shareSalesOrder(viewingSO)}>
                        <Share className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                      <Button onClick={() => setIsDialogOpen(false)}>
                        Close
                      </Button>
                    </>
                  ) : (
                    // Edit/Create mode - show download, print, share, and full buttons
                    <>
                      <Button variant="outline" onClick={() => {
                        // For edit mode, we'll use the current editingSO data if available
                        const orderToPrint = editingSO || {
                          orderNumber: 'New Order',
                          customerName: customers.find(c => c.id === newSO.customerId)?.name || 'New Customer',
                          orderDate: newSO.orderDate,
                          status: newSO.status,
                          items: soItems,
                          total: soItems.reduce((sum, item) => sum + item.total, 0) * 1.18 // Including tax
                        };
                                              
                        shareSalesOrder(orderToPrint);
                      }}>
                        <Share className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                      <Button variant="outline" onClick={() => {
                        // For edit mode, we'll create a temporary order object for printing
                        const orderToPrint = editingSO || {
                          id: 'temp',
                          orderNumber: 'New Order',
                          customerName: customers.find(c => c.id === newSO.customerId)?.name || 'New Customer',
                          orderDate: newSO.orderDate,
                          status: newSO.status,
                          items: soItems,
                          subtotal: soItems.reduce((sum, item) => sum + item.total, 0),
                          tax: soItems.reduce((sum, item) => sum + item.total, 0) * 0.18,
                          total: soItems.reduce((sum, item) => sum + item.total, 0) * 1.18
                        };
                        printSalesOrder(orderToPrint);
                      }}>
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                      </Button>
                      <Button variant="outline" onClick={() => {
                        // For edit mode, we'll create a temporary order object
                        const orderToDownload = editingSO || {
                          id: 'temp',
                          orderNumber: 'New Order',
                          customerName: customers.find(c => c.id === newSO.customerId)?.name || 'New Customer',
                          orderDate: newSO.orderDate,
                          status: newSO.status,
                          items: soItems,
                          subtotal: soItems.reduce((sum, item) => sum + item.total, 0),
                          tax: soItems.reduce((sum, item) => sum + item.total, 0) * 0.18,
                          total: soItems.reduce((sum, item) => sum + item.total, 0) * 1.18
                        };
                        downloadSalesOrder(orderToDownload);
                      }}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={editingSO ? handleUpdateSO : handleAddSO}>
                        {editingSO ? "Update" : "Create"} Sales Order
                      </Button>
                    </>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by order number or customer..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending Approval</SelectItem>
                    <SelectItem value="completed">Approved</SelectItem>
                    <SelectItem value="cancelled">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Sales Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSalesOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No sales orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSalesOrders.map((so) => (
                    <TableRow key={so.id}>
                      <TableCell className="font-medium">{so.orderNumber}</TableCell>
                      <TableCell>{so.customerName}</TableCell>
                      <TableCell>{so.orderDate}</TableCell>
                      <TableCell>{so.items.length}</TableCell>
                      <TableCell>{formatCurrency(so.total)}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            so.status === "pending" ? "secondary" :
                            so.status === "completed" ? "default" : "destructive"
                          }
                        >
                          {so.status === "pending" ? "Pending Approval" : 
                           so.status === "completed" ? "Approved" : "Rejected"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openViewDialog(so)}
                            title="View sales order"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openEditDialog(so)}
                            title="Edit sales order"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteSO(so.id)}
                            title="Delete sales order"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};