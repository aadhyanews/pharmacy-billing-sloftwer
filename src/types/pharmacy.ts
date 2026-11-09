/**
 * SAHASRA PHARMACY BILLING SOFTWARE
 * Developed & Designed by AADHYA SOFTWARE SOLUTIONS
 * Core TypeScript Models & Schema Definitions
 */

export type UserRole = 'admin' | 'cashier';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  phone: string;
  email: string;
  active: boolean;
  createdAt: string;
  lastLogin?: string;
}

export type ScheduleCategory = 'OTC' | 'Schedule H' | 'Schedule H1' | 'Schedule X' | 'General';
export type MedicineCategory = 'Tablets' | 'Capsules' | 'Syrups' | 'Injections' | 'Ointments' | 'Drops' | 'Medical Equipment' | 'Personal Care' | 'Baby Care';

export interface Medicine {
  id: string;
  brandName: string;
  genericName: string;
  composition: string;
  manufacturer: string;
  category: MedicineCategory;
  schedule: ScheduleCategory;
  hsnCode: string;
  rackLocation: string; // e.g. Rack A-12, Shelf 2
  minStockAlert: number;
  unit: string; // e.g. 'Strips (10 tabs)', 'Bottle (100ml)', 'Vial'
  description?: string;
}

export interface MedicineBatch {
  id: string;
  medicineId: string;
  batchNumber: string;
  expiryDate: string; // YYYY-MM
  mrp: number;
  purchasePrice: number; // cost price before GST
  sellingPrice: number; // standard pharmacy billing price
  gstRate: number; // 0, 5, 12, 18, 28
  currentStock: number;
  barcode: string;
  supplierId: string;
  supplierInvoiceNo?: string;
  purchaseDate: string;
}

export interface CartItem {
  medicineId: string;
  brandName: string;
  genericName: string;
  batchId: string;
  batchNumber: string;
  expiryDate: string;
  hsnCode: string;
  rackLocation: string;
  mrp: number;
  unitPrice: number;
  quantity: number;
  discountPercent: number;
  gstRate: number;
  availableStock: number;
}

export type PaymentMethod = 'cash' | 'upi' | 'card' | 'credit';

export interface SaleInvoiceItem {
  medicineId: string;
  brandName: string;
  genericName: string;
  batchNumber: string;
  expiryDate: string;
  hsnCode: string;
  mrp: number;
  unitPrice: number;
  quantity: number;
  discountPercent: number;
  discountAmount: number;
  taxableValue: number;
  gstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  totalAmount: number;
}

export interface SaleInvoice {
  id: string;
  invoiceNumber: string; // e.g. SPS-2026-0042
  date: string; // ISO string
  time: string; // HH:MM AM/PM
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  doctorName: string;
  doctorRegNo?: string;
  items: SaleInvoiceItem[];
  subTotal: number;
  totalDiscount: number;
  taxableAmount: number;
  cgstTotal: number;
  sgstTotal: number;
  totalTax: number;
  roundOff: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  tenderedCash?: number;
  changeAmount?: number;
  cashierName: string;
  cashierId: string;
  status: 'completed' | 'returned' | 'cancelled';
  notes?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  gstin: string;
  drugLicenseNo: string; // D.L. 20B/21B
  balanceDue: number; // outstanding amount to pay supplier
  creditDays: number;
}

export interface PurchaseItem {
  medicineId: string;
  brandName: string;
  genericName: string;
  batchNumber: string;
  expiryDate: string;
  hsnCode: string;
  mrp: number;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  freeQuantity?: number;
  gstRate: number;
  taxAmount: number;
  totalAmount: number;
}

export interface PurchaseInvoice {
  id: string;
  invoiceNumber: string;
  supplierInvoiceNo: string;
  supplierId: string;
  supplierName: string;
  supplierGstin: string;
  invoiceDate: string;
  receivedDate: string;
  items: PurchaseItem[];
  subTotal: number;
  taxTotal: number;
  grandTotal: number;
  paidAmount: number;
  balanceDue: number;
  paymentMode: 'bank' | 'cash' | 'credit' | 'cheque';
  status: 'received' | 'partial' | 'paid';
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  doctorName?: string;
  creditBalance: number; // outstanding customer debt
  creditLimit: number;
  totalPurchases: number;
  lastVisitDate?: string;
}

export interface SalesReturnItem {
  medicineId: string;
  brandName: string;
  batchNumber: string;
  quantity: number;
  unitPrice: number;
  refundAmount: number;
  reason: string;
}

export interface SalesReturn {
  id: string;
  returnNumber: string;
  originalInvoiceNumber: string;
  date: string;
  customerName: string;
  customerPhone: string;
  items: SalesReturnItem[];
  totalRefund: number;
  paymentMethod: PaymentMethod;
  reason: string;
  handledBy: string;
}

export interface PurchaseReturn {
  id: string;
  returnNumber: string;
  supplierId: string;
  supplierName: string;
  purchaseInvoiceNo: string;
  date: string;
  items: {
    medicineName: string;
    batchNumber: string;
    quantity: number;
    purchaseRate: number;
    amount: number;
    reason: string;
  }[];
  totalAmount: number;
  reason: string;
  status: 'credited' | 'refunded';
}

export interface StockAdjustment {
  id: string;
  date: string;
  medicineId: string;
  medicineName: string;
  batchNumber: string;
  adjustmentType: 'breakage' | 'expired' | 'damaged' | 'recount_gain' | 'recount_loss' | 'sample';
  quantityChange: number; // positive or negative
  previousStock: number;
  newStock: number;
  reason: string;
  recordedBy: string;
}

export type ExpenseCategory = 
  | 'Store Rent'
  | 'Electricity & Utilities'
  | 'Staff Salaries'
  | 'Packing Bags & Thermal Rolls'
  | 'Tea, Water & Refreshments'
  | 'Courier & Freight'
  | 'Maintenance & Cleaning'
  | 'Software & IT'
  | 'Miscellaneous';

export interface Expense {
  id: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  paymentMode: 'cash' | 'upi' | 'bank';
  paidTo: string;
  recordedBy: string;
}

export interface PharmacySettings {
  pharmacyName: string;
  tagline: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  altPhone: string;
  email: string;
  gstin: string;
  dlNo20B: string;
  dlNo21B: string;
  fssaiNo: string;
  invoicePrefix: string;
  thermalWidth: '58mm' | '80mm' | 'a4';
  enableBarcodeBeep: boolean;
  taxInclusive: boolean;
  footerNote: string;
  bankDetails: {
    bankName: string;
    accountHolder: string;
    accountNumber: string;
    ifsc: string;
    upiId: string;
  };
}

export interface BackupRecord {
  id: string;
  filename: string;
  timestamp: string;
  sizeKb: number;
  type: 'auto_exit' | 'daily' | 'manual' | 'usb';
  verified: boolean;
  recordCount: {
    medicines: number;
    batches: number;
    sales: number;
    purchases: number;
  };
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userName: string;
  action: string;
  module: string;
  details: string;
}
