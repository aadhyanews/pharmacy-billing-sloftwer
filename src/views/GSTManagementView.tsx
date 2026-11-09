import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  FileCheck,
  Building,
  HelpCircle,
} from 'lucide-react';
import { storage } from '../services/storageService';
import { SaleInvoice } from '../types/pharmacy';

export const GSTManagementView: React.FC = () => {
  const [invoices] = useState<SaleInvoice[]>(storage.getInvoices());
  const [selectedMonth, setSelectedMonth] = useState('2026-11');
  const settings = storage.getSettings();

  // Aggregate all line items from completed invoices
  const allItems = invoices.flatMap((inv) => inv.items);

  // Group by GST Slab (0%, 5%, 12%, 18%)
  const slabs = [0, 5, 12, 18];
  const slabSummaries = slabs.map((rate) => {
    const matchingItems = allItems.filter((i) => i.gstRate === rate);
    const taxable = matchingItems.reduce((s, i) => s + i.taxableValue, 0);
    const cgst = matchingItems.reduce((s, i) => s + i.cgstAmount, 0);
    const sgst = matchingItems.reduce((s, i) => s + i.sgstAmount, 0);
    const totalTax = cgst + sgst;
    const totalGross = taxable + totalTax;

    return {
      rate,
      count: matchingItems.length,
      taxable: +taxable.toFixed(2),
      cgst: +cgst.toFixed(2),
      sgst: +sgst.toFixed(2),
      totalTax: +totalTax.toFixed(2),
      totalGross: +totalGross.toFixed(2),
    };
  });

  // Group by HSN Code
  const hsnMap: {
    [code: string]: {
      hsnCode: string;
      description: string;
      qty: number;
      taxable: number;
      cgst: number;
      sgst: number;
      total: number;
    };
  } = {};

  allItems.forEach((i) => {
    const code = i.hsnCode || '30049099';
    if (!hsnMap[code]) {
      let desc = 'Other Medicaments (Retail Formulations)';
      if (code === '30049060') desc = 'Paracetamol / Antipyretic Formulations';
      else if (code === '30041000') desc = 'Penicillins / Broad Spectrum Antibiotics';
      else if (code === '30042000') desc = 'Macrolides & Fluoroquinolones';
      else if (code === '30045090') desc = 'Vitamins, Minerals & Dietary Supplements';

      hsnMap[code] = {
        hsnCode: code,
        description: desc,
        qty: 0,
        taxable: 0,
        cgst: 0,
        sgst: 0,
        total: 0,
      };
    }

    hsnMap[code].qty += i.quantity;
    hsnMap[code].taxable += i.taxableValue;
    hsnMap[code].cgst += i.cgstAmount;
    hsnMap[code].sgst += i.sgstAmount;
    hsnMap[code].total += i.totalAmount;
  });

  const hsnList = Object.values(hsnMap);

  // Overall Totals
  const totalTaxable = slabSummaries.reduce((s, sl) => s + sl.taxable, 0);
  const totalCGST = slabSummaries.reduce((s, sl) => s + sl.cgst, 0);
  const totalSGST = slabSummaries.reduce((s, sl) => s + sl.sgst, 0);
  const totalGSTCollected = +(totalCGST + totalSGST).toFixed(2);

  // Export HSN & GSTR-1 to CSV
  const handleExportGST = () => {
    let csv = `GST FILING REPORT - ${settings.pharmacyName}\n`;
    csv += `GSTIN: ${settings.gstin} | Period: ${selectedMonth}\n\n`;
    csv += `SLAB SUMMARY\nRate %,Taxable Value,CGST (50%),SGST (50%),Total Tax,Total Gross\n`;
    slabSummaries.forEach((s) => {
      csv += `${s.rate}%,${s.taxable},${s.cgst},${s.sgst},${s.totalTax},${s.totalGross}\n`;
    });
    csv += `Total,${totalTaxable},${totalCGST},${totalSGST},${totalGSTCollected},\n\n`;

    csv += `HSN-WISE SUMMARY (GSTR-1 Table 12)\nHSN Code,Description,UQC,Total Qty,Taxable Value,CGST Amount,SGST Amount,Total Amount\n`;
    hsnList.forEach((h) => {
      csv += `"${h.hsnCode}","${h.description}","NOS",${h.qty},${h.taxable.toFixed(2)},${h.cgst.toFixed(2)},${h.sgst.toFixed(2)},${h.total.toFixed(2)}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SahasraPharmacy_GSTR1_${selectedMonth}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-5 space-y-5 overflow-y-auto max-h-[calc(100vh-5.5rem)] select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
            GST & HSN Tax Compliance Management
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            GSTR-1 Outward Supplies, Table 12 HSN Summary & Input Tax Credit Records for Indian GST
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>Filing Period:</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="h-8 px-2 bg-slate-900 border border-slate-700 rounded text-slate-200 font-mono text-xs"
            />
          </div>

          <button
            onClick={handleExportGST}
            className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export GSTR-1 Excel / CSV</span>
          </button>
        </div>
      </div>

      {/* Pharmacy GSTIN Verification Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-200">{settings.pharmacyName}</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/80 font-mono">
              Regular Taxpayer
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            GSTIN: <strong className="text-cyan-300">{settings.gstin}</strong> · State Code: 36 (Telangana)
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="bg-slate-950 px-3 py-2 rounded border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Total Taxable Outward:</span>
            <strong className="text-slate-100 text-sm">₹{totalTaxable.toFixed(2)}</strong>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Total Central GST (CGST):</span>
            <strong className="text-cyan-400 text-sm">₹{totalCGST.toFixed(2)}</strong>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Total State GST (SGST):</span>
            <strong className="text-cyan-400 text-sm">₹{totalSGST.toFixed(2)}</strong>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Net GST Collected:</span>
            <strong className="text-emerald-400 text-sm">₹{totalGSTCollected.toFixed(2)}</strong>
          </div>
        </div>
      </div>

      {/* Tax Slabs Breakdown Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 space-y-3">
        <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-cyan-400" />
          GST Rate Slab Distribution
        </h3>

        <div className="border border-slate-800 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 text-[11px] font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">GST Slab Rate</th>
                <th className="p-3 font-sans">Applicable Pharma Goods</th>
                <th className="p-3 text-center">Invoiced Items</th>
                <th className="p-3 text-right">Taxable Turnover (₹)</th>
                <th className="p-3 text-right">CGST (₹)</th>
                <th className="p-3 text-right">SGST (₹)</th>
                <th className="p-3 text-right">Total GST Tax (₹)</th>
                <th className="p-3 text-right">Gross Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {slabSummaries.map((slab) => {
                let desc = 'Medicines & Essential Formulations';
                if (slab.rate === 0) desc = 'Exempt Surgical / Condoms / Subsidized Vaccines';
                else if (slab.rate === 5) desc = 'Lifesaving Formulations / Insulin / Dialysis Fluids';
                else if (slab.rate === 12) desc = 'Standard Antibiotics, Antipyretics, Inhalers, Syrups';
                else if (slab.rate === 18) desc = 'Cosmetics, Shampoos, Antiseptic Lotions, Food Supplements';

                return (
                  <tr key={slab.rate} className="hover:bg-slate-850">
                    <td className="p-3 font-bold text-cyan-300 text-sm">{slab.rate}%</td>
                    <td className="p-3 font-sans text-slate-300">{desc}</td>
                    <td className="p-3 text-center">{slab.count}</td>
                    <td className="p-3 text-right font-bold">₹{slab.taxable.toFixed(2)}</td>
                    <td className="p-3 text-right text-slate-300">₹{slab.cgst.toFixed(2)}</td>
                    <td className="p-3 text-right text-slate-300">₹{slab.sgst.toFixed(2)}</td>
                    <td className="p-3 text-right font-bold text-cyan-400">₹{slab.totalTax.toFixed(2)}</td>
                    <td className="p-3 text-right font-bold text-slate-100">₹{slab.totalGross.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Table 12 HSN Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 space-y-3">
        <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
          <Building className="w-4 h-4 text-cyan-400" />
          GSTR-1 Table 12: HSN-Wise Summary of Outward Supplies
        </h3>

        <div className="border border-slate-800 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 text-[11px] font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">HSN Code</th>
                <th className="p-3 font-sans">HSN Product Description</th>
                <th className="p-3 text-center">UQC</th>
                <th className="p-3 text-right">Total Sold Qty</th>
                <th className="p-3 text-right">Taxable Value (₹)</th>
                <th className="p-3 text-right">CGST (₹)</th>
                <th className="p-3 text-right">SGST (₹)</th>
                <th className="p-3 text-right">Total Invoice Value (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {hsnList.map((hsn) => (
                <tr key={hsn.hsnCode} className="hover:bg-slate-850">
                  <td className="p-3 font-bold text-cyan-300">{hsn.hsnCode}</td>
                  <td className="p-3 font-sans font-medium text-slate-200">{hsn.description}</td>
                  <td className="p-3 text-center text-slate-400">NOS / STRIP</td>
                  <td className="p-3 text-right font-bold">{hsn.qty}</td>
                  <td className="p-3 text-right">₹{hsn.taxable.toFixed(2)}</td>
                  <td className="p-3 text-right text-slate-300">₹{hsn.cgst.toFixed(2)}</td>
                  <td className="p-3 text-right text-slate-300">₹{hsn.sgst.toFixed(2)}</td>
                  <td className="p-3 text-right font-bold text-emerald-400">₹{hsn.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
