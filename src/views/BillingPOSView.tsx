import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Printer,
  RotateCcw,
  QrCode,
  CreditCard,
  Banknote,
  BookOpen,
  User,
  Stethoscope,
  Phone,
  Tag,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  PackageCheck,
  Percent,
} from 'lucide-react';
import {
  Medicine,
  MedicineBatch,
  CartItem,
  PaymentMethod,
  SaleInvoice,
  SaleInvoiceItem,
  User as UserType,
} from '../types/pharmacy';
import { storage, playScannerBeep } from '../services/storageService';
import { InvoicePrintModal } from '../components/InvoicePrintModal';

interface BillingPOSViewProps {
  currentUser: UserType | null;
  initialSearchQuery?: string;
}

export const BillingPOSView: React.FC<BillingPOSViewProps> = ({
  currentUser,
  initialSearchQuery = '',
}) => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [batches, setBatches] = useState<MedicineBatch[]>([]);
  const [customers, setCustomers] = useState(storage.getCustomers());

  // Search & Selector State
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [filteredMeds, setFilteredMeds] = useState<Medicine[]>([]);
  const [selectedMed, setSelectedMed] = useState<Medicine | null>(null);
  const [availableBatches, setAvailableBatches] = useState<MedicineBatch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<MedicineBatch | null>(null);
  const [quantityInput, setQuantityInput] = useState<number>(1);
  const [discountPercentInput, setDiscountPercentInput] = useState<number>(0);

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [heldCarts, setHeldCarts] = useState<{ id: string; timestamp: string; customer: string; items: CartItem[] }[]>([]);

  // Customer / Patient Details
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [tenderedCash, setTenderedCash] = useState<string>('');

  // Modals & Popups
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [completedInvoice, setCompletedInvoice] = useState<SaleInvoice | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load database
  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setMedicines(storage.getMedicines());
    setBatches(storage.getBatches());
    setCustomers(storage.getCustomers());
  };

  // Filter medicines as user types
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredMeds([]);
      return;
    }

    const q = searchQuery.toLowerCase().trim();
    // Check if barcode match
    const barcodeBatch = batches.find((b) => b.barcode === q);
    if (barcodeBatch) {
      const parentMed = medicines.find((m) => m.id === barcodeBatch.medicineId);
      if (parentMed) {
        handleSelectMedicine(parentMed, barcodeBatch);
        setSearchQuery('');
        return;
      }
    }

    const results = medicines.filter(
      (m) =>
        m.brandName.toLowerCase().includes(q) ||
        m.genericName.toLowerCase().includes(q) ||
        m.composition.toLowerCase().includes(q) ||
        m.rackLocation.toLowerCase().includes(q)
    );
    setFilteredMeds(results.slice(0, 8));
  }, [searchQuery, medicines, batches]);

  // Select a medicine
  const handleSelectMedicine = (med: Medicine, preselectedBatch?: MedicineBatch) => {
    setSelectedMed(med);
    const medBatches = batches.filter((b) => b.medicineId === med.id && b.currentStock > 0);
    setAvailableBatches(medBatches);

    if (preselectedBatch) {
      setSelectedBatch(preselectedBatch);
    } else if (medBatches.length > 0) {
      // Auto-select batch with earliest expiry (FEFO - First Expired First Out)
      const sorted = [...medBatches].sort((a, b) => a.expiryDate.localeCompare(b.expiryDate));
      setSelectedBatch(sorted[0]);
    } else {
      setSelectedBatch(null);
    }

    setQuantityInput(1);
    setDiscountPercentInput(0);
    setFilteredMeds([]);
  };

  // Add selected item to cart
  const handleAddToCart = () => {
    if (!selectedMed || !selectedBatch) return;
    if (quantityInput <= 0) return;

    if (quantityInput > selectedBatch.currentStock) {
      alert(`Warning: Only ${selectedBatch.currentStock} units available in Batch ${selectedBatch.batchNumber}`);
      return;
    }

    // Check if item + batch already exists in cart
    const existingIndex = cart.findIndex(
      (item) => item.medicineId === selectedMed.id && item.batchId === selectedBatch.id
    );

    const newCart = [...cart];
    if (existingIndex >= 0) {
      const newQty = newCart[existingIndex].quantity + quantityInput;
      if (newQty > selectedBatch.currentStock) {
        alert(`Cannot add more than available stock (${selectedBatch.currentStock})`);
        return;
      }
      newCart[existingIndex].quantity = newQty;
      newCart[existingIndex].discountPercent = discountPercentInput;
    } else {
      newCart.push({
        medicineId: selectedMed.id,
        brandName: selectedMed.brandName,
        genericName: selectedMed.genericName,
        batchId: selectedBatch.id,
        batchNumber: selectedBatch.batchNumber,
        expiryDate: selectedBatch.expiryDate,
        hsnCode: selectedMed.hsnCode,
        rackLocation: selectedMed.rackLocation,
        mrp: selectedBatch.mrp,
        unitPrice: selectedBatch.sellingPrice,
        quantity: quantityInput,
        discountPercent: discountPercentInput,
        gstRate: selectedBatch.gstRate,
        availableStock: selectedBatch.currentStock,
      });
    }

    // Play scanner beep
    playScannerBeep();

    setCart(newCart);
    setSelectedMed(null);
    setSelectedBatch(null);
    setSearchQuery('');
    setQuantityInput(1);
    setDiscountPercentInput(0);

    // Refocus search bar
    searchInputRef.current?.focus();
  };

  // Update item quantity in cart
  const handleUpdateQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(index);
      return;
    }
    const item = cart[index];
    if (newQty > item.availableStock) {
      alert(`Maximum stock available: ${item.availableStock}`);
      return;
    }
    const newCart = [...cart];
    newCart[index].quantity = newQty;
    setCart(newCart);
  };

  // Update item discount %
  const handleUpdateDiscount = (index: number, disc: number) => {
    const newCart = [...cart];
    newCart[index].discountPercent = Math.min(100, Math.max(0, disc));
    setCart(newCart);
  };

  // Remove item from cart
  const handleRemoveItem = (index: number) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
  };

  // Autocomplete customer info if phone is entered
  const handlePhoneChange = (phone: string) => {
    setCustomerPhone(phone);
    const existing = customers.find((c) => c.phone === phone);
    if (existing) {
      setCustomerName(existing.name);
      if (existing.doctorName && !doctorName) {
        setDoctorName(existing.doctorName);
      }
    }
  };

  // Financial Computations for Cart
  const subTotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const totalDiscount = cart.reduce((sum, item) => {
    const itemSub = item.unitPrice * item.quantity;
    return sum + (itemSub * item.discountPercent) / 100;
  }, 0);

  const taxableAmount = cart.reduce((sum, item) => {
    const itemGross = item.unitPrice * item.quantity * (1 - item.discountPercent / 100);
    // GST inclusive formula: Taxable = Gross / (1 + GST%/100)
    return sum + itemGross / (1 + item.gstRate / 100);
  }, 0);

  const totalTax = cart.reduce((sum, item) => {
    const itemGross = item.unitPrice * item.quantity * (1 - item.discountPercent / 100);
    const base = itemGross / (1 + item.gstRate / 100);
    return sum + (itemGross - base);
  }, 0);

  const cgstTotal = +(totalTax / 2).toFixed(2);
  const sgstTotal = +(totalTax / 2).toFixed(2);

  const rawGrandTotal = subTotal - totalDiscount;
  const grandTotal = Math.round(rawGrandTotal);
  const roundOff = +(grandTotal - rawGrandTotal).toFixed(2);

  const tenderedNum = parseFloat(tenderedCash) || 0;
  const changeAmount = paymentMethod === 'cash' && tenderedNum > grandTotal ? +(tenderedNum - grandTotal).toFixed(2) : 0;

  // Complete and Print Invoice (F9)
  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Cannot checkout empty cart! Add at least one medicine item.');
      return;
    }

    if (paymentMethod === 'credit' && !customerPhone) {
      alert('Customer mobile number is mandatory for Credit book entries!');
      return;
    }

    const now = new Date();
    const invoiceItems: SaleInvoiceItem[] = cart.map((item) => {
      const gross = item.unitPrice * item.quantity;
      const discAmt = (gross * item.discountPercent) / 100;
      const net = gross - discAmt;
      const base = net / (1 + item.gstRate / 100);
      const tax = net - base;

      return {
        medicineId: item.medicineId,
        brandName: item.brandName,
        genericName: item.genericName,
        batchNumber: item.batchNumber,
        expiryDate: item.expiryDate,
        hsnCode: item.hsnCode,
        mrp: item.mrp,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        discountPercent: item.discountPercent,
        discountAmount: +discAmt.toFixed(2),
        taxableValue: +base.toFixed(2),
        gstRate: item.gstRate,
        cgstAmount: +(tax / 2).toFixed(2),
        sgstAmount: +(tax / 2).toFixed(2),
        totalAmount: +net.toFixed(2),
      };
    });

    const invoice: SaleInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: storage.getNextInvoiceNumber(),
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      customerName: customerName.trim() || 'Walk-in Patient',
      customerPhone: customerPhone.trim(),
      doctorName: doctorName.trim() || 'Self / Direct OTC',
      items: invoiceItems,
      subTotal: +subTotal.toFixed(2),
      totalDiscount: +totalDiscount.toFixed(2),
      taxableAmount: +taxableAmount.toFixed(2),
      cgstTotal,
      sgstTotal,
      totalTax: +totalTax.toFixed(2),
      roundOff,
      grandTotal,
      paymentMethod,
      tenderedCash: paymentMethod === 'cash' ? tenderedNum || grandTotal : grandTotal,
      changeAmount,
      cashierName: currentUser?.fullName || 'Active Pharmacist',
      cashierId: currentUser?.id || 'u1',
      status: 'completed',
    };

    // Save to storage
    storage.createInvoice(invoice);
    refreshData();

    // Show print dialog immediately
    setCompletedInvoice(invoice);

    // Clear cart and customer info
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setDoctorName('');
    setTenderedCash('');
    setPaymentMethod('cash');
  };

  // Hold / Park current bill
  const handleHoldBill = () => {
    if (cart.length === 0) return;
    const held = {
      id: `held-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      customer: customerName || 'Walk-in',
      items: [...cart],
    };
    setHeldCarts([...heldCarts, held]);
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setDoctorName('');
  };

  // Recall held bill
  const handleRecallBill = (heldId: string) => {
    const target = heldCarts.find((h) => h.id === heldId);
    if (target) {
      setCart(target.items);
      setCustomerName(target.customer === 'Walk-in' ? '' : target.customer);
      setHeldCarts(heldCarts.filter((h) => h.id !== heldId));
    }
  };

  // Clear current cart (Esc)
  const handleClearCart = () => {
    if (cart.length > 0 && confirm('Are you sure you want to discard the current bill?')) {
      setCart([]);
      setSelectedMed(null);
      setSelectedBatch(null);
      setCustomerName('');
      setCustomerPhone('');
      setDoctorName('');
    }
  };

  // Keyboard shortcut listener (F1: Focus Search, F9: Checkout, Esc: Clear)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'F9') {
        e.preventDefault();
        handleCheckout();
      } else if (e.key === 'Escape' && cart.length > 0) {
        handleClearCart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, customerName, customerPhone, doctorName, paymentMethod, tenderedCash]);

  return (
    <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-5.5rem)] select-none overflow-hidden">
      {/* Left Column: Fast Item Search & Billing Cart (8 Cols) */}
      <div className="lg:col-span-8 flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {/* Top Search Bar & Scanner Input */}
        <div className="p-3 bg-slate-950 border-b border-slate-800 space-y-2 shrink-0">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Scan barcode or type brand / generic medicine name (Press F1)..."
                className="w-full h-10 pl-9 pr-3 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            </div>

            {heldCarts.length > 0 && (
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleRecallBill(heldCarts[0].id)}
                  className="px-3 h-10 bg-amber-950/60 border border-amber-800/80 text-amber-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-amber-900/60 transition-colors"
                >
                  <PlayCircle className="w-4 h-4 text-amber-400" />
                  <span>Resume Bill ({heldCarts.length})</span>
                </button>
              </div>
            )}
          </div>

          {/* Typeahead Search Results Dropdown */}
          {filteredMeds.length > 0 && (
            <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-xl divide-y divide-slate-800 max-h-56 overflow-y-auto">
              {filteredMeds.map((med) => {
                const medBatches = batches.filter((b) => b.medicineId === med.id);
                const totalStock = medBatches.reduce((s, b) => s + b.currentStock, 0);

                return (
                  <div
                    key={med.id}
                    onClick={() => handleSelectMedicine(med)}
                    className="p-2.5 hover:bg-slate-800 cursor-pointer flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <div className="font-bold text-slate-100 flex items-center gap-2">
                        <span>{med.brandName}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                          {med.schedule}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        <span>{med.genericName}</span> · <span>{med.manufacturer}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono text-cyan-300 font-bold">
                        {med.rackLocation}
                      </div>
                      <div
                        className={`text-[11px] font-mono font-semibold ${
                          totalStock > med.minStockAlert ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        Stock: {totalStock} {med.unit}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Active Medicine Batch Selector Bar */}
          {selectedMed && (
            <div className="p-3 bg-cyan-950/30 border border-cyan-800/50 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in">
              <div className="min-w-0">
                <span className="font-bold text-cyan-300 text-sm">{selectedMed.brandName}</span>
                <span className="text-slate-400 text-xs ml-2">({selectedMed.rackLocation})</span>
              </div>

              {/* Batch Selector Dropdown */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Batch:</span>
                  <select
                    value={selectedBatch?.id || ''}
                    onChange={(e) => {
                      const b = availableBatches.find((item) => item.id === e.target.value);
                      if (b) setSelectedBatch(b);
                    }}
                    className="h-8 px-2 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs font-mono"
                  >
                    {availableBatches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.batchNumber} (Exp: {b.expiryDate}) - Qty: {b.currentStock} - ₹{b.sellingPrice}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantity Input */}
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Qty:</span>
                  <input
                    type="number"
                    min="1"
                    max={selectedBatch?.currentStock || 100}
                    value={quantityInput}
                    onChange={(e) => setQuantityInput(parseInt(e.target.value) || 1)}
                    className="w-14 h-8 px-2 text-center bg-slate-900 border border-slate-700 rounded text-slate-100 font-bold font-mono"
                  />
                </div>

                {/* Discount % Input */}
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Disc%:</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discountPercentInput}
                    onChange={(e) => setDiscountPercentInput(parseFloat(e.target.value) || 0)}
                    className="w-14 h-8 px-2 text-center bg-slate-900 border border-slate-700 rounded text-slate-100 font-bold font-mono"
                  />
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={!selectedBatch || availableBatches.length === 0}
                  className="px-4 h-8 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add (Enter)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Cart Line Items Table (Scrollable) */}
        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 p-8 text-center">
              <PackageCheck className="w-12 h-12 text-slate-700 mb-3" />
              <p className="text-sm font-semibold text-slate-400">Billing Cart is Empty</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Scan barcode from product box or search medicine name above to populate bill.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 text-slate-400 sticky top-0 border-b border-slate-800 text-[11px] font-semibold">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Medicine Brand & Formulation</th>
                  <th className="p-3">Batch & Exp</th>
                  <th className="p-3 text-right">MRP</th>
                  <th className="p-3 text-right">Rate</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-center">Disc%</th>
                  <th className="p-3 text-right">GST</th>
                  <th className="p-3 text-right">Total (₹)</th>
                  <th className="p-3 text-center">Del</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-slate-200">
                {cart.map((item, idx) => {
                  const gross = item.unitPrice * item.quantity;
                  const discount = (gross * item.discountPercent) / 100;
                  const lineTotal = gross - discount;

                  return (
                    <tr key={`${item.medicineId}-${item.batchId}`} className="hover:bg-slate-850 transition-colors">
                      <td className="p-3 text-slate-400">{idx + 1}</td>
                      <td className="p-3 font-sans">
                        <div className="font-bold text-slate-100">{item.brandName}</div>
                        <div className="text-[10px] text-slate-400">{item.genericName}</div>
                      </td>
                      <td className="p-3">
                        <span className="text-cyan-300 font-semibold">{item.batchNumber}</span>
                        <div className="text-[10px] text-slate-400">Exp: {item.expiryDate}</div>
                      </td>
                      <td className="p-3 text-right text-slate-400">₹{item.mrp.toFixed(2)}</td>
                      <td className="p-3 text-right font-bold text-slate-200">₹{item.unitPrice.toFixed(2)}</td>
                      <td className="p-3 text-center">
                        <div className="inline-flex items-center border border-slate-700 rounded bg-slate-950">
                          <button
                            onClick={() => handleUpdateQuantity(idx, item.quantity - 1)}
                            className="px-2 py-0.5 text-slate-400 hover:text-white"
                          >
                            -
                          </button>
                          <span className="px-2 font-bold text-slate-100 text-xs">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(idx, item.quantity + 1)}
                            className="px-2 py-0.5 text-slate-400 hover:text-white"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.discountPercent}
                          onChange={(e) => handleUpdateDiscount(idx, parseFloat(e.target.value) || 0)}
                          className="w-12 h-6 text-center bg-slate-950 border border-slate-700 rounded text-slate-200 text-xs"
                        />
                      </td>
                      <td className="p-3 text-right text-slate-400">{item.gstRate}%</td>
                      <td className="p-3 text-right font-bold text-emerald-400 text-sm">
                        ₹{lineTotal.toFixed(2)}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Bottom Cart Status & Shortcuts */}
        <div className="p-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-4">
            <span>
              Items in Cart: <strong className="text-slate-200 font-mono">{cart.length}</strong>
            </span>
            <span>
              Total Units: <strong className="text-slate-200 font-mono">{cart.reduce((s, i) => s + i.quantity, 0)}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleHoldBill}
              disabled={cart.length === 0}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded text-xs flex items-center gap-1.5 transition-colors"
            >
              <PauseCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Hold Bill</span>
            </button>
            <button
              onClick={handleClearCart}
              disabled={cart.length === 0}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-rose-300 rounded text-xs flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear (Esc)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Customer Info, Payment Method & Net Payable Summary (4 Cols) */}
      <div className="lg:col-span-4 flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {/* Customer & Prescription Details */}
        <div className="p-3.5 bg-slate-950 border-b border-slate-800 space-y-2.5 shrink-0">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              Patient / Customer Details
            </span>
            <span className="text-[10px] text-slate-400">(Optional for OTC)</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="relative">
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="Mobile Number"
                className="w-full h-8 pl-7 pr-2 bg-slate-900 border border-slate-700 rounded text-slate-200 font-mono text-xs placeholder-slate-400"
              />
              <Phone className="w-3 h-3 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
            </div>

            <div className="relative">
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Patient Full Name"
                className="w-full h-8 pl-7 pr-2 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs placeholder-slate-400"
              />
              <User className="w-3 h-3 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>

          <div className="relative">
            <input
              type="text"
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              placeholder="Prescribing Doctor (e.g. Dr. K. Srinivas MD)"
              className="w-full h-8 pl-7 pr-2 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs placeholder-slate-400"
            />
            <Stethoscope className="w-3 h-3 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Payment Method Selector */}
        <div className="p-3 border-b border-slate-800 bg-slate-900/80 shrink-0">
          <span className="text-xs font-semibold text-slate-300 block mb-2">
            Payment Mode:
          </span>
          <div className="grid grid-cols-4 gap-1.5 text-xs font-medium">
            <button
              onClick={() => setPaymentMethod('cash')}
              className={`py-2 rounded border flex flex-col items-center justify-center gap-1 transition-colors ${
                paymentMethod === 'cash'
                  ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Banknote className="w-4 h-4 text-emerald-400" />
              <span>Cash</span>
            </button>

            <button
              onClick={() => {
                setPaymentMethod('upi');
                setShowUpiModal(true);
              }}
              className={`py-2 rounded border flex flex-col items-center justify-center gap-1 transition-colors ${
                paymentMethod === 'upi'
                  ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <QrCode className="w-4 h-4 text-cyan-400" />
              <span>UPI QR</span>
            </button>

            <button
              onClick={() => setPaymentMethod('card')}
              className={`py-2 rounded border flex flex-col items-center justify-center gap-1 transition-colors ${
                paymentMethod === 'card'
                  ? 'bg-indigo-950/60 border-indigo-500 text-indigo-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <CreditCard className="w-4 h-4 text-indigo-400" />
              <span>Card</span>
            </button>

            <button
              onClick={() => setPaymentMethod('credit')}
              className={`py-2 rounded border flex flex-col items-center justify-center gap-1 transition-colors ${
                paymentMethod === 'credit'
                  ? 'bg-purple-950/60 border-purple-500 text-purple-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-4 h-4 text-purple-400" />
              <span>Credit</span>
            </button>
          </div>
        </div>

        {/* Bill Summary Calculations (Scrollable if small viewport) */}
        <div className="flex-1 p-4 space-y-2 overflow-y-auto font-mono text-xs text-slate-300">
          <div className="flex justify-between">
            <span className="text-slate-400 font-sans">Gross Subtotal:</span>
            <span className="font-semibold text-slate-200">₹{subTotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400 font-sans flex items-center gap-1">
              <Tag className="w-3 h-3 text-emerald-400" /> Total Discount:
            </span>
            <span className="text-emerald-400 font-semibold">-₹{totalDiscount.toFixed(2)}</span>
          </div>

          <div className="flex justify-between pt-1 border-t border-slate-800">
            <span className="text-slate-400 font-sans">Taxable Value:</span>
            <span>₹{taxableAmount.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-slate-400 text-[11px]">
            <span className="font-sans">CGST (50%):</span>
            <span>₹{cgstTotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-slate-400 text-[11px]">
            <span className="font-sans">SGST (50%):</span>
            <span>₹{sgstTotal.toFixed(2)}</span>
          </div>

          {roundOff !== 0 && (
            <div className="flex justify-between text-[11px] text-slate-400">
              <span className="font-sans">Round Off:</span>
              <span>₹{roundOff.toFixed(2)}</span>
            </div>
          )}

          {/* Cash Tender Input if Cash Payment */}
          {paymentMethod === 'cash' && (
            <div className="mt-2 pt-2 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-sans font-medium">Cash Tendered:</span>
                <input
                  type="number"
                  placeholder="₹ Amount"
                  value={tenderedCash}
                  onChange={(e) => setTenderedCash(e.target.value)}
                  className="w-24 h-7 text-right px-2 bg-slate-950 border border-slate-700 rounded text-slate-100 font-bold"
                />
              </div>

              {changeAmount > 0 && (
                <div className="flex justify-between text-cyan-300 font-bold">
                  <span className="font-sans">Return Change:</span>
                  <span>₹{changeAmount.toFixed(2)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Grand Total & Complete Invoice Action */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Net Payable:
            </span>
            <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
              ₹{grandTotal.toFixed(2)}
            </span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full h-12 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 disabled:opacity-40 text-white font-bold text-sm rounded-lg shadow-lg shadow-cyan-950/60 flex items-center justify-center gap-2 transition-all"
          >
            <Printer className="w-5 h-5" />
            <span>Generate & Print Bill (F9)</span>
          </button>
        </div>
      </div>

      {/* Dynamic UPI Payment Modal */}
      {showUpiModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-sm w-full text-center text-slate-100 shadow-2xl space-y-4">
            <h3 className="font-bold text-base flex items-center justify-center gap-2 text-cyan-300">
              <QrCode className="w-5 h-5" />
              Dynamic Instant UPI Payment
            </h3>
            <p className="text-xs text-slate-400">
              Scan with PhonePe, Google Pay, Paytm or BHIM
            </p>

            {/* Simulated UPI QR Code SVG */}
            <div className="bg-white p-4 rounded-lg inline-block shadow-inner mx-auto">
              <svg viewBox="0 0 100 100" className="w-44 h-44">
                <rect width="100" height="100" fill="#fff" />
                {/* Visual QR representation */}
                <rect x="10" y="10" width="25" height="25" fill="#0f172a" />
                <rect x="15" y="15" width="15" height="15" fill="#fff" />
                <rect x="18" y="18" width="9" height="9" fill="#0f172a" />
                <rect x="65" y="10" width="25" height="25" fill="#0f172a" />
                <rect x="70" y="15" width="15" height="15" fill="#fff" />
                <rect x="73" y="18" width="9" height="9" fill="#0f172a" />
                <rect x="10" y="65" width="25" height="25" fill="#0f172a" />
                <rect x="15" y="70" width="15" height="15" fill="#fff" />
                <rect x="18" y="73" width="9" height="9" fill="#0f172a" />
                {/* Dynamic Data Dots */}
                <rect x="42" y="15" width="8" height="8" fill="#0f172a" />
                <rect x="52" y="25" width="6" height="6" fill="#0f172a" />
                <rect x="40" y="40" width="20" height="20" fill="#06b6d4" rx="2" />
                <rect x="65" y="45" width="8" height="8" fill="#0f172a" />
                <rect x="45" y="70" width="10" height="10" fill="#0f172a" />
                <rect x="70" y="70" width="15" height="15" fill="#0f172a" />
              </svg>
            </div>

            <div className="p-2 bg-slate-950 border border-slate-800 rounded font-mono text-xs">
              <span className="text-slate-400">Payable Amount:</span>{' '}
              <strong className="text-emerald-400 text-sm">₹{grandTotal.toFixed(2)}</strong>
              <div className="text-[10px] text-slate-500 mt-0.5">UPI VPA: sahasrapharmacy@sbi</div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowUpiModal(false)}
                className="flex-1 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowUpiModal(false);
                  handleCheckout();
                }}
                className="flex-1 py-2 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Payment Received</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Print & Receipt Dialog */}
      {completedInvoice && (
        <InvoicePrintModal
          invoice={completedInvoice}
          onClose={() => setCompletedInvoice(null)}
        />
      )}
    </div>
  );
};
