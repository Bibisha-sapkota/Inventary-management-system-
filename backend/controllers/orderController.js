const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Invoice = require('../models/Invoice');
const { createNotificationInternal } = require('./notificationController');
const sendEmail = require('../utils/sendEmail');
const { logActivity } = require('../utils/logger');
const PDFDocument = require('pdfkit');

// Helper to generate Invoice PDF
const generatePDFBuffer = (invoiceData) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50, size: 'A4' });
            let buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));

            // Header
            doc.fillColor("#0f172a").fontSize(26).text("STOCKLY", 50, 50);
            doc.fontSize(10).fillColor("#64748b").text("Cloud Inventory Management", 50, 80);
            doc.fontSize(10).fillColor("#64748b").text(`Invoice: ${invoiceData.invoiceNumber}`, 400, 50, { align: "right" });
            doc.text(`Date: ${new Date().toLocaleDateString()}`, 400, 65, { align: "right" });

            // Bill To
            doc.moveDown();
            doc.fillColor("#0f172a").fontSize(14).text("BILL TO:", 50, 120);
            doc.fontSize(12).text(invoiceData.customerName, 50, 140);
            if (invoiceData.customerPhone) doc.fontSize(10).fillColor("#64748b").text(`Tel: ${invoiceData.customerPhone}`, 50, 155);
            doc.fontSize(10).fillColor("#64748b").text(`Payment: ${invoiceData.paymentMethod}`, 50, 170);

            // Table Header
            const tableTop = 220;
            doc.rect(50, tableTop, 500, 25).fill("#f1f5f9");
            doc.fillColor("#475569").fontSize(10).text("PARTICULARS", 60, tableTop + 8);
            doc.text("QTY", 300, tableTop + 8, { width: 50, align: "center" });
            doc.text("PRICE", 380, tableTop + 8, { width: 70, align: "right" });
            doc.text("TOTAL", 470, tableTop + 8, { width: 70, align: "right" });

            // Items
            let position = tableTop + 35;
            doc.fillColor("#0f172a");
            invoiceData.items.forEach(item => {
                doc.text(item.name, 60, position);
                doc.text(item.qty.toString(), 300, position, { width: 50, align: "center" });
                doc.text(`Rs. ${item.price}`, 380, position, { width: 70, align: "right" });
                doc.text(`Rs. ${item.price * item.qty}`, 470, position, { width: 70, align: "right" });
                position += 20;
                doc.moveTo(50, position - 5).lineTo(550, position - 5).strokeColor("#f1f5f9").stroke();
            });

            // Summary
            doc.moveDown();
            doc.fontSize(14).text(`GRAND TOTAL: Rs. ${invoiceData.total}`, 350, position + 30, { width: 200, align: "right" });

            // Footer
            doc.fontSize(10).fillColor("#94a3b8").text("Thank you for choosing Stockly. This is a system-generated invoice.", 50, 750, { align: "center" });

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
};

// Get All Orders (User's orders)
const getAllOrders = async (req, res) => {
    try {
        const { status, date, view, page = 1, limit = 50 } = req.query;

        let query = {};
        // If view is 'customer', show what I BOUGHT.
        // Otherwise, if I'm an admin, show what I SOLD.
        if (view === 'customer') {
            query.customerId = req.user._id;
        } else if (req.user.role === 'admin') {
            query.user = req.user._id;
        } else if (req.user.role === 'customer') {
            query.customerId = req.user._id;
        }

        if (status) {
            query.status = status;
        }
        if (date) {
            query.date = date;
        }

        const orders = await Order.find(query)
            .populate('user', 'name email')
            .populate('customerId', 'name email phone status')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Order.countDocuments(query);

        res.status(200).json({
            success: true,
            data: orders,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get Single Order
const getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.status(200).json({
            success: true,
            data: order
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Create Order
const createOrder = async (req, res) => {
    try {
        req.body.user = req.user._id;
        const order = await Order.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Order created!',
            data: order
        });

        // Trigger notification
        await createNotificationInternal(
            req.user._id,
            'New Order Placed',
            `Order for ${order.product} (Qty: ${order.quantity}) has been recorded.`,
            'info',
            'order'
        );

        // Send Premium Email Alert
        sendEmail({
            email: req.user.email,
            subject: '🔔 New Order Alert',
            message: `A new order has been placed in the system for ${order.product}.`,
            html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
                    <div style="background-color: #2563eb; padding: 30px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🔔 New Order Alert</h1>
                    </div>
                    <div style="padding: 30px; color: #475569;">
                        <p style="font-size: 16px; margin-top: 0;">Hello <strong>${req.user.name}</strong>,</p>
                        <p style="font-size: 15px; line-height: 1.6;">A new order has been placed in the system:</p>
                        
                        <div style="background-color: #f0f7ff; border-radius: 8px; padding: 20px; margin: 25px 0; border: 1px solid #dbeafe;">
                            <p style="margin: 0; font-size: 14px;"><strong>Customer:</strong> ${order.customerName || 'Walk-in'}</p>
                            <p style="margin: 10px 0 0; font-size: 14px;"><strong>Invoice:</strong> ${order.invoiceNumber || 'N/A'}</p>
                            <p style="margin: 10px 0 0; font-size: 14px;"><strong>Product:</strong> ${order.product}</p>
                            <p style="margin: 10px 0 0; font-size: 14px;"><strong>Total Amount:</strong> <span style="font-weight: bold;">Rs. ${Number(order.totalPrice).toFixed(2)}</span></p>
                            <p style="margin: 10px 0 0; font-size: 14px;"><strong>Payment Status:</strong> ${order.status}</p>
                        </div>

                        <p style="font-size: 14px;">Please log in to the admin dashboard to manage this order.</p>

                        <div style="text-align: center; margin-top: 30px;">
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="background-color: #2563eb; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">View Order Details</a>
                        </div>
                    </div>
                    <div style="background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 12px;">
                        <p style="margin: 0;">Stock Inventory System © 2024</p>
                    </div>
                </div>
            `
        }).catch(err => console.log('Order Email Alert Error:', err.message));

        // Log activity
        await logActivity(
            req.user._id,
            'CREATE',
            'Order',
            order._id,
            `Order for ${order.product}`,
            `New order placed by ${order.customerName || 'Guest'} for ${order.product}.`,
            { quantity: order.quantity, totalPrice: order.totalPrice, status: order.status }
        );

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update Order
const updateOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Order updated!',
            data: order
        });

        // 1. Notify Customer if applicable
        if (order.customerId) {
            await createNotificationInternal(
                order.customerId,
                'Order Status Update',
                `Your order (${order.invoiceNumber || order.product}) status is now: ${order.status}.`,
                order.status === 'Cancelled' ? 'warning' : 'info',
                'order'
            ).catch(err => console.log('Customer Notify Error:', err.message));
        }

        // 2. Handle Stock Restoration on Cancellation
        if (order.status === 'Cancelled' && order.productId) {
            const product = await Product.findById(order.productId);
            if (product) {
                product.stock += order.quantity;
                await product.save();
                
                // Notify admin about stock restock
                await createNotificationInternal(
                    req.user._id,
                    'Stock Restored',
                    `Stock for ${product.name} increased by ${order.quantity} due to order cancellation.`,
                    'info',
                    'stock'
                );
            }
        }

        // 3. Log activity
        await logActivity(
            req.user._id,
            'STATUS_CHANGE',
            'Order',
            order._id,
            `Order for ${order.product}`,
            `Updated order status to: ${order.status}${order.status === 'Cancelled' ? ' (Stock Restored)' : ''}.`,
            { status: order.status, customer: order.customerName }
        );

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete Order
const deleteOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Order deleted!'
        });

        // Log activity
        await logActivity(
            req.user._id,
            'DELETE',
            'Order',
            order._id,
            `Order for ${order.product}`,
            `Removed order record for ${order.product} from history.`,
            { customer: order.customerName }
        );

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get Order Stats
const getOrderStats = async (req, res) => {
    try {
        let query = { user: req.user._id };
        // Admin should only see their own orders/stats
        // if (req.user.role === 'admin') {
        //     query = {};
        // }

        const total = await Order.countDocuments(query);
        const pending = await Order.countDocuments({ ...query, status: 'Pending' });
        const delivered = await Order.countDocuments({ ...query, status: 'Delivered' });
        const completed = await Order.countDocuments({ ...query, status: 'Completed' });
        const cancelled = await Order.countDocuments({ ...query, status: 'Cancelled' });

        res.status(200).json({
            success: true,
            data: {
                total,
                pending,
                delivered,
                completed,
                cancelled
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Checkout Order (Multiple items from customer cart)
const checkoutOrder = async (req, res) => {
    try {
        const { items, total, paymentMethod } = req.body; 
        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Cart is empty' });
        }

        const customerId = req.user._id;
        const customerName = req.user.name;
        const customerEmail = req.user.email;
        const customerPhone = req.user.phone || '';

        const date = new Date().toISOString().split("T")[0];

        // Group items by their creator (Admin)
        const itemsByAdmin = {};
        for (const item of items) {
            // 🔎 BROAD ID SUPPORT: Check _id, id, and productId to match any frontend standard
            const lookupId = item._id || item.id || item.productId;
            const product = await Product.findById(lookupId);
            
            if (!product) {
                console.error(`❌ [CHECKOUT FAIL] Product not found in DB: ${JSON.stringify(item)}`);
                return res.status(404).json({ 
                    success: false, 
                    message: `Product matching '${item.name || lookupId}' was not found. Please refresh your cart.` 
                });
            }
            
            if (product.stock < item.qty) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Not enough stock for ${product.name}. Available: ${product.stock}` 
                });
            }

            // ROBUST OWNER DETECTION
            let adminOwnerId = product.createdBy;
            if (!adminOwnerId) {
                const firstAdmin = await User.findOne({ role: 'admin' });
                if (req.user.role === 'admin') {
                    adminOwnerId = req.user._id;
                } else if (firstAdmin) {
                    adminOwnerId = firstAdmin._id;
                } else {
                    adminOwnerId = req.user._id; 
                }
            }

            const adminIdStr = String(adminOwnerId);
            if (!itemsByAdmin[adminIdStr]) {
                itemsByAdmin[adminIdStr] = [];
            }
            itemsByAdmin[adminIdStr].push({
                ...item,
                adminRef: adminOwnerId,
                realProduct: product
            });
        }

        // 🛑 CRITICAL CHECK: Stop if no admins/groups were actually formed
        if (Object.keys(itemsByAdmin).length === 0) {
            console.error(`❌ [CHECKOUT FAIL] No valid admin groups formed for items: ${JSON.stringify(items)}`);
            return res.status(400).json({ success: false, message: 'Could not process order logic. Please contact support.' });
        }

        let allCreatedOrders = [];
        let globalPurchasedItemsText = '';

        // Process each admin group
        for (const adminIdStr in itemsByAdmin) {
            const adminItems = itemsByAdmin[adminIdStr];
            const adminRef = adminItems[0].adminRef;
            const invoiceNumber = 'INV-' + Date.now() + '-' + adminIdStr.slice(-4);
            
            let adminSubtotal = 0;
            let invoiceItemsList = [];

            for (const itemObj of adminItems) {
                const { realProduct, qty, price } = itemObj;

                // 1. Deduct stock
                realProduct.stock -= qty;
                await realProduct.save();

                // 2. Create individual Order record
                const order = await Order.create({
                    product: realProduct.name,
                    productId: realProduct._id,
                    invoiceNumber: invoiceNumber,
                    status: 'Pending',
                    date: date,
                    quantity: qty,
                    totalPrice: price * qty,
                    user: adminRef,            // Admin sees this in Orders tab
                    customerId: customerId,    // Customer link
                    customerName: customerName,
                    customerEmail: customerEmail,
                    customerPhone: customerPhone
                });

            allCreatedOrders.push(order);
            console.log(`🚀 [SUCCESS] Saved Order: ${invoiceNumber} for Admin: ${adminIdStr}`);

            adminSubtotal += price * qty;
            invoiceItemsList.push({
                product: realProduct.name,
                qty: qty,
                price: price
            });
            globalPurchasedItemsText += `
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #edf2f7;">
                        <div style="font-weight: bold; color: #1a202c;">${realProduct.name}</div>
                        <div style="font-size: 11px; color: #718096;">ID: ${realProduct._id.toString().slice(-6).toUpperCase()}</div>
                    </td>
                    <td style="padding: 10px; border-bottom: 1px solid #edf2f7; text-align: center; color: #4a5568;">${qty}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #edf2f7; text-align: right; font-weight: bold; color: #2d3748;">Rs. ${price * qty}</td>
                </tr>
            `;
        }

        // 3. Create Invoice record for this admin
        await Invoice.create({
            invoiceId: invoiceNumber,
            customer: customerName,
            date: date,
            itemsCount: adminItems.length,
            subtotal: adminSubtotal,
            totalAmount: adminSubtotal,
            itemsList: invoiceItemsList,
            createdBy: adminRef, 
            paymentMethod: paymentMethod || 'Cash' 
        });
        console.log(`📄 [SUCCESS] Created Invoice: ${invoiceNumber}`);

        // 4. Notify this specific Admin
        const admin = await User.findById(adminRef);
        if (admin) {
            // Log activity for Admin
            await logActivity(
                admin._id,
                'SALE',
                'Order',
                req.user._id, // Reference the Customer
                `Storefront Sale: ${invoiceNumber}`,
                `Customer ${customerName} purchased ${adminItems.length} items. Total Sale: Rs. ${adminSubtotal}`,
                { invoiceNumber, itemsCount: adminItems.length, total: adminSubtotal }
            ).catch(err => console.log('Log Activity Error:', err.message));

            // Notify this specific Admin (Dashboard Notification)
            // We do this SYNCHRONOUSLY to ensure they see it as soon as they refresh.
            console.log(`🛎️ [NOTIFICATION] Sending alert to Admin: ${admin.email}`);
            await createNotificationInternal(
                admin._id,
                'New Storefront Sale',
                `New order ${invoiceNumber} placed by ${customerName}. Check your orders tab.`,
                'success',
                'order'
            );

            // Notify this specific Admin (Email) - Background Task
            console.log(`📧 [EMAIL] Dispatching sale alert to: ${admin.email}`);
            sendEmail({
                email: admin.email,
                subject: `🛎️ New Order Alert - ${invoiceNumber}`,
                message: `A new order has been placed by ${customerName}.`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #f8fafc;">
                        <div style="background-color: #3b82f6; padding: 25px; text-align: center; color: white;">
                            <h1 style="margin: 0; font-size: 24px;">New Order Received</h1>
                            <p style="margin: 5px 0 0; opacity: 0.9;">Storefront Transaction Notice</p>
                        </div>
                        <div style="padding: 30px; background-color: white;">
                            <p>Hello Admin,</p>
                            <p>You have received a new order from <strong>${customerName}</strong>.</p>
                            <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <p style="margin: 0; font-size: 14px;"><strong>Invoice:</strong> ${invoiceNumber}</p>
                                <p style="margin: 5px 0 0; font-size: 14px;"><strong>Total Value:</strong> Rs. ${adminSubtotal}</p>
                                <p style="margin: 5px 0 0; font-size: 14px;"><strong>Payment:</strong> ${paymentMethod || 'Cash'}</p>
                            </div>
                            <p>Please login to your dashboard to process the shipment.</p>
                            <div style="text-align: center; margin-top: 30px;">
                                <a href="${process.env.FRONTEND_URL}/login" style="background-color: #3b82f6; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Order Details</a>
                            </div>
                        </div>
                    </div>
                `
            }).catch(err => console.error(`❌ [EMAIL FAIL] Admin alert to ${admin.email}:`, err.message));
        } else {
            console.error(`❌ [NOTIF FAIL] Could not find Seller Admin with ID: ${adminRef}`);
        }
    }

        // 5. Send confirmation to Customer (One summary email + PDF Bill)
        await createNotificationInternal(
            customerId,
            'Order Placed Successfully',
            `Congratulations! Your order is placed successfully. Check your email for your digital bill.`,
            'success',
            'order'
        );

        // BACKGROUND TASK: Generate PDF and Send Customer Email
        // We do NOT 'await' this so that the response returns fast.
        (async () => {
            try {
                // 🛑 SAFETY CHECK: Ensure we have created orders to reference
                if (!allCreatedOrders || allCreatedOrders.length === 0) {
                    console.error("❌ [BACKGROUND FAIL] No orders were created, skipping PDF/Email.");
                    return;
                }

                // Generate Consolidated PDF Bill Data
                const masterBillData = {
                    invoiceNumber: allCreatedOrders[0].invoiceNumber,
                    customerName: customerName,
                    customerPhone: customerPhone,
                    paymentMethod: paymentMethod || 'Cash',
                    total: total,
                    items: [] 
                };

                // Collect all items from the request to list them in the master PDF
                for (const item of items) {
                    const lookupId = item._id || item.id || item.productId;
                    const product = await Product.findById(lookupId);
                    if (product) {
                        masterBillData.items.push({
                            name: product.name,
                            qty: item.qty,
                            price: product.price
                        });
                    }
                }

                console.log(`[ACTION] 📄 Background PDF Generation for: ${customerEmail}`);
                const pdfBuffer = await generatePDFBuffer(masterBillData);

                console.log(`[ACTION] 📧 Dispatching FINAL BILL to: ${customerEmail}`);
                await sendEmail({
                    email: customerEmail,
                    subject: `Order Confirmed! - ${masterBillData.invoiceNumber}`,
                    message: `Congratulations! Your order has been placed successfully.`,
                    html: `
                        <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 650px; margin: 20px auto; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden; background-color: #ffffff; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);">
                            <!-- Header -->
                            <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px 30px; text-align: center; color: #ffffff;">
                                <div style="font-size: 32px; font-weight: 800; margin-bottom: 8px;">STOCKLY</div>
                                <h2 style="margin: 0; color: #10b981; font-size: 20px;">Order Confirmed!</h2>
                            </div>
                            
                            <!-- Greeting -->
                            <div style="padding: 30px; border-bottom: 1px solid #f1f5f9; text-align: left;">
                                <h3 style="color: #0f172a; margin-top: 0;">Congratulations!</h3>
                                <p style="color: #475569; line-height: 1.6;">Hello <strong>${customerName}</strong>,</p>
                                <p style="color: #475569; line-height: 1.6;">Your order is placed successfully. Thank you for your order! Here are your details:</p>
                            </div>

                            <!-- Bill Details -->
                            <div style="padding: 30px;">
                                <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; border: 1px solid #f1f5f9;">
                                    <p style="margin: 0; font-size: 14px; color: #64748b;"><strong>Invoice:</strong> ${masterBillData.invoiceNumber}</p>
                                    <p style="margin: 8px 0 0; font-size: 14px; color: #64748b;"><strong>Total Amount:</strong> <span style="color: #0f172a; font-weight: 800; font-size: 18px;">Rs. ${total}</span></p>
                                    <p style="margin: 8px 0 0; font-size: 14px; color: #64748b;"><strong>Payment:</strong> ${paymentMethod || 'Cash'}</p>
                                </div>

                                <!-- List Table Preview -->
                                <h4 style="margin: 25px 0 10px; font-size: 11px; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.1em;">Order Particulars</h4>
                                <table style="width: 100%; border-collapse: collapse;">
                                    <tbody>
                                        ${globalPurchasedItemsText}
                                    </tbody>
                                </table>

                                <div style="margin-top: 30px; padding: 15px; background-color: #ecfdf5; border-radius: 8px; border: 1px solid #cef7e2; color: #065f46; text-align: center; font-size: 14px;">
                                    📎 <strong>A formal PDF copy of your bill is attached to this email.</strong>
                                </div>
                            </div>

                            <!-- Footer -->
                            <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #f1f5f9;">
                                <p style="margin: 0; font-size: 12px; color: #94a3b8;">&copy; 2024 Stockly Cloud Inventory. All rights reserved.</p>
                            </div>
                        </div>
                    `,
                    attachments: [
                        {
                            filename: `Bill_${masterBillData.invoiceNumber}.pdf`,
                            content: pdfBuffer
                        }
                    ]
                });
                console.log(`[VERIFIED] Final Receipt sent in background to: ${customerEmail}`);
            } catch (bgError) {
                console.error(`[CRITICAL] Background Processing Fail for ${customerEmail}:`, bgError.message);
            }
        })();

        res.status(201).json({
            success: true,
            message: 'Order created successfully!',
            data: allCreatedOrders
        });

    } catch (error) {
        console.error("Checkout Error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getAllOrders,
    getOrder,
    createOrder,
    checkoutOrder,
    updateOrder,
    deleteOrder,
    getOrderStats
};