const cron = require('node-cron');
const Product = require('../models/Product');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

const runAlertScan = async () => {
    try {
        console.log('🔄 Running product background scanner (Checking limits & expiry)...');

        // 1. Fetch all Admins to process their separated alerts
        const admins = await User.find({ role: 'admin' });

        for (const admin of admins) {
            // Fetch all products exactly for this admin
            const products = await Product.find({ createdBy: admin._id });

            if (products.length === 0) continue;

            const today = new Date();
            const lowStockList = [];
            const highStockList = [];
            const expiryList = [];

            products.forEach(product => {
                if (product.stock <= (product.reorderLevel || 10)) {
                    lowStockList.push(product);
                }
                if (product.stock >= (product.maxStock || 100) && (product.maxStock || 100) > 0) {
                    highStockList.push(product);
                }
                if (product.expiryDate) {
                    const expDate = new Date(product.expiryDate);
                    const diffTime = expDate - today;
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    if (diffDays <= 7 && diffDays >= 0) {
                        expiryList.push({ p: product, d: diffDays });
                    }
                }
            });

            if (lowStockList.length === 0 && highStockList.length === 0 && expiryList.length === 0) {
                continue;
            }

            let summaryHtml = '';
            
            if (lowStockList.length > 0) {
                summaryHtml += `<div style="margin-bottom: 20px;"><h4 style="color: #ef4444; margin: 0 0 10px;">🔴 Low Stock</h4>`;
                lowStockList.forEach(p => {
                    summaryHtml += `<p style="margin: 5px 0; font-size: 13px;">• ${p.name}: <strong>${p.stock}</strong> (Threshold: ${p.reorderLevel})</p>`;
                });
                summaryHtml += `</div>`;
            }

            if (highStockList.length > 0) {
                summaryHtml += `<div style="margin-bottom: 20px;"><h4 style="color: #3b82f6; margin: 0 0 10px;">🔵 High Stock</h4>`;
                highStockList.forEach(p => {
                    summaryHtml += `<p style="margin: 5px 0; font-size: 13px;">• ${p.name}: <strong>${p.stock}</strong> (Max: ${p.maxStock})</p>`;
                });
                summaryHtml += `</div>`;
            }

            if (expiryList.length > 0) {
                summaryHtml += `<div style="margin-bottom: 20px;"><h4 style="color: #f97316; margin: 0 0 10px;">🟠 Expiring Soon</h4>`;
                expiryList.forEach(({ p, d }) => {
                    summaryHtml += `<p style="margin: 5px 0; font-size: 13px;">• ${p.name}: <strong>Exps in ${d} days</strong> (${new Date(p.expiryDate).toLocaleDateString()})</p>`;
                });
                summaryHtml += `</div>`;
            }

            const htmlBody = `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
                    <div style="background-color: #1e293b; padding: 30px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">📊 Inventory Audit Report</h1>
                    </div>
                    <div style="padding: 30px; color: #475569;">
                        <p style="font-size: 16px; margin-top: 0;">Hello <strong>${admin.name}</strong>,</p>
                        <p style="font-size: 15px; line-height: 1.6;">Here is your automated inventory summary. The following items require your attention based on your current database thresholds.</p>
                        
                        <div style="background-color: #f8fafc; border-radius: 8px; padding: 25px; margin: 25px 0; border: 1px solid #e2e8f0;">
                            ${summaryHtml}
                        </div>

                        <div style="text-align: center; margin-top: 30px;">
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="background-color: #1e293b; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">View Dashboard</a>
                        </div>
                    </div>
                    <div style="background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 12px;">
                        <p style="margin: 0;">Stock Inventory System © 2024</p>
                        <p style="margin: 5px 0 0;">This report is generated daily based on your current stock levels.</p>
                    </div>
                </div>
            `;

            await sendEmail({
                email: admin.email,
                subject: '📊 Stock & Expiry Audit Report',
                message: `Your daily inventory summary is ready.`,
                html: htmlBody
            });
            
            console.log(`✅ Mail dispatched successfully to admin ${admin.email}`);
        }
    } catch (error) {
        console.error('❌ Error during Alert Job Scan:', error.message);
    }
};

const startDailyAlertJob = () => {
    runAlertScan();
    cron.schedule('0 0 * * *', runAlertScan);
    console.log('🕒 Daily Alert Job Cron initialized (Scheduled: Every 24 hours at Midnight)...');
};

module.exports = startDailyAlertJob;
