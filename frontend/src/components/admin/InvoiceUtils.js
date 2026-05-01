import { generateBarcodeSVG } from "./adminUtils";

export const generateInvoiceHtml = (invoice, settings) => {
  const barcodeDataURL = generateBarcodeSVG(invoice.invoiceId || invoice._id || "INV");

  const subtotal = invoice.subtotal || invoice.itemsList?.reduce((s, i) => s + i.qty * i.price, 0) || 0;

  const discountRateUsed = typeof invoice.discountRate === 'number' ? invoice.discountRate : (settings?.defaultDiscountRate || 10);
  const taxRateUsed = typeof invoice.taxRate === 'number' ? invoice.taxRate : (settings?.taxRate * 100);

  const discount = typeof invoice.discount === "number" ? invoice.discount : (subtotal * (discountRateUsed / 100));
  const tax = typeof invoice.tax === "number" ? invoice.tax : ((subtotal - discount) * (taxRateUsed / 100));
  const grandTotal = invoice.totalAmount || (subtotal - discount + tax);
  const totalQty = (invoice.itemsList || []).reduce((s, i) => s + (Number(i.qty) || 0), 0);

  const paymentMethod = invoice.paymentMethod || "Cash";
  const invoiceDate = invoice.date || new Date().toISOString().split("T")[0];
  const transactionDate = new Date(invoice.createdAt || Date.now()).toLocaleDateString("en-NP");
  const qrData = `PAY|${paymentMethod}|Rs.${grandTotal.toFixed(2)}|INV:${invoice.invoiceId || invoice._id}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(qrData)}`;

  const itemsRows = (invoice.itemsList || []).map((item, idx) => `
    <tr>
      <td style="padding:8px 10px;border:1px solid #d1d5db;font-size:12px;">${idx + 1}</td>
      <td style="padding:8px 10px;border:1px solid #d1d5db;font-size:12px;font-weight:600;">${item.product || "-"}</td>
      <td style="padding:8px 10px;border:1px solid #d1d5db;font-size:11px;color:#6b7280;">${item.batchNo || "N/A"}</td>
      <td style="padding:8px 10px;border:1px solid #d1d5db;text-align:center;font-size:12px;">${item.qty}</td>
      <td style="padding:8px 10px;border:1px solid #d1d5db;text-align:right;font-size:12px;">Rs. ${Number(item.price).toFixed(2)}</td>
      <td style="padding:8px 10px;border:1px solid #d1d5db;text-align:right;font-size:12px;font-weight:700;">Rs. ${(item.qty * item.price).toFixed(2)}</td>
    </tr>`).join("");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<title>Invoice - ${invoice.invoiceId || invoice._id}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Segoe UI',Arial,sans-serif;background:#e5e7eb;padding:24px;color:#111}
  .page{max-width:780px;margin:0 auto;background:#fff;border-radius:0;box-shadow:0 4px 32px rgba(0,0,0,0.12)}
  .banner{background:#15803d;color:#fff;padding:20px 30px 14px;display:flex;justify-content:space-between;align-items:flex-end}
  .banner-left h1{font-size:20px;font-weight:900;letter-spacing:0.5px;text-transform:uppercase}
  .banner-left p{font-size:11px;opacity:0.85;margin-top:3px}
  .banner-right{text-align:right;font-size:11px;opacity:0.9}
  .banner-right .vat{font-size:13px;font-weight:800}
  .title-bar{background:#166534;color:#fff;text-align:center;padding:8px;font-size:14px;font-weight:800;letter-spacing:2px;text-transform:uppercase}
  .meta{display:grid;grid-template-columns:1fr 1fr;gap:0;border-bottom:2px solid #15803d}
  .meta-block{padding:14px 20px;border-right:1px solid #e5e7eb}
  .meta-block:last-child{border-right:none}
  .meta-label{font-size:9px;text-transform:uppercase;color:#6b7280;font-weight:700;letter-spacing:1px}
  .meta-value{font-size:13px;font-weight:700;color:#111;margin-top:3px}
  .meta-value.green{color:#15803d}
  .section-title{background:#f0fdf4;border-left:4px solid #22c55e;padding:8px 16px;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:2px;color:#166534;margin:0}
  table{border-collapse:collapse;width:100%;font-size:12px}
  thead tr{background:#15803d;color:#fff}
  thead th{padding:10px 10px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:0.5px}
  tbody tr:nth-child(even){background:#f9fafb}
  tbody tr:hover{background:#f0fdf4}
  .totals-wrap{display:grid;grid-template-columns:1fr 280px;gap:0}
  .totals-note{padding:20px;font-size:11px;color:#6b7280;border-top:1px solid #e5e7eb}
  .totals-note p{margin-bottom:6px}
  .totals-table{border-left:1px solid #e5e7eb;border-top:1px solid #e5e7eb}
  .t-row{display:flex;justify-content:space-between;padding:9px 16px;border-bottom:1px solid #e5e7eb;font-size:12px}
  .t-row.discount{color:#ef4444}
  .t-row.tax{color:#f59e0b}
  .t-row.qty{color:#3b82f6;font-weight:700}
  .t-row.net{background:#15803d;color:#fff;font-size:15px;font-weight:900;border-bottom:none}
  .footer{background:#f9fafb;padding:16px 20px;display:flex;justify-content:space-between;align-items:center;border-top:2px solid #15803d}
  .sig-line{border-top:1px solid #111;margin-top:30px;padding-top:6px;font-size:10px;color:#6b7280;text-align:center;min-width:120px}
  .stamp{text-align:center}
  .stamp p{font-size:10px;color:#6b7280;margin-top:4px}
  @media print{body{background:#fff;padding:0}.page{box-shadow:none}}
</style>
</head>
<body>
<div class="page">

<!-- Header Banner -->
<div class="banner">
  <div class="banner-left">
    <h1>Stock Inventory Management System</h1>
    <p>Kathmandu, Nepal &nbsp;|&nbsp; Email: support@stockinventory.com</p>
    <p style="margin-top:5px;font-size:10px;opacity:0.8;">PAN No: &mdash; &nbsp;|&nbsp; Address: Kathmandu, Nepal</p>
  </div>
  <div class="banner-right">
    <div class="vat">VAT No: 300142084</div>
    <div style="margin-top:8px;background:#fff;padding:4px;border-radius:6px;display:inline-block">
      <img src="${barcodeDataURL}" alt="Barcode" style="height:36px;display:block"/>
    </div>
    <div style="font-size:10px;margin-top:4px;">Invoice: ${invoice.invoiceId || invoice._id}</div>
  </div>
</div>

<!-- Title -->
<div class="title-bar">⬥ Abbreviated Tax Invoice ⬥</div>

<!-- Meta Info Grid -->
<div class="meta">
  <div class="meta-block">
    <div class="meta-label">Bill To (Customer)</div>
    <div class="meta-value green">${invoice.customer || "Walk-in Customer"}</div>
  </div>
  <div class="meta-block">
    <div class="meta-label">Membership / Member ID</div>
    <div class="meta-value">${invoice.membershipId || "N/A"}</div>
  </div>
  <div class="meta-block">
    <div class="meta-label">Invoice Date</div>
    <div class="meta-value">${invoiceDate}</div>
  </div>
  <div class="meta-block">
    <div class="meta-label">Transaction Date</div>
    <div class="meta-value">${transactionDate}</div>
  </div>
  <div class="meta-block">
    <div class="meta-label">Payment Method</div>
    <div class="meta-value">${paymentMethod}</div>
  </div>
  <div class="meta-block">
    <div class="meta-label">Invoice No.</div>
    <div class="meta-value green">${invoice.invoiceId || invoice._id}</div>
  </div>
</div>

<!-- Items Section -->
<div class="section-title">Items / Products</div>
<table>
  <thead>
    <tr>
      <th style="width:36px">#</th>
      <th>Product Description</th>
      <th>Batch No.</th>
      <th style="text-align:center;width:50px">Qty</th>
      <th style="text-align:right;width:100px">Unit Price</th>
      <th style="text-align:right;width:110px">Amount (Rs.)</th>
    </tr>
  </thead>
  <tbody>
    ${itemsRows || '<tr><td colspan="6" style="text-align:center;padding:20px;color:#9ca3af">No items recorded</td></tr>'}
  </tbody>
</table>

<!-- Totals -->
<div class="totals-wrap">
  <div class="totals-note">
    <p><strong>Payment Terms:</strong> Immediate / On Invoice</p>
    <p><strong>Note:</strong> This is a computer-generated invoice. No signature required.</p>
    <p style="margin-top:16px;font-size:10px;color:#9ca3af">Goods once sold will not be taken back. Thank you for your business!</p>
    <div style="margin-top:20px">
      <img src="${qrUrl}" style="width:80px;height:80px;border:1px solid #e5e7eb;border-radius:6px;padding:3px" />
      <p style="font-size:9px;text-align:center;margin-top:4px;color:#9ca3af">Scan to Verify</p>
    </div>
  </div>
  <div class="totals-table">
    <div class="t-row">
      <span>Gross Amount</span>
      <span>Rs. ${subtotal.toFixed(2)}</span>
    </div>
    <div class="t-row discount">
      <span>Discount (${discountRateUsed.toFixed(0)}%)</span>
      <span>- Rs. ${discount.toFixed(2)}</span>
    </div>
    <div class="t-row tax">
      <span>Tax / VAT (${taxRateUsed.toFixed(0)}%)</span>
      <span>+ Rs. ${tax.toFixed(2)}</span>
    </div>
    <div class="t-row qty">
      <span>Total Qty</span>
      <span>${totalQty} pcs</span>
    </div>
    <div class="t-row net">
      <span>Net Amount</span>
      <span>Rs. ${grandTotal.toFixed(2)}</span>
    </div>
  </div>
</div>

<!-- Footer -->
<div class="footer">
  <div style="font-size:11px;color:#6b7280">
    <strong>Stock Inventory Management System</strong><br/>
    VAT Reg. No: 300142084 &nbsp;|&nbsp; Kathmandu, Nepal<br/>
    <span style="color:#15803d;font-weight:700">Thank you for your purchase! 🎉</span>
  </div>
  <div style="font-size:10px;color:#9ca3af;text-align:right">
    Printed: ${new Date().toLocaleDateString()}<br/>
    Invoice ID: ${invoice.invoiceId || invoice._id}
  </div>
</div>

</div>
</body>
</html>`;
};

export const handlePrintInvoice = (invoice, settings) => {
  const html = generateInvoiceHtml(invoice, settings);
  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
  }
};

export const handleDownloadInvoice = (invoice, settings) => {
  const html = generateInvoiceHtml(invoice, settings);
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${invoice.invoiceId || invoice._id || "Invoice"}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const handlePreviewInvoice = (invoice, settings) => {
  const html = generateInvoiceHtml(invoice, settings);
  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
  }
};

export const handleExportCSV = (products) => {
  const headers = ["Name", "Category", "Price", "Stock", "Status", "Barcode"];
  const rows = products.map(p => [
    `"${p.name}"`, 
    `"${p.category}"`, 
    p.price, 
    p.stock, 
    `"${p.status}"`, 
    `"${p.barcode}"`
  ]);
  const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "products_export.csv";
  link.click();
};

export const handleExportPDF = () => {
  window.print();
};

export const handleExportExcel = (products) => {
  handleExportCSV(products);
};
