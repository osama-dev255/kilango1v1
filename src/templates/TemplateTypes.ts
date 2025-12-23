export interface Template {
  id: string;
  name: string;
  type: string;
  description: string;
  content: string;
  lastModified: string;
  isActive: boolean;
}

export interface DeliveryNoteItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  delivered: number;
  remarks: string;
}

export interface DeliveryNoteData {
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
  // Timestamp
  timestamp: string;
}