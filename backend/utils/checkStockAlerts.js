const sendEmail = require('./sendEmail');
const { createNotificationInternal } = require('../controllers/notificationController');

const checkStockAlerts = async (product, adminUser) => {
    try {
        if (!adminUser || !adminUser.email) return;
        const adminEmail = adminUser.email;
        const adminId = adminUser._id;

        const emailTemplate = (title, icon, color, content, alertType) => `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
                <div style="background-color: ${color}; padding: 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${icon} ${title}</h1>
                </div>
                <div style="padding: 30px; color: #475569;">
                    <p style="font-size: 16px; margin-top: 0;">Hello Admin,</p>
                    <p style="font-size: 15px; line-height: 1.6;">A new <strong>${alertType}</strong> has been triggered in your inventory system for the following product:</p>
                    
                    <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 25px 0; border: 1px solid #e2e8f0;">
                        ${content}
                    </div>

                    <div style="text-align: center; margin-top: 30px;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="background-color: ${color}; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Manage Inventory</a>
                    </div>
                </div>
                <div style="background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 12px;">
                    <p style="margin: 0;">Stock Inventory System © 2024</p>
                    <p style="margin: 5px 0 0;">This is an automated stock alert based on your defined thresholds.</p>
                </div>
            </div>
        `;

        // 1. Check Low Stock
        if (product.stock <= product.reorderLevel) {
            // Internal Notification
            await createNotificationInternal(
                adminId,
                '⚠️ Low Stock Alert',
                `${product.name} is running low on stock. Current: ${product.stock}, Reorder: ${product.reorderLevel}. Supplier: ${product.supplierName || 'N/A'}, Batch: ${product.batchNo || 'N/A'}, ID: ${product.productId || 'N/A'}.`,
                'warning',
                'stock'
            );

            // Email Alert
            await sendEmail({
                email: adminEmail,
                subject: `⚠️ Low Stock Alert: ${product.name}`,
                message: `Alert! Your product "${product.name}" is running low on stock. Current Stock: ${product.stock}. Supplier: ${product.supplierName || 'N/A'}, Batch No: ${product.batchNo || 'N/A'}, Product ID: ${product.productId || 'N/A'}.`,
                html: emailTemplate(
                    'Low Stock Alert',
                    '⚠️',
                    '#ef4444', 
                    `<p style="margin: 0; font-size: 14px;"><strong>Product:</strong> ${product.name}</p>
                     <p style="margin: 10px 0 0; font-size: 14px;"><strong>Supplier:</strong> ${product.supplierName || 'N/A'}</p>
                     <p style="margin: 10px 0 0; font-size: 14px;"><strong>Batch No / Lot:</strong> ${product.batchNo || 'N/A'}</p>
                     <p style="margin: 10px 0 0; font-size: 14px;"><strong>Product ID / Barcode:</strong> ${product.productId || 'N/A'}</p>
                     <p style="margin: 10px 0 0; font-size: 14px;"><strong>Current Stock:</strong> <span style="color: #ef4444; font-weight: bold;">${product.stock} units</span></p>
                     <p style="margin: 10px 0 0; font-size: 14px;"><strong>Reorder Threshold:</strong> ${product.reorderLevel}</p>`,
                    'Inventory Notification'
                )
            });
        }

        // 2. Check High Stock
        if (Number(product.stock) > Number(product.maxStock) && Number(product.maxStock) > 0) {
            // Internal Notification
            await createNotificationInternal(
                adminId,
                '📈 High Stock Alert',
                `${product.name} has hit its maximum threshold. Current: ${product.stock}, Max: ${product.maxStock}. Supplier: ${product.supplierName || 'N/A'}, Batch: ${product.batchNo || 'N/A'}, ID: ${product.productId || 'N/A'}.`,
                'info',
                'stock'
            );

            // Email Alert
            await sendEmail({
                email: adminEmail,
                subject: `📈 High Stock Alert: ${product.name}`,
                message: `Notice! Your product "${product.name}" has hit its maximum threshold. Current Stock: ${product.stock}. Supplier: ${product.supplierName || 'N/A'}, Batch No: ${product.batchNo || 'N/A'}, Product ID: ${product.productId || 'N/A'}.`,
                html: emailTemplate(
                    'High Stock Alert',
                    '📈',
                    '#3b82f6',
                    `<p style="margin: 0; font-size: 14px;"><strong>Product:</strong> ${product.name}</p>
                     <p style="margin: 10px 0 0; font-size: 14px;"><strong>Supplier:</strong> ${product.supplierName || 'N/A'}</p>
                     <p style="margin: 10px 0 0; font-size: 14px;"><strong>Batch No / Lot:</strong> ${product.batchNo || 'N/A'}</p>
                     <p style="margin: 10px 0 0; font-size: 14px;"><strong>Product ID / Barcode:</strong> ${product.productId || 'N/A'}</p>
                     <p style="margin: 10px 0 0; font-size: 14px;"><strong>Current Stock:</strong> <span style="color: #3b82f6; font-weight: bold;">${product.stock} units</span></p>
                     <p style="margin: 10px 0 0; font-size: 14px;"><strong>Maximum Capacity:</strong> ${product.maxStock}</p>`,
                    'Inventory Notification'
                )
            });
        }

        // 3. Check Expiry Date (7 days or less remaining)
        if (product.expiryDate) {
            const today = new Date();
            const expDate = new Date(product.expiryDate);
            const diffTime = expDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays <= 7 && diffDays >= 0) {
                // Internal Notification
                await createNotificationInternal(
                    adminId,
                    '⏳ Expiry Warning',
                    `${product.name} will expire in ${diffDays} days (${expDate.toLocaleDateString()}). Stock remaining: ${product.stock}. Supplier: ${product.supplierName || 'N/A'}, Batch: ${product.batchNo || 'N/A'}, ID: ${product.productId || 'N/A'}.`,
                    'warning',
                    'stock'
                );

                // Email Alert
                await sendEmail({
                    email: adminEmail,
                    subject: `⏳ Expiry Alert: ${product.name}`,
                    message: `Warning! Your product "${product.name}" (Stock: ${product.stock}) will expire in ${diffDays} days. Supplier: ${product.supplierName || 'N/A'}, Batch No: ${product.batchNo || 'N/A'}, Product ID: ${product.productId || 'N/A'}.`,
                    html: emailTemplate(
                        'Expiry Warning',
                        '⏳',
                        '#f97316',
                        `<p style="margin: 0; font-size: 14px;"><strong>Product:</strong> ${product.name}</p>
                         <p style="margin: 10px 0 0; font-size: 14px;"><strong>Supplier:</strong> ${product.supplierName || 'N/A'}</p>
                         <p style="margin: 10px 0 0; font-size: 14px;"><strong>Batch No / Lot:</strong> ${product.batchNo || 'N/A'}</p>
                         <p style="margin: 10px 0 0; font-size: 14px;"><strong>Product ID / Barcode:</strong> ${product.productId || 'N/A'}</p>
                         <p style="margin: 10px 0 0; font-size: 14px;"><strong>Remaining Stock:</strong> <span style="color: #6366f1; font-weight: bold;">${product.stock} units</span></p>
                         <p style="margin: 10px 0 0; font-size: 14px;"><strong>Time Remaining:</strong> <span style="color: #f97316; font-weight: bold;">${diffDays} day(s)</span></p>
                         <p style="margin: 10px 0 0; font-size: 14px;"><strong>Expires On:</strong> ${expDate.toLocaleDateString()}</p>`,
                        'Expiry Alert'
                    )
                });
            }
        }
    } catch (error) {
        console.error("Stock Alert Email/Notification Failed:", error.message);
    }
};

module.exports = checkStockAlerts;
