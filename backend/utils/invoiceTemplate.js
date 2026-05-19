const generateInvoiceEmailTemplate = (invoice) => {
    const itemsHtml = invoice.itemsList.map(item => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.qty}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">Rs. ${item.price.toFixed(2)}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">Rs. ${(item.qty * item.price).toFixed(2)}</td>
        </tr>
    `).join('');

    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px; color: #333;">
        <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #2ecc71; margin: 0;">Digital Receipt</h1>
            <p style="color: #777;">Thank you for your purchase!</p>
        </div>
        
        <div style="margin-bottom: 20px; padding: 15px; background: #f9f9f9; border-radius: 8px;">
            <p style="margin: 5px 0;"><strong>Invoice ID:</strong> #${invoice.invoiceId}</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${invoice.date}</p>
            <p style="margin: 5px 0;"><strong>Customer:</strong> ${invoice.customer}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
                <tr style="background: #2ecc71; color: white;">
                    <th style="padding: 10px; text-align: left;">Item</th>
                    <th style="padding: 10px; text-align: center;">Qty</th>
                    <th style="padding: 10px; text-align: right;">Price</th>
                    <th style="padding: 10px; text-align: right;">Total</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHtml}
            </tbody>
        </table>

        <div style="text-align: right; border-top: 2px solid #eee; padding-top: 10px;">
            <p style="margin: 5px 0;">Subtotal: Rs. ${invoice.subtotal.toFixed(2)}</p>
            ${invoice.discount > 0 ? `<p style="margin: 5px 0; color: #e74c3c;">Discount: - Rs. ${invoice.discount.toFixed(2)}</p>` : ''}
            <p style="margin: 5px 0; color: #3498db;">Tax (${invoice.taxRate}%): + Rs. ${invoice.tax.toFixed(2)}</p>
            <h2 style="color: #2ecc71; margin: 10px 0;">Grand Total: Rs. ${invoice.totalAmount.toFixed(2)}</h2>
        </div>

        <div style="margin-top: 30px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px;">
            <p>This is a computer-generated invoice. No signature required.</p>
            <p>&copy; ${new Date().getFullYear()} Stock Inventory Management System</p>
        </div>
    </div>
    `;
};

module.exports = { generateInvoiceEmailTemplate };
