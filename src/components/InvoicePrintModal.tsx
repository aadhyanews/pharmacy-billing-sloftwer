import React, { useState } from 'react';
import { Printer, Download, X, FileText, Check } from 'lucide-react';
import { SaleInvoice } from '../types/pharmacy';
import { storage } from '../services/storageService';

interface InvoicePrintModalProps {
  invoice: SaleInvoice;
  onClose: () => void;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({ invoice, onClose }) => {
  const settings = storage.getSettings();
  const [printFormat, setPrintFormat] = useState<'80mm' | '58mm' | 'a4'>(settings.thermalWidth || '80mm');
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadText = () => {
    let content = `========================================================\n`;
    content += `${settings.pharmacyName}\n`;
    content += `${settings.tagline}\n`;
    content += `${settings.addressLine1}, ${settings.city} - ${settings.pincode}\n`;
    content += `Phone: ${settings.phone} | D.L. No: ${settings.dlNo20B}\n`;
    content += `GSTIN: ${settings.gstin}\n`;
    content += `--------------------------------------------------------\n`;
    content += `TAX INVOICE: ${invoice.invoiceNumber}\n`;
    content += `Date: ${invoice.date} ${invoice.time}\n`;
    content += `Customer: ${invoice.customerName || 'Walk-in'} | Phone: ${invoice.customerPhone || 'N/A'}\n`;
    content += `Doctor: ${invoice.doctorName || 'Self / Direct'}\n`;
    content += `--------------------------------------------------------\n`;
    content += `ITEM                BATCH     EXP    QTY   RATE    AMOUNT\n`;
    content += `--------------------------------------------------------\n`;
    invoice.items.forEach((item) => {
      const name = item.brandName.padEnd(19).substring(0, 19);
      const batch = item.batchNumber.padEnd(9).substring(0, 9);
      const exp = item.expiryDate.padEnd(7).substring(0, 7);
      const qty = String(item.quantity).padStart(3);
      const rate = item.unitPrice.toFixed(2).padStart(7);
      const amt = item.totalAmount.toFixed(2).padStart(8);
      content += `${name} ${batch} ${exp} ${qty} ${rate} ${amt}\n`;
    });
    content += `--------------------------------------------------------\n`;
    content += `Sub Total:      ₹${invoice.subTotal.toFixed(2)}\n`;
    content += `Discount:       ₹${invoice.totalDiscount.toFixed(2)}\n`;
    content += `Taxable Value:  ₹${invoice.taxableAmount.toFixed(2)}\n`;
    content += `CGST:           ₹${invoice.cgstTotal.toFixed(2)}\n`;
    content += `SGST:           ₹${invoice.sgstTotal.toFixed(2)}\n`;
    content += `Round Off:      ₹${invoice.roundOff.toFixed(2)}\n`;
    content += `GRAND TOTAL:    ₹${invoice.grandTotal.toFixed(2)}\n`;
    content += `Payment Method: ${invoice.paymentMethod.toUpperCase()}\n`;
    content += `--------------------------------------------------------\n`;
    content += `${settings.footerNote}\n`;
    content += `Powered by AADHYA SOFTWARE SOLUTIONS\n`;
    content += `========================================================\n`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${invoice.invoiceNumber}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden text-slate-100">
        {/* Top Control Bar (Non-printable) */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                Invoice Print & Export ({invoice.invoiceNumber})
              </h3>
              <p className="text-[11px] text-slate-400">
                Select thermal roll or A4 tax invoice format
              </p>
            </div>
          </div>

          {/* Format Selectors */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setPrintFormat('80mm')}
                className={`px-3 py-1 font-medium rounded transition-colors ${
                  printFormat === '80mm'
                    ? 'bg-cyan-600 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                80mm Thermal
              </button>
              <button
                onClick={() => setPrintFormat('58mm')}
                className={`px-3 py-1 font-medium rounded transition-colors ${
                  printFormat === '58mm'
                    ? 'bg-cyan-600 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                58mm Mini
              </button>
              <button
                onClick={() => setPrintFormat('a4')}
                className={`px-3 py-1 font-medium rounded transition-colors ${
                  printFormat === 'a4'
                    ? 'bg-cyan-600 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                A4 Tax Invoice
              </button>
            </div>

            <button
              onClick={handleDownloadText}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
              title="Download Receipt TXT File"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4" />}
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-semibold text-xs flex items-center gap-2 shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Invoice</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Area (Styled for white receipt preview) */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-800 flex justify-center print:p-0 print:bg-white">
          {/* 80mm or 58mm Thermal Receipt View */}
          {printFormat !== 'a4' ? (
            <div
              className={`bg-white text-slate-900 font-mono text-[11px] leading-tight p-4 shadow-xl border border-slate-300 rounded-sm ${
                printFormat === '58mm' ? 'w-[220px] text-[10px]' : 'w-[320px]'
              } print:w-full print:shadow-none print:border-none`}
            >
              {/* Header */}
              <div className="text-center pb-2 border-b border-dashed border-slate-800">
                <img
                  src="/assets/aistudio/Gemini_Generated_Image_vrowi9vrowi9vrow_a94fa424.png"
                  alt="Sahasra Pharmacy"
                  className="w-16 h-10 object-contain mx-auto mb-1 rounded"
                />
                <h2 className="font-bold text-xs uppercase tracking-tight text-slate-950">
                  {settings.pharmacyName}
                </h2>
                <p className="text-[10px] text-slate-700 mt-0.5">{settings.tagline}</p>
                <p className="text-[9px] text-slate-600 mt-0.5">
                  {settings.addressLine1}, {settings.city} - {settings.pincode}
                </p>
                <p className="text-[9px] text-slate-700">Phone: {settings.phone}</p>
                <div className="text-[9px] text-slate-700 mt-1 font-semibold">
                  <div>D.L. No: {settings.dlNo20B} / {settings.dlNo21B}</div>
                  <div>GSTIN: {settings.gstin}</div>
                </div>
              </div>

              {/* Bill Details */}
              <div className="py-2 border-b border-dashed border-slate-800 text-[10px] space-y-0.5">
                <div className="flex justify-between font-bold">
                  <span>BILL NO: {invoice.invoiceNumber}</span>
                  <span>{invoice.paymentMethod.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span>DATE: {invoice.date}</span>
                  <span>{invoice.time}</span>
                </div>
                <div>PATIENT: {invoice.customerName || 'Walk-in Customer'}</div>
                {invoice.customerPhone && <div>PHONE: {invoice.customerPhone}</div>}
                <div>DOCTOR: {invoice.doctorName || 'Self / OTC'}</div>
                <div>CASHIER: {invoice.cashierName}</div>
              </div>

              {/* Items Table */}
              <div className="py-2 border-b border-dashed border-slate-800">
                <div className="flex justify-between font-bold pb-1 text-[9px] border-b border-slate-400">
                  <span className="w-1/2">ITEM / BATCH</span>
                  <span className="w-1/6 text-right">QTY</span>
                  <span className="w-1/6 text-right">RATE</span>
                  <span className="w-1/6 text-right">AMT</span>
                </div>
                <div className="divide-y divide-slate-100 pt-1 space-y-1">
                  {invoice.items.map((item, idx) => (
                    <div key={idx} className="pt-1">
                      <div className="font-bold truncate text-[10px]">{item.brandName}</div>
                      <div className="flex justify-between text-[9px] text-slate-600">
                        <span>B:{item.batchNumber} E:{item.expiryDate}</span>
                        <div className="flex gap-2">
                          <span>{item.quantity}</span>
                          <span>₹{item.unitPrice.toFixed(2)}</span>
                          <span className="font-bold text-slate-900">₹{item.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary Computations */}
              <div className="py-2 border-b border-dashed border-slate-800 text-[10px] space-y-0.5">
                <div className="flex justify-between">
                  <span>Sub Total:</span>
                  <span>₹{invoice.subTotal.toFixed(2)}</span>
                </div>
                {invoice.totalDiscount > 0 && (
                  <div className="flex justify-between text-slate-700">
                    <span>Discount:</span>
                    <span>-₹{invoice.totalDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Taxable Value:</span>
                  <span>₹{invoice.taxableAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[9px]">
                  <span>CGST:</span>
                  <span>₹{invoice.cgstTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[9px]">
                  <span>SGST:</span>
                  <span>₹{invoice.sgstTotal.toFixed(2)}</span>
                </div>
                {invoice.roundOff !== 0 && (
                  <div className="flex justify-between text-[9px]">
                    <span>Round Off:</span>
                    <span>₹{invoice.roundOff.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs font-bold pt-1 border-t border-slate-800 text-slate-950">
                  <span>NET PAYABLE:</span>
                  <span>₹{invoice.grandTotal.toFixed(2)}</span>
                </div>
                {invoice.tenderedCash && invoice.tenderedCash > 0 && (
                  <>
                    <div className="flex justify-between text-[9px] pt-0.5">
                      <span>Cash Tendered:</span>
                      <span>₹{invoice.tenderedCash.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[9px]">
                      <span>Change Returned:</span>
                      <span>₹{(invoice.changeAmount || 0).toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Footer Notes */}
              <div className="pt-2 text-center text-[9px] text-slate-700 space-y-1">
                <p>{settings.footerNote}</p>
                <p className="font-bold text-[8px] text-slate-900 mt-2">
                  SAHASRA PHARMACY BILLING SOFTWARE
                </p>
                <p className="text-[8px] text-slate-500">
                  Designed & Developed by AADHYA SOFTWARE SOLUTIONS
                </p>
              </div>
            </div>
          ) : (
            /* Full A4 Tax Invoice Format */
            <div className="bg-white text-slate-900 p-8 w-[640px] shadow-xl border border-slate-300 rounded-sm font-sans text-xs leading-normal print:w-full print:shadow-none print:border-none">
              {/* Header with Pharmacy Details */}
              <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
                <div className="flex items-start gap-3.5">
                  <img
                    src="/assets/aistudio/Gemini_Generated_Image_vrowi9vrowi9vrow_a94fa424.png"
                    alt="Sahasra Pharmacy"
                    className="w-16 h-16 object-contain rounded border border-slate-200 p-0.5 bg-white shrink-0"
                  />
                  <div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                      {settings.pharmacyName}
                    </h1>
                    <p className="text-xs text-slate-600 font-medium">{settings.tagline}</p>
                    <p className="text-xs text-slate-600 mt-1">
                      {settings.addressLine1}, {settings.addressLine2}, {settings.city} - {settings.pincode}
                    </p>
                    <p className="text-xs text-slate-600">
                      Phone: {settings.phone} | Email: {settings.email}
                    </p>
                  </div>
                </div>
                <div className="text-right text-xs">
                  <span className="inline-block bg-slate-900 text-white font-bold px-3 py-1 rounded text-[11px] mb-2 uppercase">
                    TAX INVOICE
                  </span>
                  <div className="font-mono text-xs">
                    <div><strong>GSTIN:</strong> {settings.gstin}</div>
                    <div><strong>D.L. 20B:</strong> {settings.dlNo20B}</div>
                    <div><strong>D.L. 21B:</strong> {settings.dlNo21B}</div>
                    <div><strong>FSSAI:</strong> {settings.fssaiNo}</div>
                  </div>
                </div>
              </div>

              {/* Bill & Patient Details Bar */}
              <div className="grid grid-cols-2 gap-4 py-3 border-b border-slate-300 text-xs">
                <div>
                  <div><strong>Invoice No:</strong> <span className="font-mono">{invoice.invoiceNumber}</span></div>
                  <div><strong>Date & Time:</strong> {invoice.date} {invoice.time}</div>
                  <div><strong>Payment Mode:</strong> <span className="uppercase font-semibold">{invoice.paymentMethod}</span></div>
                  <div><strong>Billing Operator:</strong> {invoice.cashierName}</div>
                </div>
                <div>
                  <div><strong>Patient / Customer:</strong> {invoice.customerName || 'Walk-in Patient'}</div>
                  <div><strong>Mobile Number:</strong> {invoice.customerPhone || 'N/A'}</div>
                  <div><strong>Doctor / Hospital:</strong> {invoice.doctorName || 'Self / Direct'}</div>
                </div>
              </div>

              {/* Items Table */}
              <div className="py-4">
                <table className="w-full text-left text-xs border border-slate-300">
                  <thead className="bg-slate-100 text-slate-800 border-b border-slate-300 font-semibold">
                    <tr>
                      <th className="p-2 border-r border-slate-300">#</th>
                      <th className="p-2 border-r border-slate-300">Medicine & Generic Details</th>
                      <th className="p-2 border-r border-slate-300">HSN</th>
                      <th className="p-2 border-r border-slate-300">Batch</th>
                      <th className="p-2 border-r border-slate-300">Exp</th>
                      <th className="p-2 border-r border-slate-300 text-right">MRP</th>
                      <th className="p-2 border-r border-slate-300 text-right">Qty</th>
                      <th className="p-2 border-r border-slate-300 text-right">Rate</th>
                      <th className="p-2 border-r border-slate-300 text-right">Disc%</th>
                      <th className="p-2 border-r border-slate-300 text-right">GST%</th>
                      <th className="p-2 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {invoice.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2 border-r border-slate-300 text-center font-mono">{idx + 1}</td>
                        <td className="p-2 border-r border-slate-300">
                          <div className="font-semibold">{item.brandName}</div>
                          <div className="text-[10px] text-slate-500">{item.genericName}</div>
                        </td>
                        <td className="p-2 border-r border-slate-300 font-mono text-[11px]">{item.hsnCode}</td>
                        <td className="p-2 border-r border-slate-300 font-mono text-[11px]">{item.batchNumber}</td>
                        <td className="p-2 border-r border-slate-300 font-mono text-[11px]">{item.expiryDate}</td>
                        <td className="p-2 border-r border-slate-300 text-right font-mono">₹{item.mrp.toFixed(2)}</td>
                        <td className="p-2 border-r border-slate-300 text-right font-bold font-mono">{item.quantity}</td>
                        <td className="p-2 border-r border-slate-300 text-right font-mono">₹{item.unitPrice.toFixed(2)}</td>
                        <td className="p-2 border-r border-slate-300 text-right font-mono">{item.discountPercent}%</td>
                        <td className="p-2 border-r border-slate-300 text-right font-mono">{item.gstRate}%</td>
                        <td className="p-2 text-right font-bold font-mono">₹{item.totalAmount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tax Breakup & Grand Totals */}
              <div className="grid grid-cols-2 gap-6 pt-2 border-t border-slate-300">
                <div className="text-xs space-y-1">
                  <h4 className="font-bold text-slate-800 uppercase text-[11px]">Bank & UPI Details for Payment</h4>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-[11px] font-mono space-y-0.5">
                    <div>Bank: {settings.bankDetails.bankName}</div>
                    <div>A/C: {settings.bankDetails.accountNumber}</div>
                    <div>IFSC: {settings.bankDetails.ifsc}</div>
                    <div>UPI VPA: {settings.bankDetails.upiId}</div>
                  </div>
                  <p className="text-[10px] text-slate-500 pt-1">
                    * Terms: Goods once sold cannot be taken back without original cash memo.
                  </p>
                </div>

                <div className="text-xs space-y-1 text-right">
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-600">Sub Total:</span>
                    <span className="font-mono font-semibold">₹{invoice.subTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-0.5 text-slate-600">
                    <span>Total Discount:</span>
                    <span className="font-mono text-emerald-600">-₹{invoice.totalDiscount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-600">Taxable Value:</span>
                    <span className="font-mono">₹{invoice.taxableAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-0.5 text-slate-600 text-[11px]">
                    <span>CGST:</span>
                    <span className="font-mono">₹{invoice.cgstTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-0.5 text-slate-600 text-[11px]">
                    <span>SGST:</span>
                    <span className="font-mono">₹{invoice.sgstTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-0.5 text-slate-600 text-[11px]">
                    <span>Round Off:</span>
                    <span className="font-mono">₹{invoice.roundOff.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-t-2 border-slate-900 text-sm font-bold text-slate-950">
                    <span>GRAND TOTAL:</span>
                    <span className="font-mono text-base">₹{invoice.grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Signatures & Developer Brand */}
              <div className="mt-8 pt-4 border-t border-slate-300 flex justify-between items-end text-xs">
                <div>
                  <p className="text-[10px] text-slate-500">
                    {settings.footerNote}
                  </p>
                  <p className="text-[10px] font-bold text-slate-800 mt-1">
                    Software Designed & Developed by AADHYA SOFTWARE SOLUTIONS
                  </p>
                </div>
                <div className="text-right">
                  <div className="h-10"></div>
                  <p className="font-semibold text-slate-800">For {settings.pharmacyName}</p>
                  <p className="text-[10px] text-slate-500">Authorized Pharmacist Signatory</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
