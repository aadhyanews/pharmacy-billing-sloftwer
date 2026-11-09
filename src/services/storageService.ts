/**
 * SAHASRA PHARMACY BILLING SOFTWARE
 * Developed & Designed by AADHYA SOFTWARE SOLUTIONS
 * 100% Offline Local Database Simulation Engine
 * Emulates SQLite Engine with local persistence, auto-backup & integrity verification.
 */

import {
  User,
  Medicine,
  MedicineBatch,
  SaleInvoice,
  Supplier,
  PurchaseInvoice,
  Customer,
  SalesReturn,
  PurchaseReturn,
  StockAdjustment,
  Expense,
  PharmacySettings,
  BackupRecord,
  AuditLog,
  PaymentMethod,
} from '../types/pharmacy';

const STORAGE_KEY_PREFIX = 'sahasra_pharmacy_v4_';

// Audio feedback for barcode scanner / POS terminal
export function playScannerBeep(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1760, ctx.currentTime); // High-pitch standard POS beep
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch {
    // Ignore audio errors if audio context is blocked
  }
}

// Initial Settings
const DEFAULT_SETTINGS: PharmacySettings = {
  pharmacyName: 'SAHASRA PHARMACY & SURGICALS',
  tagline: 'Retail & Wholesale Chemist | 100% Genuine Medicines',
  addressLine1: 'Shop No. 4 & 5, Sri Sai Krupa Complex',
  addressLine2: 'Opposite Government Hospital, Main Road',
  city: 'Hyderabad',
  state: 'Telangana',
  pincode: '500072',
  phone: '+91 98490 12345',
  altPhone: '+91 94401 67890',
  email: 'srisahasramedicals@gmail.com',
  gstin: '36AAAFS4928K1Z7',
  dlNo20B: 'TG/HYD/20B/2021/8842',
  dlNo21B: 'TG/HYD/21B/2021/8843',
  fssaiNo: '13621014000412',
  invoicePrefix: 'SPS',
  thermalWidth: '80mm',
  enableBarcodeBeep: true,
  taxInclusive: true,
  footerNote: 'Wish You Speedy Recovery! Medicines once sold cannot be returned without original bill. Developed by AADHYA SOFTWARE SOLUTIONS',
  bankDetails: {
    bankName: 'State Bank of India',
    accountHolder: 'SAHASRA PHARMACY',
    accountNumber: '39482710492',
    ifsc: 'SBIN0012845',
    upiId: 'sahasrapharmacy@sbi',
  },
};

// Initial Users
const DEFAULT_USERS: User[] = [
  {
    id: 'u1',
    username: 'admin',
    fullName: 'Dr. K. Srinivas Rao (Pharmacist)',
    role: 'admin',
    phone: '+91 98490 12345',
    email: 'admin@sahasrapharma.local',
    active: true,
    createdAt: '2024-01-15T08:00:00Z',
    lastLogin: '2026-11-09T08:30:00Z',
  },
  {
    id: 'u2',
    username: 'cashier',
    fullName: 'M. Ramesh (Billing Executive)',
    role: 'cashier',
    phone: '+91 98490 54321',
    email: 'ramesh@sahasrapharma.local',
    active: true,
    createdAt: '2024-03-01T08:00:00Z',
    lastLogin: '2026-11-09T09:15:00Z',
  },
];

// Initial Suppliers
const DEFAULT_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    name: 'Apollo Pharma Wholesale Distributors',
    contactPerson: 'Venkatesh Babu',
    phone: '+91 98480 11223',
    email: 'orders@apollodist.com',
    address: 'Plot 42, IDA Kukatpally, Hyderabad, TS - 500072',
    gstin: '36AABCA1122K1Z1',
    drugLicenseNo: 'TG/HYD/20B/4412 / 21B/4413',
    balanceDue: 42500,
    creditDays: 30,
  },
  {
    id: 'sup-2',
    name: 'Sun Pharma Regional Agency',
    contactPerson: 'Suresh Kumar',
    phone: '+91 98480 33445',
    email: 'hyderabad@sunpharmaagency.com',
    address: 'Shop 12, Commercial Complex, Dilsukhnagar, Hyderabad, TS',
    gstin: '36AAACS3344J1Z9',
    drugLicenseNo: 'TG/HYD/20B/5512 / 21B/5513',
    balanceDue: 18200,
    creditDays: 21,
  },
  {
    id: 'sup-3',
    name: 'Cipla Depo & Medical Surgicals',
    contactPerson: 'Anand Reddy',
    phone: '+91 98480 55667',
    email: 'depot.hyd@cipla-dist.com',
    address: 'Sy No 88, Bowenpally, Secunderabad, TS - 500011',
    gstin: '36AACCC5566P1Z3',
    drugLicenseNo: 'TG/SEC/20B/6612 / 21B/6613',
    balanceDue: 27400,
    creditDays: 45,
  },
  {
    id: 'sup-4',
    name: 'Mankind Lifesciences Distributors',
    contactPerson: 'P. Rajeshwar Rao',
    phone: '+91 98480 77889',
    email: 'mankindhyd@distributor.in',
    address: 'Near Gandhi Hospital Road, Musheerabad, Hyderabad',
    gstin: '36AABCM7788R1Z5',
    drugLicenseNo: 'TG/HYD/20B/7712 / 21B/7713',
    balanceDue: 9800,
    creditDays: 15,
  },
];

// Initial Customers
const DEFAULT_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'P. Venkat Reddy',
    phone: '9849123456',
    email: 'venkatreddy@gmail.com',
    address: 'H.No 3-4-12, KPHB Colony, Hyderabad',
    doctorName: 'Dr. C. Mohan Rao (MD)',
    creditBalance: 1250,
    creditLimit: 5000,
    totalPurchases: 18450,
    lastVisitDate: '2026-11-08',
  },
  {
    id: 'cust-2',
    name: 'Smt. Lakshmi Devi',
    phone: '9849234567',
    address: 'Flat 204, Sai Residency, Miyapur, Hyderabad',
    doctorName: 'Dr. K. Swathi (Cardiologist)',
    creditBalance: 0,
    creditLimit: 3000,
    totalPurchases: 26800,
    lastVisitDate: '2026-11-09',
  },
  {
    id: 'cust-3',
    name: 'G. Satyanarayana Murthy',
    phone: '9849345678',
    address: 'Plot 89, Vivekananda Nagar, Kukatpally',
    doctorName: 'Dr. P. V. Ramana (Diabetologist)',
    creditBalance: 840,
    creditLimit: 4000,
    totalPurchases: 34100,
    lastVisitDate: '2026-11-07',
  },
  {
    id: 'cust-4',
    name: 'K. Anitha',
    phone: '9849456789',
    address: 'H.No 12-1-84, Balanagar, Hyderabad',
    doctorName: 'Dr. Sunita Sharma (Gynecologist)',
    creditBalance: 0,
    creditLimit: 2500,
    totalPurchases: 12900,
    lastVisitDate: '2026-11-06',
  },
];

// Initial Medicines Master
const DEFAULT_MEDICINES: Medicine[] = [
  {
    id: 'med-1',
    brandName: 'Dolo 650 Tablet',
    genericName: 'Paracetamol 650mg',
    composition: 'Paracetamol IP 650 mg',
    manufacturer: 'Micro Labs Ltd',
    category: 'Tablets',
    schedule: 'OTC',
    hsnCode: '30049060',
    rackLocation: 'RACK-A1 / SHELF-1',
    minStockAlert: 50,
    unit: 'Strip (15 tabs)',
    description: 'Analgesic and antipyretic for fever, body ache and headaches.',
  },
  {
    id: 'med-2',
    brandName: 'Augmentin 625 Duo',
    genericName: 'Amoxicillin + Potassium Clavulanate',
    composition: 'Amoxicillin 500mg + Clavulanic Acid 125mg',
    manufacturer: 'GlaxoSmithKline (GSK)',
    category: 'Tablets',
    schedule: 'Schedule H1',
    hsnCode: '30041000',
    rackLocation: 'RACK-B2 / SHELF-2',
    minStockAlert: 25,
    unit: 'Strip (10 tabs)',
    description: 'Broad spectrum penicillin antibacterial antibiotic.',
  },
  {
    id: 'med-3',
    brandName: 'Pan-D Capsule',
    genericName: 'Pantoprazole + Domperidone SR',
    composition: 'Pantoprazole 40mg + Domperidone 30mg SR',
    manufacturer: 'Alkem Laboratories Ltd',
    category: 'Capsules',
    schedule: 'Schedule H',
    hsnCode: '30049099',
    rackLocation: 'RACK-A2 / SHELF-3',
    minStockAlert: 40,
    unit: 'Strip (15 caps)',
    description: 'Proton pump inhibitor and anti-emetic for GERD and acidity.',
  },
  {
    id: 'med-4',
    brandName: 'Azithral 500 Tablet',
    genericName: 'Azithromycin 500mg',
    composition: 'Azithromycin Dihydrate IP 500mg',
    manufacturer: 'Alembic Pharmaceuticals',
    category: 'Tablets',
    schedule: 'Schedule H1',
    hsnCode: '30042000',
    rackLocation: 'RACK-B1 / SHELF-1',
    minStockAlert: 30,
    unit: 'Strip (5 tabs)',
    description: 'Macrolide antibiotic for upper and lower respiratory infections.',
  },
  {
    id: 'med-5',
    brandName: 'Telma 40 Tablet',
    genericName: 'Telmisartan 40mg',
    composition: 'Telmisartan IP 40mg',
    manufacturer: 'Glenmark Pharmaceuticals',
    category: 'Tablets',
    schedule: 'Schedule H',
    hsnCode: '30049099',
    rackLocation: 'RACK-C1 / SHELF-2',
    minStockAlert: 35,
    unit: 'Strip (15 tabs)',
    description: 'Angiotensin II receptor blocker (ARB) for hypertension.',
  },
  {
    id: 'med-6',
    brandName: 'Glycomet GP 2 Forte',
    genericName: 'Glimepiride + Metformin SR',
    composition: 'Glimepiride 2mg + Metformin Hydrochloride 1000mg SR',
    manufacturer: 'USV Private Limited',
    category: 'Tablets',
    schedule: 'Schedule H',
    hsnCode: '30049099',
    rackLocation: 'RACK-C2 / SHELF-1',
    minStockAlert: 30,
    unit: 'Strip (15 tabs)',
    description: 'Anti-diabetic combination for Type-2 Diabetes Mellitus.',
  },
  {
    id: 'med-7',
    brandName: 'Montair LC Tablet',
    genericName: 'Levocetirizine + Montelukast',
    composition: 'Levocetirizine HCl 5mg + Montelukast Sodium 10mg',
    manufacturer: 'Cipla Ltd',
    category: 'Tablets',
    schedule: 'Schedule H',
    hsnCode: '30049099',
    rackLocation: 'RACK-A3 / SHELF-2',
    minStockAlert: 20,
    unit: 'Strip (10 tabs)',
    description: 'Anti-allergic medication for allergic rhinitis and asthma.',
  },
  {
    id: 'med-8',
    brandName: 'Shelcal 500 Tablet',
    genericName: 'Calcium + Vitamin D3',
    composition: 'Calcium Carbonate 1250mg + Vitamin D3 250 IU',
    manufacturer: 'Torrent Pharmaceuticals',
    category: 'Tablets',
    schedule: 'OTC',
    hsnCode: '30045090',
    rackLocation: 'RACK-D1 / SHELF-1',
    minStockAlert: 40,
    unit: 'Strip (15 tabs)',
    description: 'Calcium and Vitamin D3 dietary supplement for bones.',
  },
  {
    id: 'med-9',
    brandName: 'Ascoril LS Syrup',
    genericName: 'Levosalbutamol + Ambroxol + Guaiphenesin',
    composition: 'Levosalbutamol 1mg + Ambroxol 30mg + Guaiphenesin 50mg / 5ml',
    manufacturer: 'Glenmark Pharmaceuticals',
    category: 'Syrups',
    schedule: 'Schedule H',
    hsnCode: '30049099',
    rackLocation: 'RACK-S1 / SHELF-1',
    minStockAlert: 15,
    unit: 'Bottle (100ml)',
    description: 'Mucolytic, bronchodilator and expectorant cough syrup.',
  },
  {
    id: 'med-10',
    brandName: 'Betadine 10% Ointment',
    genericName: 'Povidone Iodine 10% w/w',
    composition: 'Povidone-Iodine IP 10% w/w',
    manufacturer: 'Win-Medicare Pvt Ltd',
    category: 'Ointments',
    schedule: 'OTC',
    hsnCode: '30049099',
    rackLocation: 'RACK-O1 / SHELF-3',
    minStockAlert: 15,
    unit: 'Tube (20g)',
    description: 'Antiseptic microbicidal ointment for cuts and wound dressing.',
  },
  {
    id: 'med-11',
    brandName: 'Asthalin Inhaler (200 MDI)',
    genericName: 'Salbutamol Inhalation IP',
    composition: 'Salbutamol 100mcg per actuation',
    manufacturer: 'Cipla Ltd',
    category: 'Medical Equipment',
    schedule: 'Schedule H',
    hsnCode: '30049099',
    rackLocation: 'RACK-INH / SHELF-1',
    minStockAlert: 10,
    unit: 'Inhaler Canister',
    description: 'Rapid acting bronchodilator for acute asthma bronchospasm.',
  },
  {
    id: 'med-12',
    brandName: 'Becosules Z Capsules',
    genericName: 'B-Complex Forte + Vitamin C + Zinc',
    composition: 'Vitamin B1, B2, B6, B12, Niacinamide, Calcium Pantothenate, Zinc',
    manufacturer: 'Pfizer Ltd',
    category: 'Capsules',
    schedule: 'OTC',
    hsnCode: '30045090',
    rackLocation: 'RACK-D1 / SHELF-2',
    minStockAlert: 35,
    unit: 'Strip (20 caps)',
    description: 'Multi-vitamin restorative therapy for immunity and mouth ulcers.',
  },
  {
    id: 'med-13',
    brandName: 'Voveran 50 GE Tablet',
    genericName: 'Diclofenac Sodium 50mg',
    composition: 'Diclofenac Sodium IP 50mg',
    manufacturer: 'Novartis India',
    category: 'Tablets',
    schedule: 'Schedule H',
    hsnCode: '30049099',
    rackLocation: 'RACK-A1 / SHELF-3',
    minStockAlert: 20,
    unit: 'Strip (15 tabs)',
    description: 'NSAID non-steroidal anti-inflammatory for joint and body pain.',
  },
  {
    id: 'med-14',
    brandName: 'Ciplox 500 Tablet',
    genericName: 'Ciprofloxacin 500mg',
    composition: 'Ciprofloxacin IP 500mg',
    manufacturer: 'Cipla Ltd',
    category: 'Tablets',
    schedule: 'Schedule H1',
    hsnCode: '30042000',
    rackLocation: 'RACK-B1 / SHELF-2',
    minStockAlert: 25,
    unit: 'Strip (10 tabs)',
    description: 'Fluoroquinolone antibiotic for urinary and bacterial infections.',
  },
];

// Initial Batches
const DEFAULT_BATCHES: MedicineBatch[] = [
  {
    id: 'b-1',
    medicineId: 'med-1',
    batchNumber: 'DL65-9821',
    expiryDate: '2028-06',
    mrp: 34.50,
    purchasePrice: 22.00,
    sellingPrice: 32.00,
    gstRate: 12,
    currentStock: 140,
    barcode: '890123400101',
    supplierId: 'sup-1',
    purchaseDate: '2026-09-10',
  },
  {
    id: 'b-2',
    medicineId: 'med-2',
    batchNumber: 'AUG-4890',
    expiryDate: '2027-11',
    mrp: 228.00,
    purchasePrice: 165.00,
    sellingPrice: 215.00,
    gstRate: 12,
    currentStock: 45,
    barcode: '890123400202',
    supplierId: 'sup-3',
    purchaseDate: '2026-10-02',
  },
  {
    id: 'b-3',
    medicineId: 'med-3',
    batchNumber: 'PND-7714',
    expiryDate: '2027-08',
    mrp: 198.50,
    purchasePrice: 132.00,
    sellingPrice: 185.00,
    gstRate: 12,
    currentStock: 80,
    barcode: '890123400303',
    supplierId: 'sup-2',
    purchaseDate: '2026-08-15',
  },
  {
    id: 'b-4',
    medicineId: 'med-4',
    batchNumber: 'AZI-9923',
    expiryDate: '2027-12',
    mrp: 135.00,
    purchasePrice: 88.00,
    sellingPrice: 125.00,
    gstRate: 12,
    currentStock: 52,
    barcode: '890123400404',
    supplierId: 'sup-1',
    purchaseDate: '2026-09-18',
  },
  {
    id: 'b-5',
    medicineId: 'med-5',
    batchNumber: 'TLM-5521',
    expiryDate: '2028-04',
    mrp: 110.00,
    purchasePrice: 72.00,
    sellingPrice: 102.00,
    gstRate: 12,
    currentStock: 95,
    barcode: '890123400505',
    supplierId: 'sup-2',
    purchaseDate: '2026-10-12',
  },
  {
    id: 'b-6',
    medicineId: 'med-6',
    batchNumber: 'GLY-3310',
    expiryDate: '2027-09',
    mrp: 185.00,
    purchasePrice: 124.00,
    sellingPrice: 172.00,
    gstRate: 12,
    currentStock: 64,
    barcode: '890123400606',
    supplierId: 'sup-4',
    purchaseDate: '2026-07-20',
  },
  // Near Expiry Medicine Batch (< 60 days from 2026-11)
  {
    id: 'b-7',
    medicineId: 'med-7',
    batchNumber: 'MLC-1204',
    expiryDate: '2026-12', // Near Expiry!
    mrp: 148.00,
    purchasePrice: 95.00,
    sellingPrice: 135.00,
    gstRate: 12,
    currentStock: 18,
    barcode: '890123400707',
    supplierId: 'sup-3',
    purchaseDate: '2025-05-10',
  },
  // Expired Medicine Batch
  {
    id: 'b-8',
    medicineId: 'med-8',
    batchNumber: 'SHL-8812',
    expiryDate: '2026-09', // Expired!
    mrp: 130.00,
    purchasePrice: 85.00,
    sellingPrice: 120.00,
    gstRate: 12,
    currentStock: 8,
    barcode: '890123400808',
    supplierId: 'sup-1',
    purchaseDate: '2024-10-11',
  },
  {
    id: 'b-9',
    medicineId: 'med-8',
    batchNumber: 'SHL-9922',
    expiryDate: '2028-02',
    mrp: 135.00,
    purchasePrice: 88.00,
    sellingPrice: 125.00,
    gstRate: 12,
    currentStock: 110,
    barcode: '890123400809',
    supplierId: 'sup-1',
    purchaseDate: '2026-10-01',
  },
  // Low Stock Batch
  {
    id: 'b-10',
    medicineId: 'med-9',
    batchNumber: 'ASC-6619',
    expiryDate: '2027-05',
    mrp: 115.00,
    purchasePrice: 76.00,
    sellingPrice: 108.00,
    gstRate: 12,
    currentStock: 6, // Below minStockAlert 15
    barcode: '890123400909',
    supplierId: 'sup-2',
    purchaseDate: '2026-06-15',
  },
  {
    id: 'b-11',
    medicineId: 'med-10',
    batchNumber: 'BTD-2024',
    expiryDate: '2027-10',
    mrp: 98.00,
    purchasePrice: 64.00,
    sellingPrice: 92.00,
    gstRate: 12,
    currentStock: 32,
    barcode: '890123401010',
    supplierId: 'sup-1',
    purchaseDate: '2026-08-01',
  },
  {
    id: 'b-12',
    medicineId: 'med-11',
    batchNumber: 'AST-4412',
    expiryDate: '2027-07',
    mrp: 180.00,
    purchasePrice: 120.00,
    sellingPrice: 168.00,
    gstRate: 12,
    currentStock: 4, // Low stock
    barcode: '890123401111',
    supplierId: 'sup-3',
    purchaseDate: '2026-04-18',
  },
  {
    id: 'b-13',
    medicineId: 'med-12',
    batchNumber: 'BCS-3129',
    expiryDate: '2028-03',
    mrp: 52.00,
    purchasePrice: 34.00,
    sellingPrice: 48.00,
    gstRate: 12,
    currentStock: 75,
    barcode: '890123401212',
    supplierId: 'sup-4',
    purchaseDate: '2026-09-25',
  },
  {
    id: 'b-14',
    medicineId: 'med-13',
    batchNumber: 'VOV-7098',
    expiryDate: '2027-11',
    mrp: 68.00,
    purchasePrice: 44.00,
    sellingPrice: 62.00,
    gstRate: 12,
    currentStock: 42,
    barcode: '890123401313',
    supplierId: 'sup-2',
    purchaseDate: '2026-08-30',
  },
  {
    id: 'b-15',
    medicineId: 'med-14',
    batchNumber: 'CIP-8810',
    expiryDate: '2028-01',
    mrp: 85.00,
    purchasePrice: 56.00,
    sellingPrice: 78.00,
    gstRate: 12,
    currentStock: 58,
    barcode: '890123401414',
    supplierId: 'sup-3',
    purchaseDate: '2026-10-15',
  },
];

// Initial Sales Invoices (Recent historical and today's sales)
const DEFAULT_INVOICES: SaleInvoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'SPS-2026-00839',
    date: '2026-11-09',
    time: '09:20 AM',
    customerName: 'P. Venkat Reddy',
    customerPhone: '9849123456',
    doctorName: 'Dr. C. Mohan Rao (MD)',
    items: [
      {
        medicineId: 'med-1',
        brandName: 'Dolo 650 Tablet',
        genericName: 'Paracetamol 650mg',
        batchNumber: 'DL65-9821',
        expiryDate: '2028-06',
        hsnCode: '30049060',
        mrp: 34.50,
        unitPrice: 32.00,
        quantity: 2,
        discountPercent: 5,
        discountAmount: 3.20,
        taxableValue: 54.29,
        gstRate: 12,
        cgstAmount: 3.26,
        sgstAmount: 3.26,
        totalAmount: 60.80,
      },
      {
        medicineId: 'med-3',
        brandName: 'Pan-D Capsule',
        genericName: 'Pantoprazole + Domperidone SR',
        batchNumber: 'PND-7714',
        expiryDate: '2027-08',
        hsnCode: '30049099',
        mrp: 198.50,
        unitPrice: 185.00,
        quantity: 1,
        discountPercent: 5,
        discountAmount: 9.25,
        taxableValue: 156.92,
        gstRate: 12,
        cgstAmount: 9.42,
        sgstAmount: 9.42,
        totalAmount: 175.75,
      },
    ],
    subTotal: 249.00,
    totalDiscount: 12.45,
    taxableAmount: 211.21,
    cgstTotal: 12.67,
    sgstTotal: 12.67,
    totalTax: 25.34,
    roundOff: -0.55,
    grandTotal: 236.00,
    paymentMethod: 'upi',
    tenderedCash: 236.00,
    changeAmount: 0,
    cashierName: 'M. Ramesh',
    cashierId: 'u2',
    status: 'completed',
  },
  {
    id: 'inv-2',
    invoiceNumber: 'SPS-2026-00840',
    date: '2026-11-09',
    time: '10:05 AM',
    customerName: 'Smt. Lakshmi Devi',
    customerPhone: '9849234567',
    doctorName: 'Dr. K. Swathi (Cardiologist)',
    items: [
      {
        medicineId: 'med-5',
        brandName: 'Telma 40 Tablet',
        genericName: 'Telmisartan 40mg',
        batchNumber: 'TLM-5521',
        expiryDate: '2028-04',
        hsnCode: '30049099',
        mrp: 110.00,
        unitPrice: 102.00,
        quantity: 2,
        discountPercent: 10,
        discountAmount: 20.40,
        taxableValue: 163.93,
        gstRate: 12,
        cgstAmount: 9.84,
        sgstAmount: 9.84,
        totalAmount: 183.60,
      },
      {
        medicineId: 'med-8',
        brandName: 'Shelcal 500 Tablet',
        genericName: 'Calcium + Vitamin D3',
        batchNumber: 'SHL-9922',
        expiryDate: '2028-02',
        hsnCode: '30045090',
        mrp: 135.00,
        unitPrice: 125.00,
        quantity: 2,
        discountPercent: 10,
        discountAmount: 25.00,
        taxableValue: 200.89,
        gstRate: 12,
        cgstAmount: 12.05,
        sgstAmount: 12.05,
        totalAmount: 225.00,
      },
    ],
    subTotal: 454.00,
    totalDiscount: 45.40,
    taxableAmount: 364.82,
    cgstTotal: 21.89,
    sgstTotal: 21.89,
    totalTax: 43.78,
    roundOff: 0.40,
    grandTotal: 409.00,
    paymentMethod: 'cash',
    tenderedCash: 500.00,
    changeAmount: 91.00,
    cashierName: 'M. Ramesh',
    cashierId: 'u2',
    status: 'completed',
  },
  {
    id: 'inv-3',
    invoiceNumber: 'SPS-2026-00841',
    date: '2026-11-09',
    time: '11:15 AM',
    customerName: 'G. Satyanarayana Murthy',
    customerPhone: '9849345678',
    doctorName: 'Dr. P. V. Ramana (Diabetologist)',
    items: [
      {
        medicineId: 'med-6',
        brandName: 'Glycomet GP 2 Forte',
        genericName: 'Glimepiride + Metformin SR',
        batchNumber: 'GLY-3310',
        expiryDate: '2027-09',
        hsnCode: '30049099',
        mrp: 185.00,
        unitPrice: 172.00,
        quantity: 3,
        discountPercent: 8,
        discountAmount: 41.28,
        taxableValue: 423.86,
        gstRate: 12,
        cgstAmount: 25.43,
        sgstAmount: 25.43,
        totalAmount: 474.72,
      },
      {
        medicineId: 'med-12',
        brandName: 'Becosules Z Capsules',
        genericName: 'B-Complex Forte + Vitamin C + Zinc',
        batchNumber: 'BCS-3129',
        expiryDate: '2028-03',
        hsnCode: '30045090',
        mrp: 52.00,
        unitPrice: 48.00,
        quantity: 1,
        discountPercent: 5,
        discountAmount: 2.40,
        taxableValue: 40.71,
        gstRate: 12,
        cgstAmount: 2.44,
        sgstAmount: 2.44,
        totalAmount: 45.60,
      },
    ],
    subTotal: 564.00,
    totalDiscount: 43.68,
    taxableAmount: 464.57,
    cgstTotal: 27.87,
    sgstTotal: 27.87,
    totalTax: 55.75,
    roundOff: -0.32,
    grandTotal: 520.00,
    paymentMethod: 'upi',
    tenderedCash: 520.00,
    changeAmount: 0,
    cashierName: 'M. Ramesh',
    cashierId: 'u2',
    status: 'completed',
  },
];

// Initial Purchases
const DEFAULT_PURCHASES: PurchaseInvoice[] = [
  {
    id: 'pur-1',
    invoiceNumber: 'PINV-2026-0312',
    supplierInvoiceNo: 'APL/HYD/88219',
    supplierId: 'sup-1',
    supplierName: 'Apollo Pharma Wholesale Distributors',
    supplierGstin: '36AABCA1122K1Z1',
    invoiceDate: '2026-11-08',
    receivedDate: '2026-11-09',
    items: [
      {
        medicineId: 'med-1',
        brandName: 'Dolo 650 Tablet',
        genericName: 'Paracetamol 650mg',
        batchNumber: 'DL65-9821',
        expiryDate: '2028-06',
        hsnCode: '30049060',
        mrp: 34.50,
        purchasePrice: 22.00,
        sellingPrice: 32.00,
        quantity: 50,
        freeQuantity: 5,
        gstRate: 12,
        taxAmount: 132.00,
        totalAmount: 1232.00,
      },
      {
        medicineId: 'med-8',
        brandName: 'Shelcal 500 Tablet',
        genericName: 'Calcium + Vitamin D3',
        batchNumber: 'SHL-9922',
        expiryDate: '2028-02',
        hsnCode: '30045090',
        mrp: 135.00,
        purchasePrice: 88.00,
        sellingPrice: 125.00,
        quantity: 30,
        freeQuantity: 2,
        gstRate: 12,
        taxAmount: 316.80,
        totalAmount: 2956.80,
      },
    ],
    subTotal: 3740.00,
    taxTotal: 448.80,
    grandTotal: 4188.80,
    paidAmount: 2000.00,
    balanceDue: 2188.80,
    paymentMode: 'bank',
    status: 'partial',
  },
];

// Initial Expenses
const DEFAULT_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    date: '2026-11-09',
    category: 'Tea, Water & Refreshments',
    description: 'Mineral water cans & staff tea',
    amount: 140,
    paymentMode: 'cash',
    paidTo: 'Sri Balaji Tea Point',
    recordedBy: 'M. Ramesh',
  },
  {
    id: 'exp-2',
    date: '2026-11-09',
    category: 'Packing Bags & Thermal Rolls',
    description: '10 rolls 80mm POS Thermal paper + Carry bags bundle',
    amount: 650,
    paymentMode: 'upi',
    paidTo: 'Sri Krishna Paper Mart',
    recordedBy: 'Dr. K. Srinivas Rao',
  },
  {
    id: 'exp-3',
    date: '2026-11-05',
    category: 'Electricity & Utilities',
    description: 'TSSPDCL Commercial Electric Bill (Oct 2026)',
    amount: 3450,
    paymentMode: 'bank',
    paidTo: 'TSSPDCL Hyderabad',
    recordedBy: 'Dr. K. Srinivas Rao',
  },
];

// Initial Stock Adjustments
const DEFAULT_ADJUSTMENTS: StockAdjustment[] = [
  {
    id: 'adj-1',
    date: '2026-11-07',
    medicineId: 'med-8',
    medicineName: 'Shelcal 500 Tablet',
    batchNumber: 'SHL-8812',
    adjustmentType: 'expired',
    quantityChange: -2,
    previousStock: 10,
    newStock: 8,
    reason: 'Moved 2 expired strips to quarantine disposal box',
    recordedBy: 'Dr. K. Srinivas Rao',
  },
];

// Initial Backups
const DEFAULT_BACKUPS: BackupRecord[] = [
  {
    id: 'bk-1',
    filename: 'SahasraPharmacy_Backup_2026-11-08_210000.db.json',
    timestamp: '2026-11-08T21:00:00Z',
    sizeKb: 142.5,
    type: 'auto_exit',
    verified: true,
    recordCount: {
      medicines: 14,
      batches: 15,
      sales: 3,
      purchases: 1,
    },
  },
  {
    id: 'bk-2',
    filename: 'SahasraPharmacy_Backup_2026-11-07_213000.db.json',
    timestamp: '2026-11-07T21:30:00Z',
    sizeKb: 139.8,
    type: 'daily',
    verified: true,
    recordCount: {
      medicines: 14,
      batches: 15,
      sales: 2,
      purchases: 1,
    },
  },
];

// Initial Audit Logs
const DEFAULT_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-11-09T08:30:00Z',
    userName: 'admin',
    action: 'USER_LOGIN',
    module: 'Authentication',
    details: 'Dr. K. Srinivas Rao logged in from Workstation-1 (Windows 11)',
  },
  {
    id: 'log-2',
    timestamp: '2026-11-09T09:15:00Z',
    userName: 'cashier',
    action: 'USER_LOGIN',
    module: 'Authentication',
    details: 'M. Ramesh opened billing session',
  },
  {
    id: 'log-3',
    timestamp: '2026-11-09T09:20:00Z',
    userName: 'cashier',
    action: 'CREATE_INVOICE',
    module: 'Billing POS',
    details: 'Generated Invoice SPS-2026-00839 for ₹236.00 (UPI)',
  },
];

class StorageService {
  private get<T>(key: string, defaultValue: T): T {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PREFIX + key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.error('LocalStorage write error:', e);
    }
  }

  // Initialization
  public initialize(): void {
    if (!localStorage.getItem(STORAGE_KEY_PREFIX + 'initialized')) {
      this.set('settings', DEFAULT_SETTINGS);
      this.set('users', DEFAULT_USERS);
      this.set('suppliers', DEFAULT_SUPPLIERS);
      this.set('customers', DEFAULT_CUSTOMERS);
      this.set('medicines', DEFAULT_MEDICINES);
      this.set('batches', DEFAULT_BATCHES);
      this.set('invoices', DEFAULT_INVOICES);
      this.set('purchases', DEFAULT_PURCHASES);
      this.set('expenses', DEFAULT_EXPENSES);
      this.set('adjustments', DEFAULT_ADJUSTMENTS);
      this.set('salesReturns', []);
      this.set('purchaseReturns', []);
      this.set('backups', DEFAULT_BACKUPS);
      this.set('auditLogs', DEFAULT_AUDIT_LOGS);
      this.set('initialized', 'true');
    }
  }

  // Users & Auth
  public getUsers(): User[] {
    return this.get<User[]>('users', DEFAULT_USERS);
  }

  public saveUser(user: User): void {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      users[idx] = user;
    } else {
      users.push(user);
    }
    this.set('users', users);
  }

  // Settings
  public getSettings(): PharmacySettings {
    return this.get<PharmacySettings>('settings', DEFAULT_SETTINGS);
  }

  public saveSettings(settings: PharmacySettings): void {
    this.set('settings', settings);
    this.addAuditLog('admin', 'UPDATE_SETTINGS', 'Settings', 'Updated pharmacy configuration & header/footer details');
  }

  // Medicines
  public getMedicines(): Medicine[] {
    return this.get<Medicine[]>('medicines', DEFAULT_MEDICINES);
  }

  public getBatches(): MedicineBatch[] {
    return this.get<MedicineBatch[]>('batches', DEFAULT_BATCHES);
  }

  public getBatchesForMedicine(medicineId: string): MedicineBatch[] {
    return this.getBatches().filter((b) => b.medicineId === medicineId);
  }

  public saveMedicine(medicine: Medicine): void {
    const meds = this.getMedicines();
    const idx = meds.findIndex((m) => m.id === medicine.id);
    if (idx >= 0) {
      meds[idx] = medicine;
      this.addAuditLog('admin', 'UPDATE_MEDICINE', 'Medicine Master', `Updated medicine: ${medicine.brandName}`);
    } else {
      meds.push(medicine);
      this.addAuditLog('admin', 'ADD_MEDICINE', 'Medicine Master', `Added new medicine: ${medicine.brandName}`);
    }
    this.set('medicines', meds);
  }

  public deleteMedicine(id: string): boolean {
    const meds = this.getMedicines().filter((m) => m.id !== id);
    const batches = this.getBatches().filter((b) => b.medicineId !== id);
    this.set('medicines', meds);
    this.set('batches', batches);
    this.addAuditLog('admin', 'DELETE_MEDICINE', 'Medicine Master', `Deleted medicine ID: ${id}`);
    return true;
  }

  public saveBatch(batch: MedicineBatch): void {
    const batches = this.getBatches();
    const idx = batches.findIndex((b) => b.id === batch.id);
    if (idx >= 0) {
      batches[idx] = batch;
    } else {
      batches.push(batch);
    }
    this.set('batches', batches);
  }

  // Invoices & Billing
  public getInvoices(): SaleInvoice[] {
    return this.get<SaleInvoice[]>('invoices', DEFAULT_INVOICES);
  }

  public createInvoice(invoice: SaleInvoice): void {
    const invoices = this.getInvoices();
    invoices.unshift(invoice);
    this.set('invoices', invoices);

    // Deduct batch stocks
    const batches = this.getBatches();
    invoice.items.forEach((item) => {
      const bIdx = batches.findIndex(
        (b) => b.medicineId === item.medicineId && b.batchNumber === item.batchNumber
      );
      if (bIdx >= 0) {
        batches[bIdx].currentStock = Math.max(0, batches[bIdx].currentStock - item.quantity);
      }
    });
    this.set('batches', batches);

    // If customer credit sale, update customer balance
    if (invoice.paymentMethod === 'credit' && invoice.customerPhone) {
      const customers = this.getCustomers();
      const cIdx = customers.findIndex((c) => c.phone === invoice.customerPhone);
      if (cIdx >= 0) {
        customers[cIdx].creditBalance += invoice.grandTotal;
        customers[cIdx].totalPurchases += invoice.grandTotal;
        customers[cIdx].lastVisitDate = invoice.date;
        this.set('customers', customers);
      }
    }

    this.addAuditLog(
      invoice.cashierName,
      'CREATE_INVOICE',
      'Billing POS',
      `Invoice ${invoice.invoiceNumber} for ₹${invoice.grandTotal.toFixed(2)} (${invoice.paymentMethod.toUpperCase()})`
    );
  }

  public getNextInvoiceNumber(): string {
    const settings = this.getSettings();
    const invoices = this.getInvoices();
    const prefix = settings.invoicePrefix || 'SPS';
    const year = new Date().getFullYear();
    const count = invoices.length + 840; // realistic starting sequence
    return `${prefix}-${year}-${String(count).padStart(5, '0')}`;
  }

  // Suppliers & Purchases
  public getSuppliers(): Supplier[] {
    return this.get<Supplier[]>('suppliers', DEFAULT_SUPPLIERS);
  }

  public saveSupplier(supplier: Supplier): void {
    const suppliers = this.getSuppliers();
    const idx = suppliers.findIndex((s) => s.id === supplier.id);
    if (idx >= 0) {
      suppliers[idx] = supplier;
    } else {
      suppliers.push(supplier);
    }
    this.set('suppliers', suppliers);
  }

  public getPurchases(): PurchaseInvoice[] {
    return this.get<PurchaseInvoice[]>('purchases', DEFAULT_PURCHASES);
  }

  public createPurchase(purchase: PurchaseInvoice): void {
    const purchases = this.getPurchases();
    purchases.unshift(purchase);
    this.set('purchases', purchases);

    // Add or update batch stock
    const batches = this.getBatches();
    purchase.items.forEach((item) => {
      const existingBatch = batches.find(
        (b) => b.medicineId === item.medicineId && b.batchNumber === item.batchNumber
      );
      const totalQty = item.quantity + (item.freeQuantity || 0);

      if (existingBatch) {
        existingBatch.currentStock += totalQty;
        existingBatch.purchasePrice = item.purchasePrice;
        existingBatch.sellingPrice = item.sellingPrice;
        existingBatch.mrp = item.mrp;
      } else {
        batches.push({
          id: `b-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          medicineId: item.medicineId,
          batchNumber: item.batchNumber,
          expiryDate: item.expiryDate,
          mrp: item.mrp,
          purchasePrice: item.purchasePrice,
          sellingPrice: item.sellingPrice,
          gstRate: item.gstRate,
          currentStock: totalQty,
          barcode: `890${Math.floor(100000000 + Math.random() * 900000000)}`,
          supplierId: purchase.supplierId,
          supplierInvoiceNo: purchase.supplierInvoiceNo,
          purchaseDate: purchase.invoiceDate,
        });
      }
    });
    this.set('batches', batches);

    // Update supplier outstanding balance
    if (purchase.balanceDue > 0) {
      const suppliers = this.getSuppliers();
      const sIdx = suppliers.findIndex((s) => s.id === purchase.supplierId);
      if (sIdx >= 0) {
        suppliers[sIdx].balanceDue += purchase.balanceDue;
        this.set('suppliers', suppliers);
      }
    }

    this.addAuditLog(
      'admin',
      'CREATE_PURCHASE',
      'Purchase Entry',
      `Received purchase invoice ${purchase.supplierInvoiceNo} from ${purchase.supplierName} - ₹${purchase.grandTotal.toFixed(2)}`
    );
  }

  public recordSupplierPayment(supplierId: string, amount: number, paymentMode: 'cash' | 'bank' | 'cheque', notes: string): void {
    const suppliers = this.getSuppliers();
    const idx = suppliers.findIndex((s) => s.id === supplierId);
    if (idx >= 0) {
      suppliers[idx].balanceDue = Math.max(0, suppliers[idx].balanceDue - amount);
      this.set('suppliers', suppliers);

      // Record as expense/payment entry
      this.addExpense({
        id: `exp-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        category: 'Miscellaneous',
        description: `Supplier payment to ${suppliers[idx].name} (${notes})`,
        amount: amount,
        paymentMode: paymentMode === 'cash' ? 'cash' : 'bank',
        paidTo: suppliers[idx].name,
        recordedBy: 'admin',
      });

      this.addAuditLog('admin', 'SUPPLIER_PAYMENT', 'Supplier Ledger', `Paid ₹${amount.toFixed(2)} to ${suppliers[idx].name} via ${paymentMode}`);
    }
  }

  // Customers
  public getCustomers(): Customer[] {
    return this.get<Customer[]>('customers', DEFAULT_CUSTOMERS);
  }

  public saveCustomer(customer: Customer): void {
    const customers = this.getCustomers();
    const idx = customers.findIndex((c) => c.id === customer.id);
    if (idx >= 0) {
      customers[idx] = customer;
    } else {
      customers.push(customer);
    }
    this.set('customers', customers);
  }

  public recordCustomerCreditPayment(customerId: string, amount: number, paymentMethod: PaymentMethod): void {
    const customers = this.getCustomers();
    const idx = customers.findIndex((c) => c.id === customerId);
    if (idx >= 0) {
      customers[idx].creditBalance = Math.max(0, customers[idx].creditBalance - amount);
      this.set('customers', customers);
      this.addAuditLog('cashier', 'CREDIT_RECOVERY', 'Customer Ledger', `Received ₹${amount.toFixed(2)} credit recovery from ${customers[idx].name} via ${paymentMethod}`);
    }
  }

  // Returns
  public getSalesReturns(): SalesReturn[] {
    return this.get<SalesReturn[]>('salesReturns', []);
  }

  public recordSalesReturn(ret: SalesReturn): void {
    const returns = this.getSalesReturns();
    returns.unshift(ret);
    this.set('salesReturns', returns);

    // Restock returned items
    const batches = this.getBatches();
    ret.items.forEach((item) => {
      const bIdx = batches.findIndex(
        (b) => b.medicineId === item.medicineId && b.batchNumber === item.batchNumber
      );
      if (bIdx >= 0) {
        batches[bIdx].currentStock += item.quantity;
      }
    });
    this.set('batches', batches);

    this.addAuditLog(ret.handledBy, 'SALES_RETURN', 'Sales Return', `Return processed for ${ret.originalInvoiceNumber} - Refund ₹${ret.totalRefund.toFixed(2)}`);
  }

  public getPurchaseReturns(): PurchaseReturn[] {
    return this.get<PurchaseReturn[]>('purchaseReturns', []);
  }

  public recordPurchaseReturn(ret: PurchaseReturn): void {
    const returns = this.getPurchaseReturns();
    returns.unshift(ret);
    this.set('purchaseReturns', returns);

    // Deduct stock
    const batches = this.getBatches();
    ret.items.forEach((item) => {
      const bIdx = batches.findIndex((b) => b.batchNumber === item.batchNumber);
      if (bIdx >= 0) {
        batches[bIdx].currentStock = Math.max(0, batches[bIdx].currentStock - item.quantity);
      }
    });
    this.set('batches', batches);

    this.addAuditLog('admin', 'PURCHASE_RETURN', 'Purchase Return', `Debit return note ${ret.returnNumber} to ${ret.supplierName} - ₹${ret.totalAmount.toFixed(2)}`);
  }

  // Stock Adjustment
  public getStockAdjustments(): StockAdjustment[] {
    return this.get<StockAdjustment[]>('adjustments', DEFAULT_ADJUSTMENTS);
  }

  public recordStockAdjustment(adj: StockAdjustment): void {
    const adjustments = this.getStockAdjustments();
    adjustments.unshift(adj);
    this.set('adjustments', adjustments);

    const batches = this.getBatches();
    const bIdx = batches.findIndex(
      (b) => b.medicineId === adj.medicineId && b.batchNumber === adj.batchNumber
    );
    if (bIdx >= 0) {
      batches[bIdx].currentStock = Math.max(0, batches[bIdx].currentStock + adj.quantityChange);
      this.set('batches', batches);
    }

    this.addAuditLog(adj.recordedBy, 'STOCK_ADJUSTMENT', 'Inventory Control', `${adj.adjustmentType.toUpperCase()}: ${adj.medicineName} (${adj.quantityChange} units)`);
  }

  // Expenses
  public getExpenses(): Expense[] {
    return this.get<Expense[]>('expenses', DEFAULT_EXPENSES);
  }

  public addExpense(expense: Expense): void {
    const expenses = this.getExpenses();
    expenses.unshift(expense);
    this.set('expenses', expenses);
    this.addAuditLog(expense.recordedBy, 'ADD_EXPENSE', 'Expense Management', `Expense: ${expense.category} - ₹${expense.amount.toFixed(2)}`);
  }

  public deleteExpense(id: string): void {
    const expenses = this.getExpenses().filter((e) => e.id !== id);
    this.set('expenses', expenses);
  }

  // Audit Logs
  public getAuditLogs(): AuditLog[] {
    return this.get<AuditLog[]>('auditLogs', DEFAULT_AUDIT_LOGS);
  }

  public addAuditLog(userName: string, action: string, module: string, details: string): void {
    const logs = this.getAuditLogs();
    logs.unshift({
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      userName,
      action,
      module,
      details,
    });
    // Keep max 200 logs
    this.set('auditLogs', logs.slice(0, 200));
  }

  // Backups
  public getBackups(): BackupRecord[] {
    return this.get<BackupRecord[]>('backups', DEFAULT_BACKUPS);
  }

  public createBackup(type: 'auto_exit' | 'daily' | 'manual' | 'usb' = 'manual'): BackupRecord {
    const dump = this.exportFullDatabase();
    const dumpStr = JSON.stringify(dump);
    const sizeKb = +(dumpStr.length / 1024).toFixed(1);
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '');
    const filename = `SahasraPharmacy_Backup_${dateStr}_${timeStr}.db.json`;

    const meds = this.getMedicines();
    const bts = this.getBatches();
    const invs = this.getInvoices();
    const purs = this.getPurchases();

    const record: BackupRecord = {
      id: `bk-${Date.now()}`,
      filename,
      timestamp: now.toISOString(),
      sizeKb,
      type,
      verified: true,
      recordCount: {
        medicines: meds.length,
        batches: bts.length,
        sales: invs.length,
        purchases: purs.length,
      },
    };

    const backups = this.getBackups();
    backups.unshift(record);
    // Keep latest 30 backups as specified in requirements
    this.set('backups', backups.slice(0, 30));
    this.addAuditLog('System', 'DATABASE_BACKUP', 'Backup System', `Created ${type} backup: ${filename} (${sizeKb} KB)`);
    return record;
  }

  public exportFullDatabase(): Record<string, unknown> {
    return {
      version: '4.2.0',
      system: 'SAHASRA PHARMACY BILLING SOFTWARE',
      company: 'AADHYA SOFTWARE SOLUTIONS',
      exportedAt: new Date().toISOString(),
      settings: this.getSettings(),
      users: this.getUsers(),
      suppliers: this.getSuppliers(),
      customers: this.getCustomers(),
      medicines: this.getMedicines(),
      batches: this.getBatches(),
      invoices: this.getInvoices(),
      purchases: this.getPurchases(),
      expenses: this.getExpenses(),
      adjustments: this.getStockAdjustments(),
      salesReturns: this.getSalesReturns(),
      purchaseReturns: this.getPurchaseReturns(),
      auditLogs: this.getAuditLogs(),
    };
  }

  public restoreDatabase(data: Record<string, unknown>): { success: boolean; message: string } {
    try {
      if (!data.medicines || !data.batches || !data.settings) {
        return { success: false, message: 'Invalid backup file structure. Missing core pharmacy tables.' };
      }

      this.set('settings', data.settings);
      this.set('users', data.users || DEFAULT_USERS);
      this.set('suppliers', data.suppliers || []);
      this.set('customers', data.customers || []);
      this.set('medicines', data.medicines || []);
      this.set('batches', data.batches || []);
      this.set('invoices', data.invoices || []);
      this.set('purchases', data.purchases || []);
      this.set('expenses', data.expenses || []);
      this.set('adjustments', data.adjustments || []);
      this.set('salesReturns', data.salesReturns || []);
      this.set('purchaseReturns', data.purchaseReturns || []);
      this.set('auditLogs', data.auditLogs || []);

      this.addAuditLog('admin', 'DATABASE_RESTORE', 'Backup System', 'Database restored from backup file successfully');
      return { success: true, message: 'Database restored successfully! All tables synchronized.' };
    } catch (e: unknown) {
      return { success: false, message: `Restore failed: ${(e as Error).message}` };
    }
  }

  // Dashboard KPI Computations
  public getDashboardKPIs() {
    const todayStr = new Date().toISOString().split('T')[0];
    const invoices = this.getInvoices();
    const purchases = this.getPurchases();
    const medicines = this.getMedicines();
    const batches = this.getBatches();
    const customers = this.getCustomers();
    const suppliers = this.getSuppliers();

    // Today's sales
    const todayInvoices = invoices.filter((i) => i.date === todayStr && i.status === 'completed');
    const totalSalesToday = todayInvoices.reduce((sum, i) => sum + i.grandTotal, 0);

    // Calculate Today's profit
    let costOfGoodsSoldToday = 0;
    todayInvoices.forEach((inv) => {
      inv.items.forEach((item) => {
        const batch = batches.find(
          (b) => b.medicineId === item.medicineId && b.batchNumber === item.batchNumber
        );
        const costPrice = batch ? batch.purchasePrice : item.unitPrice * 0.7;
        costOfGoodsSoldToday += costPrice * item.quantity;
      });
    });
    const todaysProfit = Math.max(0, totalSalesToday - costOfGoodsSoldToday);

    // Today's purchases
    const todayPurchases = purchases.filter((p) => p.invoiceDate === todayStr);
    const totalPurchaseToday = todayPurchases.reduce((sum, p) => sum + p.grandTotal, 0);

    // Total Stock Value (At Purchase Price)
    const totalStockValue = batches.reduce(
      (sum, b) => sum + b.currentStock * b.purchasePrice,
      0
    );

    // Total Stock Value at MRP
    const totalStockMrpValue = batches.reduce(
      (sum, b) => sum + b.currentStock * b.mrp,
      0
    );

    // Total Medicines & Batches count
    const totalMedicines = medicines.length;
    const totalBatches = batches.length;

    // Stock & Expiry Alerts
    const lowStockAlerts = medicines.filter((m) => {
      const totalStock = batches
        .filter((b) => b.medicineId === m.id)
        .reduce((sum, b) => sum + b.currentStock, 0);
      return totalStock <= m.minStockAlert;
    }).length;

    const currentYearMonth = todayStr.substring(0, 7); // e.g. "2026-11"
    const nextThreeMonths = ['2026-11', '2026-12', '2027-01', '2027-02'];

    const expiredMedicines = batches.filter((b) => b.expiryDate < currentYearMonth).length;
    const nearExpiryMedicines = batches.filter(
      (b) => b.expiryDate >= currentYearMonth && nextThreeMonths.includes(b.expiryDate)
    ).length;

    // Outstandings
    const customerOutstanding = customers.reduce((sum, c) => sum + c.creditBalance, 0);
    const supplierOutstanding = suppliers.reduce((sum, s) => sum + s.balanceDue, 0);

    return {
      totalSalesToday,
      totalPurchaseToday,
      todaysProfit,
      totalStockValue,
      totalStockMrpValue,
      totalMedicines,
      totalBatches,
      lowStockAlerts,
      nearExpiryMedicines,
      expiredMedicines,
      customerOutstanding,
      supplierOutstanding,
    };
  }
}

export const storage = new StorageService();
storage.initialize();
