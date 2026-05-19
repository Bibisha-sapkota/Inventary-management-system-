const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Invoice = require('../models/Invoice');
const { createNotificationInternal, notifySuperadmins } = require('./notificationController');
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
        } else if (req.user.role === 'superadmin') {
            query = {};
        } else if (req.user.role === 'admin') {
            query.user = req.user._id;
        } else {
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

        // Auto-link customerId if not provided but email or name matches a customer
        if (!req.body.customerId && (req.body.email || req.body.customerName)) {
            const query = { role: 'customer' };
            if (req.body.email) {
                query.email = req.body.email;
            } else {
                query.name = req.body.customerName;
            }
            const foundCustomer = await User.findOne(query);
            if (foundCustomer) {
                req.body.customerId = foundCustomer._id;
            }
        }

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
        const oldOrder = await Order.findById(req.params.id);
        if (!oldOrder) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        const oldStatus = oldOrder.status;

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

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
        // ONLY restore stock if the old status was 'Invoiced' (stock was deducted)
        if (order.status === 'Cancelled' && oldStatus === 'Invoiced' && order.productId) {
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
            `Updated order status to: ${order.status}${order.status === 'Cancelled' && oldStatus === 'Invoiced' ? ' (Stock Restored)' : ''}.`,
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
        let query = req.user.role === 'superadmin' ? {} : { user: req.user._id };

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
        console.log("📥 [CHECKOUT] Received Checkout Request. Payment Method:", paymentMethod, "Total:", total, "Items Count:", items?.length);
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
                // Product has no owner (added by superadmin) — assign to ALL admins
                const allAdmins = await User.find({ role: 'admin' });
                if (allAdmins.length > 0) {
                    for (const admin of allAdmins) {
                        const adminIdStr = String(admin._id);
                        if (!itemsByAdmin[adminIdStr]) {
                            itemsByAdmin[adminIdStr] = [];
                        }
                        itemsByAdmin[adminIdStr].push({
                            ...item,
                            adminRef: admin._id,
                            realProduct: product,
                            _noOwner: true  // flag: don't deduct stock multiple times
                        });
                    }
                    continue; // skip the default push below
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
            const isPaid = paymentMethod === 'Khalti' || paymentMethod === 'eSewa';
            const alreadyDeductedProducts = new Set();
            
            let adminSubtotal = 0;
            let invoiceItemsList = [];

            for (const itemObj of adminItems) {
                const { realProduct, qty, price, _noOwner } = itemObj;

                // 1. Deduct stock only if paid online, and deduct only once per product
                if (isPaid) {
                    const productKey = String(realProduct._id);
                    if (!_noOwner || !alreadyDeductedProducts.has(productKey)) {
                        realProduct.stock -= qty;
                        await realProduct.save();
                        if (_noOwner) alreadyDeductedProducts.add(productKey);
                    }
                }

                // 2. Create individual Order record
                const order = await Order.create({
                    product: realProduct.name,
                    productId: realProduct._id,
                    invoiceNumber: invoiceNumber,
                    status: isPaid ? 'Invoiced' : 'Pending',
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
                console.log(`🚀 [SUCCESS] Saved Order: ${invoiceNumber} for Admin: ${adminIdStr} (Paid: ${isPaid})`);

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

            // 3. Create Invoice record in DB only if paid online
            if (isPaid) {
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
            }

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

        // 5a. Notify Customer dashboard
        await createNotificationInternal(
            customerId,
            'Order Placed Successfully',
            `Congratulations! Your order is placed successfully. Check your email for your digital bill.`,
            'success',
            'order'
        );

        // 5b. Notify ALL Superadmins (Dashboard notification)
        const grandTotal = allCreatedOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
        await notifySuperadmins(
            '🛒 New Customer Order',
            `Customer ${customerName} placed an order with ${items.length} item(s). Total: Rs. ${grandTotal.toFixed(2)}. Invoice: ${allCreatedOrders[0]?.invoiceNumber || 'N/A'}`,
            'success',
            'order'
        );

        // 5c. Send email alert to all Superadmins
        const superadmins = await User.find({ role: 'superadmin' });
        for (const sa of superadmins) {
            sendEmail({
                email: sa.email,
                subject: `🛒 New Customer Order - ${allCreatedOrders[0]?.invoiceNumber || 'N/A'}`,
                message: `Customer ${customerName} placed a new order.`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #f8fafc;">
                        <div style="background: linear-gradient(135deg, #064e3b 0%, #065f46 100%); padding: 25px; text-align: center; color: white;">
                            <h1 style="margin: 0; font-size: 22px;">🛒 New Customer Order</h1>
                            <p style="margin: 6px 0 0; opacity: 0.85; font-size: 13px;">Superadmin Alert — Stock Inventory System</p>
                        </div>
                        <div style="padding: 30px; background-color: white;">
                            <p style="color: #475569;">Hello <strong>${sa.name}</strong>,</p>
                            <p style="color: #475569;">A new order has been placed by a customer on the storefront.</p>
                            <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 18px; margin: 20px 0;">
                                <p style="margin: 0; font-size: 14px; color: #065f46;"><strong>Customer:</strong> ${customerName}</p>
                                <p style="margin: 8px 0 0; font-size: 14px; color: #065f46;"><strong>Email:</strong> ${customerEmail}</p>
                                <p style="margin: 8px 0 0; font-size: 14px; color: #065f46;"><strong>Invoice:</strong> ${allCreatedOrders[0]?.invoiceNumber || 'N/A'}</p>
                                <p style="margin: 8px 0 0; font-size: 14px; color: #065f46;"><strong>Items:</strong> ${items.length}</p>
                                <p style="margin: 8px 0 0; font-size: 16px; font-weight: bold; color: #064e3b;"><strong>Grand Total: Rs. ${grandTotal.toFixed(2)}</strong></p>
                                <p style="margin: 8px 0 0; font-size: 14px; color: #065f46;"><strong>Payment:</strong> ${paymentMethod || 'Cash'}</p>
                            </div>
                            <div style="text-align: center; margin-top: 25px;">
                                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/superadmin" style="background-color: #059669; color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">View in Superadmin Dashboard</a>
                            </div>
                        </div>
                        <div style="background-color: #f1f5f9; padding: 16px; text-align: center; color: #94a3b8; font-size: 12px;">
                            <p style="margin: 0;">Stock Inventory System © 2024</p>
                        </div>
                    </div>
                `
            }).catch(err => console.error(`❌ [EMAIL FAIL] Superadmin alert to ${sa.email}:`, err.message));
        }

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
                        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 20px auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background-color: #ffffff; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
                            <!-- Header -->
                            <div style="background-color: #0f172a; padding: 40px 20px; text-align: center;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 2px; font-weight: 900;">STOCKLY</h1>
                                <p style="color: #10b981; margin: 10px 0 0; font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Order Confirmed!</p>
                            </div>
                            
                            <!-- Content -->
                            <div style="padding: 40px 30px;">
                                <h2 style="color: #1e293b; margin: 0 0 15px; font-size: 20px; font-weight: 800;">Congratulations!</h2>
                                <p style="color: #64748b; margin: 0; font-size: 15px;">Hello <strong>${customerName}</strong>,</p>
                                <p style="color: #64748b; margin: 5px 0 30px; font-size: 15px; line-height: 1.6;">Your order is placed successfully. Thank you for your order! Here are your details:</p>

                                <!-- Transaction Box -->
                                <div style="background-color: #f8fafc; border-radius: 12px; padding: 25px; margin-bottom: 35px; border: 1px solid #f1f5f9;">
                                    <div style="margin-bottom: 12px; display: flex; justify-content: space-between;">
                                        <span style="color: #94a3b8; font-size: 13px; font-weight: 600; text-transform: uppercase;">Invoice:</span>
                                        <span style="color: #1e293b; font-size: 14px; font-weight: 700;">${masterBillData.invoiceNumber}</span>
                                    </div>
                                    <div style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                                        <span style="color: #94a3b8; font-size: 13px; font-weight: 600; text-transform: uppercase;">Total Amount:</span>
                                        <span style="color: #0f172a; font-size: 20px; font-weight: 900;">Rs. ${Number(total).toFixed(2)}</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between;">
                                        <span style="color: #94a3b8; font-size: 13px; font-weight: 600; text-transform: uppercase;">Payment:</span>
                                        <span style="color: #1e293b; font-size: 14px; font-weight: 700;">${paymentMethod || 'Cash'}</span>
                                    </div>
                                </div>

                                <h3 style="color: #94a3b8; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 15px; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px;">Order Particulars</h3>
                                <table style="width: 100%; border-collapse: collapse;">
                                    <thead>
                                        <tr style="text-align: left; color: #94a3b8; font-size: 11px; font-weight: 800; text-transform: uppercase;">
                                            <th style="padding: 10px 0;">Item</th>
                                            <th style="padding: 10px 0; text-align: center;">Qty</th>
                                            <th style="padding: 10px 0; text-align: right;">Price</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${globalPurchasedItemsText}
                                    </tbody>
                                </table>

                                <!-- Info Box -->
                                <div style="margin-top: 40px; background-color: #ecfdf5; border: 1px solid #d1fae5; border-radius: 10px; padding: 15px; text-align: center; color: #065f46; font-size: 13px; font-weight: 600;">
                                    <span style="margin-right: 8px;">📎</span> A formal PDF copy of your bill is attached to this email.
                                </div>
                            </div>

                            <!-- Footer -->
                            <div style="padding: 30px; text-align: center; background-color: #f8fafc; border-top: 1px solid #f1f5f9;">
                                <p style="margin: 0; color: #94a3b8; font-size: 12px; font-weight: 600;">© 2024 Stockly Cloud Inventory. All rights reserved.</p>
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